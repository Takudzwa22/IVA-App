'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface CsvRow {
    student_num: number;
    mark_obtained: number;
    comments: string | null;
}

interface UploadResult {
    uploaded: number;
    skipped: number[];
    errors: string[];
}

function parseCsv(text: string): CsvRow[] {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length === 0) return [];

    // Detect and skip header row (first cell is non-numeric)
    let startIdx = 0;
    const firstCell = lines[0].split(',')[0].trim();
    if (isNaN(Number(firstCell)) || firstCell === '') {
        startIdx = 1;
    }

    const rows: CsvRow[] = [];
    for (let i = startIdx; i < lines.length; i++) {
        const cols = lines[i].split(',').map(c => c.trim());
        if (cols.length < 2) continue;

        const studentNum = parseInt(cols[0], 10);
        const mark = parseFloat(cols[1]);

        if (isNaN(studentNum) || isNaN(mark)) continue;

        rows.push({
            student_num: studentNum,
            mark_obtained: mark,
            comments: cols[2] || null,
        });
    }
    return rows;
}

// POST - Upload CSV marks for an assessment
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
        const csvFile = formData.get('csv') as File | null;

        if (!assessmentId || !gradeRaw || !csvFile) {
            return NextResponse.json(
                { error: 'Missing required fields: assessment_id, grade, csv' },
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

        // Parse CSV
        const csvText = await csvFile.text();
        const rows = parseCsv(csvText);

        if (rows.length === 0) {
            return NextResponse.json({ error: 'CSV contains no valid rows' }, { status: 400 });
        }

        // Get valid student numbers for this grade
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

        const validStudentNums = new Set((students || []).map((s: { Number: number }) => s.Number));

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
                result.errors.push(`Failed to insert ${toInsert.length} new marks`);
            } else {
                result.uploaded += toInsert.length;
            }
        }

        return NextResponse.json(result);

    } catch (error) {
        console.error('[CSV Upload API] Unexpected error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
