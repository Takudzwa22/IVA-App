import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Grade tables to search for students
const STUDENT_GRADES = [4, 5, 7, 8, 9, 10, 11, 12, 'british'] as const;

/**
 * POST /api/auth/verify-email
 * Verifies if an email exists in the student or teacher tables
 * Uses service role key to bypass RLS
 */
export async function POST(request: NextRequest) {
    try {
        const { email } = await request.json();

        if (!email) {
            return NextResponse.json({ error: 'Email is required' }, { status: 400 });
        }

        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
            console.error('[Auth API] Missing Supabase credentials');
            return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
        }

        // Create admin client with service role key (bypasses RLS)
        const supabase = createClient(supabaseUrl, serviceRoleKey, {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        });

        const trimmedEmail = email.trim().toLowerCase();

        // Check if it's a student email (number@ivaschool.online)
        if (trimmedEmail.endsWith('@ivaschool.online')) {
            const numberPart = trimmedEmail.replace('@ivaschool.online', '');
            const studentNumber = parseInt(numberPart, 10);

            if (!isNaN(studentNumber) && studentNumber > 0) {
                // Search all grade tables for the student
                for (const grade of STUDENT_GRADES) {
                    const tableName = grade === 'british'
                        ? 'grade_british_students'
                        : `grade_${grade}_students`;

                    const { data, error } = await supabase
                        .from(tableName)
                        .select('*')
                        .eq('Number', studentNumber)
                        .maybeSingle();

                    if (!error && data) {
                        console.log('[Auth API] Found student in', tableName);
                        return NextResponse.json({
                            type: 'student',
                            data: {
                                student_number: data.Number,
                                first_name: data.Name || '',
                                last_name: data.Surname || '',
                                full_name: data['Full Name'] || undefined,
                                grade: data.Grade,
                                user_role: data.user_role || 'student',
                            }
                        });
                    }
                }
            }
        }

        // Check teacher table by email
        const { data: teacher, error: teacherError } = await supabase
            .from('teachers')
            .select('*')
            .eq('Email', trimmedEmail)
            .maybeSingle();

        if (!teacherError && teacher) {
            console.log('[Auth API] Found teacher');
            return NextResponse.json({
                type: 'teacher',
                data: teacher
            });
        }

        // Not found
        return NextResponse.json({ error: 'Email not found' }, { status: 404 });

    } catch (error) {
        console.error('[Auth API] Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
