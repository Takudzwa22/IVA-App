import { NextRequest, NextResponse } from 'next/server';
import { unstable_cache } from 'next/cache';
import { createClient } from '@supabase/supabase-js';

/**
 * Cached Supabase fetch — revalidates every hour.
 * Cache key includes studentNumber + grade so each student gets their own entry.
 * Tagged so teachers can call revalidateTag('timetable') after timetable changes.
 */
const fetchTimetableFromDB = unstable_cache(
    async (studentNumber: string, gradeParam: string) => {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

        const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });

        const grade = parseInt(gradeParam, 10);
        const isBritish = gradeParam.toLowerCase().includes('british');
        const isSeniorHigh = grade >= 10 && grade <= 12 && !isBritish;
        const isJuniorHigh = grade >= 7 && grade <= 9 && !isBritish;

        const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
        type ScheduleEntry = { period_number: number; subject: string; start_time: string; end_time: string; code: string };

        // Shared helper: build schedule from a timetable row + headers
        const buildSchedule = (
            timetableRow: Record<string, unknown>,
            headers: Array<{ code: string; weekday: string; period_number: number; start_time: string; end_time: string }>,
            lookupKey: (code: string) => string
        ): Record<string, ScheduleEntry[]> => {
            const schedule: Record<string, ScheduleEntry[]> = {};
            weekdays.forEach(day => { schedule[day] = []; });
            for (const header of headers) {
                const subject = (timetableRow[lookupKey(header.code)] as string) || null;
                if (subject && weekdays.includes(header.weekday)) {
                    schedule[header.weekday].push({
                        period_number: header.period_number,
                        subject,
                        start_time: header.start_time,
                        end_time: header.end_time,
                        code: header.code,
                    });
                }
            }
            weekdays.forEach(day => { schedule[day].sort((a, b) => a.period_number - b.period_number); });
            return schedule;
        };

        if (isSeniorHigh) {
            // Grades 10-12: table name = timetables_10/11/12, columns are uppercase (A1, B1…)
            const { data: timetableRow, error: timetableError } = await supabase
                .from(`timetables_${grade}`)
                .select('*')
                .eq('Student Num', parseInt(studentNumber, 10))
                .maybeSingle();

            if (timetableError) throw new Error('Failed to fetch timetable');
            if (!timetableRow) return null;

            const { data: headers, error: headersError } = await supabase
                .from('timetable_headers')
                .select('*')
                .order('weekday')
                .order('period_number');

            if (headersError) throw new Error('Failed to fetch timetable headers');

            const schedule = buildSchedule(timetableRow, headers || [], code => code); // uppercase match
            return { type: 'detailed' as const, grade, studentNumber: parseInt(studentNumber, 10), schedule };

        } else if (isJuniorHigh) {
            // Grades 7-9: look up student's class, then query consolidated timetables_grade{N}
            // Columns in junior high tables are lowercase (a1, b1…) but headers store uppercase codes
            const studentTable = `grade_${grade}_students`;

            const { data: studentRow } = await supabase
                .from(studentTable)
                .select('class')
                .eq('Number', parseInt(studentNumber, 10))
                .maybeSingle();

            const timetableTable = `timetables_grade${grade}`; // consolidated table per grade

            let className: string | null = studentRow?.class ?? null;

            // Fallback for trial students (not in grade tables) — use first available class
            if (!className) {
                const { data: trialStudent } = await supabase
                    .from('trial_students')
                    .select('student_num')
                    .eq('student_num', parseInt(studentNumber, 10))
                    .maybeSingle();

                if (trialStudent) {
                    const { data: firstClass } = await supabase
                        .from(timetableTable)
                        .select('class')
                        .order('class')
                        .limit(1)
                        .maybeSingle();
                    className = firstClass?.class ?? null;
                }
            }

            if (!className) return null;

            const { data: timetableRow, error: timetableError } = await supabase
                .from(timetableTable)
                .select('*')
                .eq('class', className)
                .maybeSingle();

            if (timetableError) throw new Error('Failed to fetch junior high timetable');
            if (!timetableRow) return null;

            // Junior high has 6 periods (A-F), headers store uppercase codes
            // Columns in DB are lowercase → lookup with code.toLowerCase()
            const { data: headers, error: headersError } = await supabase
                .from('timetable_headers')
                .select('*')
                .lte('period_number', 6) // periods 1-6 only (A-F)
                .order('weekday')
                .order('period_number');

            if (headersError) throw new Error('Failed to fetch timetable headers');

            const schedule = buildSchedule(timetableRow, headers || [], code => code.toLowerCase());
            return { type: 'detailed' as const, grade, studentNumber: parseInt(studentNumber, 10), schedule };

        } else {
            let subjectsTable: string;
            if (isBritish || gradeParam.toLowerCase() === 'british') {
                subjectsTable = 'Subjects_british';
            } else if (grade >= 4 && grade <= 6) {
                subjectsTable = 'Subjects_4_5_6';
            } else if (grade >= 7 && grade <= 9) {
                subjectsTable = 'Subjects_7_8_9';
            } else {
                subjectsTable = 'Subjects_4_5_6';
            }

            const { data: subjects, error: subjectsError } = await supabase
                .from(subjectsTable)
                .select('Subject')
                .order('Subject');

            if (subjectsError) throw new Error('Failed to fetch subjects');

            return {
                type: 'simple' as const,
                grade: isBritish ? 'british' : grade,
                studentNumber: parseInt(studentNumber, 10),
                subjects: (subjects || []).map(s => s.Subject),
            };
        }
    },
    ['student-timetable-v2'],
    { revalidate: 3600, tags: ['timetable'] }
);

/**
 * GET /api/student/timetable
 * Fetches timetable data for a student based on their grade
 * - Grades 10, 11, 12: Fetches from timetables_XX with period headers
 * - Grades 4-9 and British: Fetches subject list from Subjects tables
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const studentNumber = searchParams.get('studentNumber');
        const gradeParam = searchParams.get('grade');

        if (!studentNumber || !gradeParam) {
            return NextResponse.json(
                { error: 'studentNumber and grade are required' },
                { status: 400 }
            );
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            const grade = parseInt(gradeParam, 10);
            const isBritish = gradeParam.toLowerCase().includes('british');
            const hasDetailedTimetable = (grade >= 7 && grade <= 12) && !isBritish;

            if (hasDetailedTimetable) {
                return NextResponse.json({
                    type: 'detailed',
                    grade,
                    studentNumber: parseInt(studentNumber, 10),
                    schedule: { Monday: [], Tuesday: [], Wednesday: [], Thursday: [], Friday: [] },
                });
            } else {
                return NextResponse.json({
                    type: 'simple',
                    grade: isBritish ? 'british' : grade,
                    studentNumber: parseInt(studentNumber, 10),
                    subjects: [],
                });
            }
        }

        // Delegate to the server-side cached fetch
        try {
            const data = await fetchTimetableFromDB(studentNumber, gradeParam);
            if (!data) {
                return NextResponse.json({ error: 'Timetable not found for student' }, { status: 404 });
            }
            return NextResponse.json(data);
        } catch (err) {
            console.error('[Timetable API] DB error:', err);
            return NextResponse.json({ error: 'Failed to fetch timetable' }, { status: 500 });
        }

    } catch (error) {
        console.error('[Timetable API] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
