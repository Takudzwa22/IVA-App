import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

interface AttendanceRecord {
    date: string;
    subject: string;
    status: 'present' | 'absent' | 'late' | 'excused' | 'blocked' | 'cycle_test';
}

/**
 * GET /api/student/attendance
 * Fetches attendance records for a student from the submissions table
 */
export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const studentNumber = searchParams.get('studentNumber');

        if (!studentNumber) {
            return NextResponse.json(
                { error: 'studentNumber is required' },
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

        const studentNum = parseInt(studentNumber, 10);

        // Fetch all submissions where student number is in student_numbers array
        // We use the @> (contains) operator to check if the array contains the value
        const { data: submissions, error } = await supabase
            .from('submissions')
            .select('date, subject_name, present_students, absent_students, late_students, excused_students, blocked_students, cycle_test_students')
            .contains('student_numbers', [studentNum])
            .order('date', { ascending: false });

        if (error) {
            console.error('[Attendance API] Error:', error);
            return NextResponse.json(
                { error: 'Failed to fetch attendance' },
                { status: 500 }
            );
        }

        // Process submissions to extract student's attendance status
        const records: AttendanceRecord[] = [];

        for (const submission of submissions || []) {
            let status: AttendanceRecord['status'] = 'present';

            if ((submission.absent_students || []).includes(studentNum)) {
                status = 'absent';
            } else if ((submission.late_students || []).includes(studentNum)) {
                status = 'late';
            } else if ((submission.excused_students || []).includes(studentNum)) {
                status = 'excused';
            } else if ((submission.blocked_students || []).includes(studentNum)) {
                status = 'blocked';
            } else if ((submission.cycle_test_students || []).includes(studentNum)) {
                status = 'cycle_test';
            } else if ((submission.present_students || []).includes(studentNum)) {
                status = 'present';
            }

            records.push({
                date: submission.date,
                subject: submission.subject_name || 'Unknown Subject',
                status,
            });
        }

        // Calculate summary
        const total = records.length;
        const presentCount = records.filter(r => r.status === 'present').length;
        const absentCount = records.filter(r => r.status === 'absent').length;
        const lateCount = records.filter(r => r.status === 'late').length;
        const excusedCount = records.filter(r => r.status === 'excused').length;
        const blockedCount = records.filter(r => r.status === 'blocked').length;

        const attendancePercentage = total > 0 ? Math.round((presentCount / total) * 100) : 100;

        return NextResponse.json({
            records,
            summary: {
                total,
                present: presentCount,
                absent: absentCount,
                late: lateCount,
                excused: excusedCount,
                blocked: blockedCount,
                attendancePercentage,
            }
        });

    } catch (error) {
        console.error('[Attendance API] Error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
