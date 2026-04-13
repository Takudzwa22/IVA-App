import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import * as XLSX from 'xlsx';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface MarkRow {
    student_num: number;
    mark_obtained: number;
    comments: string | null;
}

interface UploadResult {
    uploaded: number;
    skipped: number[];
    errors: string[];
}

function parseXlsx(buffer: ArrayBuffer): MarkRow[] {
    const workbook = XLSX.read(buffer, { type: 'array' });
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const raw: unknown[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

    if (raw.length === 0) return [];

    // Skip header row if first cell is non-numeric
    const startIdx = (isNaN(Number(raw[0][0])) || raw[0][0] === '') ? 1 : 0;

    const rows: MarkRow[] = [];
    for (let i = startIdx; i < raw.length; i++) {
        const row = raw[i] as unknown[];
        const studentNum = parseInt(String(row[0]), 10);
        const mark = parseFloat(String(row[1]));
        if (isNaN(studentNum) || isNaN(mark)) continue;
        rows.push({
            student_num: studentNum,
            mark_obtained: mark,
            comments: row[2] ? String(row[2]).trim() : null,
        });
    }
    return rows;
}

// POST - Upload XLSX marks for an assessment
export async function POST(request: NextRequest) {
    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    try {
        const formData = await request.formData();
        const assessmentId = formData.get('assessment_id') as string | null;
        const gradeRaw = formData.get('grade') as string | null;
        const csvFile = (formData.get('file') ?? formData.get('xlsx') ?? formData.get('csv')) as File | null;

        if (!assessmentId || !gradeRaw || !csvFile) {
            return NextResponse.json(
                { error: 'Missing required fields: assessment_id, grade, file' },
                { status: 400 }
            );
        }

        const grade = parseInt(gradeRaw, 10);
        if (isNaN(grade)) {
            return NextResponse.json({ error: 'Invalid grade value' }, { status: 400 });
        }

        // Verify assessment exists
        const { data: assessment, error: assessmentError } = await supabase
            .from('assessments')
            .select('id, grade')
            .eq('id', assessmentId)
            .single();

        if (assessmentError || !assessment) {
            return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
        }

        // Parse XLSX
        const buffer = await csvFile.arrayBuffer();
        const rows = parseXlsx(buffer);

        if (rows.length === 0) {
            return NextResponse.json({ error: 'File contains no valid rows' }, { status: 400 });
        }

        // Get valid student numbers for this grade (grade 0 = trial students)
        let validStudentNums: Set<number>;
        if (grade === 0) {
            const { data: trialStudents, error: trialError } = await supabase
                .from('trial_students')
                .select('student_num');
            if (trialError) {
                return NextResponse.json(
                    { error: 'Failed to fetch trial students' },
                    { status: 500 }
                );
            }
            validStudentNums = new Set((trialStudents || []).map((s: { student_num: number }) => s.student_num));
        } else {
            const gradeTable = `grade_${grade}_students`;
            const { data: students, error: studentsError } = await supabase
                .from(gradeTable)
                .select('"Number"');
            if (studentsError) {
                return NextResponse.json(
                    { error: `Failed to fetch students for grade ${grade}` },
                    { status: 500 }
                );
            }
            validStudentNums = new Set((students || []).map((s: { Number: number }) => s.Number));
        }

        // Separate matched vs unmatched rows
        const matched = rows.filter(r => validStudentNums.has(r.student_num));
        const skipped = rows
            .filter(r => !validStudentNums.has(r.student_num))
            .map(r => r.student_num);

        const result: UploadResult = { uploaded: 0, skipped, errors: [] };

        if (matched.length === 0) {
            return NextResponse.json({ ...result, errors: ['No student numbers matched this grade'] });
        }

        // Upsert marks (check existing, then insert/update)
        const { data: existingMarks } = await supabase
            .from('assessment_marks')
            .select('id, student_num')
            .eq('assessment_id', assessmentId);

        const existingMap = new Map(
            (existingMarks || []).map((m: { id: string; student_num: number }) => [m.student_num, m.id])
        );

        const toUpdate = matched.filter(r => existingMap.has(r.student_num));
        const toInsert = matched.filter(r => !existingMap.has(r.student_num));

        // Update existing marks
        for (const row of toUpdate) {
            const markId = existingMap.get(row.student_num)!;
            const { error } = await supabase
                .from('assessment_marks')
                .update({
                    mark_obtained: row.mark_obtained,
                    teacher_comments: row.comments,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', markId);

            if (error) {
                result.errors.push(`Failed to update mark for student ${row.student_num}`);
            } else {
                result.uploaded++;
            }
        }

        // Insert new marks
        if (toInsert.length > 0) {
            const { error } = await supabase
                .from('assessment_marks')
                .insert(
                    toInsert.map(r => ({
                        assessment_id: assessmentId,
                        student_num: r.student_num,
                        mark_obtained: r.mark_obtained,
                        teacher_comments: r.comments,
                        is_published: false,
                    }))
                );

            if (error) {
                console.error('[XLSX Upload] Insert error:', JSON.stringify(error));
                result.errors.push(`Failed to insert ${toInsert.length} new marks: ${error.message}`);
            } else {
                result.uploaded += toInsert.length;
            }
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('[XLSX Upload] Unexpected error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
