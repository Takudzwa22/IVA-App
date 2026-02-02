'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Server-side only - uses service role key to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

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

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const studentNumber = searchParams.get('studentNumber');
    const grade = searchParams.get('grade');
    const cycleParam = searchParams.get('cycle');
    const aliasParam = searchParams.get('alias'); // Optional: timetable alias to resolve

    if (!studentNumber || !grade) {
        return NextResponse.json(
            { error: 'Missing required parameters: studentNumber and grade' },
            { status: 400 }
        );
    }

    if (!supabaseUrl || !serviceRoleKey) {
        console.warn('[Assessments API] Supabase not configured - returning mock data');
        return NextResponse.json({
            currentCycle: { id: 'mock', cycle: 1, grade: 10, year: 2026, start_date: '2026-01-01', end_date: '2026-03-31' },
            cycles: [
                { id: 'mock', cycle: 1, grade: 10, year: 2026, start_date: '2026-01-01', end_date: '2026-03-31' },
            ],
            subjects: [
                {
                    subjectName: 'Mathematics',
                    subjectId: 'mock-math',
                    timetableAliases: ['Maths 1', 'Maths 2'],
                    assessments: [
                        {
                            id: 'mock-1',
                            subject_name: 'Mathematics',
                            teacher_email: null,
                            title: 'Test 1 - Algebra',
                            due_date: '2026-02-15',
                            max_marks: 100,
                            weighting: 0.25,
                            is_test: true,
                            cycle: 1,
                            mark: { obtained: 85, isPublished: true, comments: 'Good work!' }
                        }
                    ]
                }
            ],
            resolvedSubject: aliasParam ? 'Mathematics' : null
        });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    const studentNum = parseInt(studentNumber, 10);
    const gradeNum = parseInt(grade, 10);

    try {
        // If alias is provided, resolve it to the canonical subject name first
        let resolvedSubjectName: string | null = null;
        if (aliasParam) {
            const subjectsTable = `Subjects_${gradeNum}`;
            const { data: subjectsData, error: subjectsError } = await supabase
                .from(subjectsTable)
                .select('id, Subject, timetable_aliases');

            if (!subjectsError && subjectsData) {
                // Find subject where alias matches the timetable_aliases array or the Subject name itself
                for (const subj of subjectsData) {
                    const aliases: string[] = subj.timetable_aliases || [];
                    const aliasLower = aliasParam.toLowerCase();

                    // Check if alias matches Subject name or any alias in timetable_aliases
                    if (
                        subj.Subject.toLowerCase() === aliasLower ||
                        aliases.some((a: string) => a.toLowerCase() === aliasLower)
                    ) {
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

        if (cyclesError) {
            console.error('[Assessments API] Error fetching cycles:', cyclesError);
            return NextResponse.json({ error: 'Failed to fetch assessment cycles' }, { status: 500 });
        }

        // 2. Determine current cycle (by date or param)
        const today = new Date().toISOString().split('T')[0];
        let currentCycle: AssessmentCycle | null = null;

        if (cycleParam) {
            currentCycle = cycles?.find((c: AssessmentCycle) => c.cycle === parseInt(cycleParam, 10)) || null;
        } else {
            // Find cycle where today falls between start_date and end_date
            currentCycle = cycles?.find((c: AssessmentCycle) =>
                today >= c.start_date && today <= c.end_date
            ) || cycles?.[0] || null;
        }

        if (!currentCycle) {
            return NextResponse.json({
                currentCycle: null,
                cycles: cycles || [],
                subjects: [],
                resolvedSubject: resolvedSubjectName
            });
        }

        // 3. Get student's enrolled subjects from view
        const viewName = `student_enrolled_subjects_${gradeNum}`;
        const { data: enrolledData, error: enrolledError } = await supabase
            .from(viewName)
            .select('*')
            .eq('student_num', studentNum)
            .single();

        if (enrolledError) {
            console.error('[Assessments API] Error fetching enrolled subjects:', enrolledError);
            // Fallback: return empty subjects if view doesn't exist or student not found
            return NextResponse.json({
                currentCycle,
                cycles: cycles || [],
                subjects: [],
                resolvedSubject: resolvedSubjectName
            });
        }

        const subjectNames: string[] = enrolledData?.subject_names || [];
        const subjectIds: string[] = enrolledData?.subject_ids || [];

        if (subjectNames.length === 0) {
            return NextResponse.json({
                currentCycle,
                cycles: cycles || [],
                subjects: [],
                resolvedSubject: resolvedSubjectName
            });
        }

        // 3.5. Get timetable_aliases for each subject
        const subjectsTable = `Subjects_${gradeNum}`;
        const { data: subjectsWithAliases } = await supabase
            .from(subjectsTable)
            .select('id, Subject, timetable_aliases')
            .in('Subject', subjectNames);

        const aliasesMap = new Map<string, string[]>();
        if (subjectsWithAliases) {
            for (const subj of subjectsWithAliases) {
                aliasesMap.set(subj.Subject, subj.timetable_aliases || []);
            }
        }

        // 4. Get assessments for these subjects in the current cycle
        const { data: assessments, error: assessmentsError } = await supabase
            .from('assessments')
            .select('*')
            .in('subject_name', subjectNames)
            .eq('cycle', currentCycle.cycle)
            .order('due_date', { ascending: true });

        if (assessmentsError) {
            console.error('[Assessments API] Error fetching assessments:', assessmentsError);
            return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
        }

        // 5. Get marks for this student for these assessments
        const assessmentIds = assessments?.map((a: { id: string }) => a.id) || [];
        let marksMap: Map<string, { obtained: number | null; isPublished: boolean; comments: string | null }> = new Map();

        if (assessmentIds.length > 0) {
            const marksTable = `assessment_marks`;
            const { data: marks, error: marksError } = await supabase
                .from(marksTable)
                .select('*')
                .in('assessment_id', assessmentIds)
                .eq('student_num', studentNum);

            if (!marksError && marks) {
                for (const mark of marks) {
                    marksMap.set(mark.assessment_id, {
                        obtained: mark.is_published ? mark.mark_obtained : null,
                        isPublished: mark.is_published,
                        comments: mark.is_published ? mark.teacher_comments : null
                    });
                }
            }
        }

        // 6. Build response grouped by subject
        const subjectsResponse: SubjectAssessments[] = subjectNames.map((subjectName, idx) => {
            const subjectAssessments = (assessments || [])
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
                    mark: marksMap.get(a.id) || null
                }));

            return {
                subjectName,
                subjectId: subjectIds[idx] || '',
                timetableAliases: aliasesMap.get(subjectName) || [],
                assessments: subjectAssessments
            };
        });

        return NextResponse.json({
            currentCycle,
            cycles: cycles || [],
            subjects: subjectsResponse,
            resolvedSubject: resolvedSubjectName
        });

    } catch (error) {
        console.error('[Assessments API] Unexpected error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
