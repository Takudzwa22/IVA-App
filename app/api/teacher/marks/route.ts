'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface StudentMark {
    student_num: number;
    student_name: string;
    mark_id: string | null;
    mark_obtained: number | null;
    teacher_comments: string | null;
    is_published: boolean;
}

// GET - Fetch students and their marks for an assessment
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const assessmentId = searchParams.get('assessmentId');

    if (!assessmentId) {
        return NextResponse.json(
            { error: 'Missing required parameter: assessmentId' },
            { status: 400 }
        );
    }

    if (!supabaseUrl || !serviceRoleKey) {
        console.warn('[Teacher Marks API] Supabase not configured - returning mock data');
        return NextResponse.json({
            students: [
                { student_num: 12345, student_name: 'John Doe', mark_id: null, mark_obtained: null, teacher_comments: null, is_published: false },
                { student_num: 12346, student_name: 'Jane Smith', mark_id: 'mock-1', mark_obtained: 85, teacher_comments: 'Good work!', is_published: true }
            ]
        });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    try {
        // Get students from grade_10_students and their marks
        const { data: students, error: studentsError } = await supabase
            .from('grade_10_students')
            .select('"Number", "Full Name", "Name", "Surname"')
            .order('"Surname"', { ascending: true });

        if (studentsError) {
            console.error('[Teacher Marks API] Students error:', studentsError);
            return NextResponse.json({ error: 'Failed to fetch students' }, { status: 500 });
        }

        // Get marks for this assessment
        const { data: marks, error: marksError } = await supabase
            .from('assessment_marks')
            .select('*')
            .eq('assessment_id', assessmentId);

        if (marksError) {
            console.error('[Teacher Marks API] Marks error:', marksError);
        }

        // Combine students with their marks
        const marksMap = new Map(marks?.map(m => [m.student_num, m]) || []);

        const result: StudentMark[] = (students || []).map(s => {
            const mark = marksMap.get(s.Number);
            return {
                student_num: s.Number,
                student_name: s['Full Name'] || `${s.Name} ${s.Surname}`,
                mark_id: mark?.id || null,
                mark_obtained: mark?.mark_obtained || null,
                teacher_comments: mark?.teacher_comments || null,
                is_published: mark?.is_published || false
            };
        });

        return NextResponse.json({ students: result });

    } catch (error) {
        console.error('[Teacher Marks API] Unexpected error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}

// POST - Create or update a mark
export async function POST(request: NextRequest) {
    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    try {
        const body = await request.json();
        const { assessment_id, student_num, mark_obtained, teacher_comments, is_published } = body;

        if (!assessment_id || !student_num) {
            return NextResponse.json(
                { error: 'Missing required fields: assessment_id, student_num' },
                { status: 400 }
            );
        }

        // Check if mark already exists
        const { data: existing } = await supabase
            .from('assessment_marks')
            .select('id')
            .eq('assessment_id', assessment_id)
            .eq('student_num', student_num)
            .single();

        if (existing) {
            // Update existing mark
            const { data, error } = await supabase
                .from('assessment_marks')
                .update({
                    mark_obtained,
                    teacher_comments,
                    is_published: is_published || false,
                    updated_at: new Date().toISOString()
                })
                .eq('id', existing.id)
                .select()
                .single();

            if (error) {
                console.error('[Teacher Marks API] Update error:', error);
                return NextResponse.json({ error: 'Failed to update mark' }, { status: 500 });
            }

            return NextResponse.json({ mark: data });
        } else {
            // Create new mark
            const { data, error } = await supabase
                .from('assessment_marks')
                .insert({
                    assessment_id,
                    student_num,
                    mark_obtained,
                    teacher_comments,
                    is_published: is_published || false
                })
                .select()
                .single();

            if (error) {
                console.error('[Teacher Marks API] Create error:', error);
                return NextResponse.json({ error: 'Failed to create mark' }, { status: 500 });
            }

            return NextResponse.json({ mark: data }, { status: 201 });
        }

    } catch (error) {
        console.error('[Teacher Marks API] Unexpected error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}

// PUT - Bulk update marks (publish/unpublish all)
export async function PUT(request: NextRequest) {
    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    try {
        const body = await request.json();
        const { assessment_id, is_published } = body;

        if (!assessment_id || is_published === undefined) {
            return NextResponse.json(
                { error: 'Missing required fields: assessment_id, is_published' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('assessment_marks')
            .update({
                is_published,
                updated_at: new Date().toISOString()
            })
            .eq('assessment_id', assessment_id)
            .select();

        if (error) {
            console.error('[Teacher Marks API] Bulk update error:', error);
            return NextResponse.json({ error: 'Failed to update marks' }, { status: 500 });
        }

        return NextResponse.json({ updated: data?.length || 0 });

    } catch (error) {
        console.error('[Teacher Marks API] Unexpected error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
