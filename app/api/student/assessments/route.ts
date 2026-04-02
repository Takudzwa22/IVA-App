import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

interface AssessmentWithMark {
    id: string;
    subject_name: string;
    teacher_email: string | null;
    title: string;
    due_date: string;
    max_marks: number | null;
    weighting: number | null;
    is_test: boolean;
    cycle: number;
    mark: {
        obtained: number | null;
        isPublished: boolean;
        comments: string | null;
    } | null;
}

interface SubjectAssessments {
    subjectName: string;
    subjectId: string;
    timetableAliases: string[];
    assessments: AssessmentWithMark[];
}

interface AssessmentCycle {
    id: string;
    cycle: number;
    grade: number;
    year: number;
    start_date: string;
    end_date: string;
}

/**
 * Cached Supabase fetch — revalidates every 5 minutes.
 * Cache key includes studentNumber + grade + cycle so each combination has its own entry.
 * Tagged so calling revalidateTag('assessments') busts all student assessment caches,
 * or revalidateTag(`assessments-${studentNumber}`) for a single student.
 */
const fetchAssessmentsFromDB = unstable_cache(
    async (studentNumber: string, grade: string, cycleParam: string | null, aliasParam: string | null) => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });

        const studentNum = parseInt(studentNumber, 10);
        const gradeNum = parseInt(grade, 10);

        // Resolve timetable alias if provided
        let resolvedSubjectName: string | null = null;
        if (aliasParam) {
            const { data: subjectsData } = await supabase
                .from(`Subjects_${gradeNum}`)
                .select('id, Subject, timetable_aliases');
            if (subjectsData) {
                for (const subj of subjectsData) {
                    const aliases: string[] = subj.timetable_aliases || [];
                    const aliasLower = aliasParam.toLowerCase();
                    if (subj.Subject.toLowerCase() === aliasLower || aliases.some((a: string) => a.toLowerCase() === aliasLower)) {
                        resolvedSubjectName = subj.Subject;
                        break;
                    }
                }
            }
        }

        // 1. Get all cycles for this grade
        const { data: cycles, error: cyclesError } = await supabase
            .from('assessment_cycles')
            .select('*')
            .eq('grade', gradeNum)
            .order('cycle', { ascending: true });

        if (cyclesError) throw new Error('Failed to fetch assessment cycles');

        // 2. Determine current cycle
        const today = new Date().toISOString().split('T')[0];
        let currentCycle: AssessmentCycle | null = null;
        if (cycleParam) {
            currentCycle = cycles?.find((c: AssessmentCycle) => c.cycle === parseInt(cycleParam, 10)) || null;
        } else {
            currentCycle = cycles?.find((c: AssessmentCycle) => today >= c.start_date && today <= c.end_date) || cycles?.[0] || null;
        }

        if (!currentCycle) {
            return { currentCycle: null, cycles: cycles || [], subjects: [], resolvedSubject: resolvedSubjectName };
        }

        // 3. Get enrolled subjects
        const { data: enrolledData, error: enrolledError } = await supabase
            .from(`student_enrolled_subjects_${gradeNum}`)
            .select('*')
            .eq('student_num', studentNum)
            .single();

        if (enrolledError) {
            return { currentCycle, cycles: cycles || [], subjects: [], resolvedSubject: resolvedSubjectName };
        }

        const subjectNames: string[] = enrolledData?.subject_names || [];
        const subjectIds: string[] = enrolledData?.subject_ids || [];

        if (subjectNames.length === 0) {
            return { currentCycle, cycles: cycles || [], subjects: [], resolvedSubject: resolvedSubjectName };
        }

        // 4. Get timetable aliases for each subject
        const { data: subjectsWithAliases } = await supabase
            .from(`Subjects_${gradeNum}`)
            .select('id, Subject, timetable_aliases')
            .in('Subject', subjectNames);

        const aliasesMap = new Map<string, string[]>();
        if (subjectsWithAliases) {
            for (const subj of subjectsWithAliases) {
                aliasesMap.set(subj.Subject, subj.timetable_aliases || []);
            }
        }

        // 5. Get assessments for current cycle
        const { data: assessments, error: assessmentsError } = await supabase
            .from('assessments')
            .select('*')
            .in('subject_name', subjectNames)
            .eq('cycle', currentCycle.cycle)
            .order('due_date', { ascending: true });

        if (assessmentsError) throw new Error('Failed to fetch assessments');

        // 6. Get marks for this student
        const assessmentIds = assessments?.map((a: { id: string }) => a.id) || [];
        const marksMap = new Map<string, { obtained: number | null; isPublished: boolean; comments: string | null }>();

        if (assessmentIds.length > 0) {
            const { data: marks } = await supabase
                .from('assessment_marks')
                .select('*')
                .in('assessment_id', assessmentIds)
                .eq('student_num', studentNum);

            if (marks) {
                for (const mark of marks) {
                    marksMap.set(mark.assessment_id, {
                        obtained: mark.is_published ? mark.mark_obtained : null,
                        isPublished: mark.is_published,
                        comments: mark.is_published ? mark.teacher_comments : null,
                    });
                }
            }
        }

        // 7. Build response grouped by subject
        const subjectsResponse: SubjectAssessments[] = subjectNames.map((subjectName, idx) => ({
            subjectName,
            subjectId: subjectIds[idx] || '',
            timetableAliases: aliasesMap.get(subjectName) || [],
            assessments: (assessments || [])
                .filter((a: { subject_name: string }) => a.subject_name === subjectName)
                .map((a: { id: string; subject_name: string; teacher_email: string | null; title: string; due_date: string; max_marks: number | null; weighting: number | null; is_test: boolean; cycle: number }): AssessmentWithMark => ({
                    id: a.id,
                    subject_name: a.subject_name,
                    teacher_email: a.teacher_email,
                    title: a.title,
                    due_date: a.due_date,
                    max_marks: a.max_marks,
                    weighting: a.weighting,
                    is_test: a.is_test,
                    cycle: a.cycle,
                    mark: marksMap.get(a.id) || null,
                })),
        }));

        return { currentCycle, cycles: cycles || [], subjects: subjectsResponse, resolvedSubject: resolvedSubjectName };
    },
    ['student-assessments'],
    { revalidate: 300, tags: ['assessments'] } // 5-minute server cache
);

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const studentNumber = searchParams.get('studentNumber');
    const grade = searchParams.get('grade');
    const cycleParam = searchParams.get('cycle');
    const aliasParam = searchParams.get('alias');

    if (!studentNumber || !grade) {
        return NextResponse.json(
            { error: 'Missing required parameters: studentNumber and grade' },
            { status: 400 }
        );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Dev fallback — no Supabase credentials
    if (!supabaseUrl || !serviceRoleKey) {
        console.warn('[Assessments API] Supabase not configured - returning empty data');
        return NextResponse.json({
            currentCycle: { id: 'mock', cycle: 1, grade: 10, year: 2026, start_date: '2026-01-01', end_date: '2026-03-31' },
            cycles: [{ id: 'mock', cycle: 1, grade: 10, year: 2026, start_date: '2026-01-01', end_date: '2026-03-31' }],
            subjects: [],
            resolvedSubject: null,
        });
    }

    try {
        const data = await fetchAssessmentsFromDB(studentNumber, grade, cycleParam, aliasParam);
        return NextResponse.json(data);
    } catch (error) {
        console.error('[Assessments API] Unexpected error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
