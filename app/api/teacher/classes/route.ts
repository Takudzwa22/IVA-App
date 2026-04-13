
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

/**
 * GET /api/teacher/classes?email=...&class_group_id=...
 *
 * Without class_group_id: returns all class groups the teacher is assigned to.
 * With class_group_id: returns the student roster for that specific class group.
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    // Note: searchParams from URL constructor is synchronous and safe in Next.js route handlers
    const teacherEmail = searchParams.get('email');
    const classGroupId = searchParams.get('class_group_id');

    if (!teacherEmail) {
        return NextResponse.json({ error: 'Missing required parameter: email' }, { status: 400 });
    }

    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    // Resolve teacher email → id
    const { data: teacher, error: teacherError } = await supabase
        .from('teachers')
        .select('id')
        .eq('Email', teacherEmail)
        .maybeSingle();

    if (teacherError || !teacher) {
        return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
    }

    if (classGroupId) {
        // Return student roster for the given class group
        const { data: students, error } = await supabase
            .from('student_class_groups')
            .select(`
                students (
                    student_number,
                    first_name,
                    last_name,
                    email,
                    grade,
                    active
                )
            `)
            .eq('class_group_id', classGroupId);

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
        }

        type StudentRow = {
            student_number: number;
            first_name: string;
            last_name: string;
            email: string;
            grade: number;
            active: boolean;
        };

        const roster = (students || [])
            .map(row => (row.students as unknown) as StudentRow | null)
            .filter(Boolean);

        return NextResponse.json({ students: roster });
    }

    // Return all class groups for this teacher
    const { data, error } = await supabase
        .from('teacher_class_groups')
        .select(`
            class_groups (
                id,
                label,
                section,
                subjects ( id, name, code ),
                cohorts ( id, name, grade, academic_year, active )
            )
        `)
        .eq('teacher_id', teacher.id);

    if (error) {
        return NextResponse.json({ error: 'Failed to fetch class groups' }, { status: 500 });
    }

    type ClassGroup = {
        id: string;
        label: string;
        section: string;
        subjects: { id: string; name: string; code: string } | null;
        cohorts: { id: string; name: string; grade: number; academic_year: string; active: boolean } | null;
    };

    const classGroups = (data || [])
        .map(row => (row.class_groups as unknown) as ClassGroup | null)
        .filter(Boolean);

    return NextResponse.json({ class_groups: classGroups });
}
