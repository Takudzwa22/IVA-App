
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const teacherEmail = searchParams.get('email');
    // Note: searchParams from URL constructor is synchronous and safe in Next.js route handlers

    if (!teacherEmail) {
        return NextResponse.json(
            { error: 'Missing required parameter: email' },
            { status: 400 }
        );
    }

    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    try {
        // 1. Resolve teacher email → id
        const { data: teacher, error: teacherError } = await supabase
            .from('teachers')
            .select('id')
            .eq('Email', teacherEmail)
            .maybeSingle();

        if (teacherError || !teacher) {
            return NextResponse.json({ error: 'Teacher not found' }, { status: 404 });
        }

        // 2. Fetch subjects via teacher_class_groups → class_groups → subjects
        const { data, error } = await supabase
            .from('teacher_class_groups')
            .select(`
                class_groups (
                    id,
                    label,
                    section,
                    subjects ( id, name, code ),
                    cohorts ( id, name, grade, academic_year )
                )
            `)
            .eq('teacher_id', teacher.id);

        if (error) {
            return NextResponse.json({ error: 'Failed to fetch subjects' }, { status: 500 });
        }

        // Deduplicate subjects (teacher may teach same subject across sections)
        const subjectMap = new Map<string, { subject_id: string; subject_name: string; subject_code: string; class_groups: { id: string; label: string; grade: number; academic_year: string }[] }>();

        type ClassGroupRow = {
            id: string;
            label: string;
            section: string;
            subjects: { id: string; name: string; code: string } | null;
            cohorts: { id: string; name: string; grade: number; academic_year: string } | null;
        };

        for (const row of (data || [])) {
            const cg = (row.class_groups as unknown) as ClassGroupRow | null;
            if (!cg?.subjects) continue;

            const subjectId = cg.subjects.id;
            if (!subjectMap.has(subjectId)) {
                subjectMap.set(subjectId, {
                    subject_id: subjectId,
                    subject_name: cg.subjects.name,
                    subject_code: cg.subjects.code,
                    class_groups: []
                });
            }
            subjectMap.get(subjectId)!.class_groups.push({
                id: cg.id,
                label: cg.label,
                grade: cg.cohorts?.grade ?? 0,
                academic_year: cg.cohorts?.academic_year ?? ''
            });
        }

        return NextResponse.json({
            subjects: Array.from(subjectMap.values())
        });

    } catch (error) {
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
