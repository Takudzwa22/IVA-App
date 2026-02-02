import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

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
            return NextResponse.json(
                { error: 'Server configuration error' },
                { status: 500 }
            );
        }

        // Create admin client with service role key (bypasses RLS)
        const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: { autoRefreshToken: false, persistSession: false }
        });

        // Parse grade
        const grade = parseInt(gradeParam, 10);
        const isBritish = gradeParam.toLowerCase().includes('british');
        const hasDetailedTimetable = grade >= 10 && grade <= 12 && !isBritish;

        if (hasDetailedTimetable) {
            // Grades 10, 11, 12: Fetch from timetables_XX + headers
            const tableName = `timetables_${grade}`;

            // Fetch student's timetable row
            const { data: timetableRow, error: timetableError } = await supabase
                .from(tableName)
                .select('*')
                .eq('Student Num', parseInt(studentNumber, 10))
                .maybeSingle();

            if (timetableError) {
                console.error('[Timetable API] Error fetching timetable:', timetableError);
                return NextResponse.json(
                    { error: 'Failed to fetch timetable' },
                    { status: 500 }
                );
            }

            if (!timetableRow) {
                return NextResponse.json(
                    { error: 'Timetable not found for student' },
                    { status: 404 }
                );
            }

            // Fetch period headers
            const { data: headers, error: headersError } = await supabase
                .from('timetable_headers')
                .select('*')
                .order('weekday')
                .order('period_number');

            if (headersError) {
                console.error('[Timetable API] Error fetching headers:', headersError);
                return NextResponse.json(
                    { error: 'Failed to fetch timetable headers' },
                    { status: 500 }
                );
            }

            // Build schedule per day
            const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
            const schedule: Record<string, Array<{
                period_number: number;
                subject: string;
                start_time: string;
                end_time: string;
                code: string;
            }>> = {};

            weekdays.forEach(day => {
                schedule[day] = [];
            });

            // Map period codes to subjects
            for (const header of headers || []) {
                const code = header.code; // e.g., "A1", "B2"
                const subject = timetableRow[code] || null;

                if (subject && weekdays.includes(header.weekday)) {
                    schedule[header.weekday].push({
                        period_number: header.period_number,
                        subject: subject,
                        start_time: header.start_time,
                        end_time: header.end_time,
                        code: code,
                    });
                }
            }

            // Sort each day by period number
            weekdays.forEach(day => {
                schedule[day].sort((a, b) => a.period_number - b.period_number);
            });

            return NextResponse.json({
                type: 'detailed',
                grade,
                studentNumber: parseInt(studentNumber, 10),
                schedule,
            });

        } else {
            // Grades 4-9 and British: Fetch subjects list
            let subjectsTable: string;

            if (isBritish || gradeParam.toLowerCase() === 'british') {
                subjectsTable = 'Subjects_british';
            } else if (grade >= 4 && grade <= 6) {
                subjectsTable = 'Subjects_4_5_6';
            } else if (grade >= 7 && grade <= 9) {
                subjectsTable = 'Subjects_7_8_9';
            } else {
                // Default fallback
                subjectsTable = 'Subjects_4_5_6';
            }

            const { data: subjects, error: subjectsError } = await supabase
                .from(subjectsTable)
                .select('Subject')
                .order('Subject');

            if (subjectsError) {
                console.error('[Timetable API] Error fetching subjects:', subjectsError);
                return NextResponse.json(
                    { error: 'Failed to fetch subjects' },
                    { status: 500 }
                );
            }

            const subjectsList = (subjects || []).map(s => s.Subject);

            return NextResponse.json({
                type: 'simple',
                grade: isBritish ? 'british' : grade,
                studentNumber: parseInt(studentNumber, 10),
                subjects: subjectsList,
            });
        }

    } catch (error) {
        console.error('[Timetable API] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
