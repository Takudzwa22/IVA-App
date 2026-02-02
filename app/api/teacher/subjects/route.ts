'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface TeacherSubject {
    subject_name: string;
}

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const teacherEmail = searchParams.get('email');

    if (!teacherEmail) {
        return NextResponse.json(
            { error: 'Missing required parameter: email' },
            { status: 400 }
        );
    }

    if (!supabaseUrl || !serviceRoleKey) {
        console.warn('[Teacher Subjects API] Supabase not configured - returning mock data');
        return NextResponse.json({
            subjects: [
                { subject_name: 'Mathematics' },
                { subject_name: 'Physical Sciences' },
                { subject_name: 'Life Sciences' }
            ]
        });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    try {
        // Query the teacher_subjects_10 view
        const { data, error } = await supabase
            .from('teacher_subjects_10')
            .select('subject_name')
            .eq('teacher_email', teacherEmail);

        if (error) {
            console.error('[Teacher Subjects API] Error:', error);

            // Fallback: Query assessments table directly if view doesn't exist
            const { data: fallbackData, error: fallbackError } = await supabase
                .from('assessments')
                .select('subject_name')
                .eq('teacher_email', teacherEmail);

            if (fallbackError) {
                return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
            }

            // Get unique subjects
            const uniqueSubjects = Array.from(new Set(fallbackData?.map(a => a.subject_name) || []));
            return NextResponse.json({
                subjects: uniqueSubjects.map(s => ({ subject_name: s }))
            });
        }

        return NextResponse.json({
            subjects: data || []
        });

    } catch (error) {
        console.error('[Teacher Subjects API] Unexpected error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
