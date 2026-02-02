'use server';

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

interface Assessment {
    id: string;
    subject_name: string;
    teacher_email: string | null;
    title: string;
    due_date: string;
    max_marks: number | null;
    weighting: number | null;
    is_test: boolean;
    cycle: number;
}

// GET - Fetch assessments for a teacher
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const teacherEmail = searchParams.get('email');
    const subjectName = searchParams.get('subject'); // Optional filter
    const cycle = searchParams.get('cycle'); // Optional filter

    if (!teacherEmail) {
        return NextResponse.json(
            { error: 'Missing required parameter: email' },
            { status: 400 }
        );
    }

    if (!supabaseUrl || !serviceRoleKey) {
        console.warn('[Teacher Assessments API] Supabase not configured - returning mock data');
        return NextResponse.json({
            assessments: [
                {
                    id: 'mock-1',
                    subject_name: 'Mathematics',
                    teacher_email: teacherEmail,
                    title: 'Test 1 - Algebra',
                    due_date: '2026-02-15',
                    max_marks: 100,
                    weighting: 0.25,
                    is_test: true,
                    cycle: 1
                }
            ]
        });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    try {
        let query = supabase
            .from('assessments')
            .select('*')
            .eq('teacher_email', teacherEmail)
            .order('due_date', { ascending: false });

        if (subjectName) {
            query = query.eq('subject_name', subjectName);
        }

        if (cycle) {
            query = query.eq('cycle', parseInt(cycle, 10));
        }

        const { data, error } = await query;

        if (error) {
            console.error('[Teacher Assessments API] Error:', error);
            return NextResponse.json({ error: 'Failed to fetch assessments' }, { status: 500 });
        }

        return NextResponse.json({ assessments: data || [] });

    } catch (error) {
        console.error('[Teacher Assessments API] Unexpected error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}

// POST - Create new assessment
export async function POST(request: NextRequest) {
    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    try {
        const body = await request.json();
        const { subject_name, teacher_email, title, due_date, max_marks, weighting, is_test, cycle } = body;

        if (!subject_name || !teacher_email || !title || !due_date || !cycle) {
            return NextResponse.json(
                { error: 'Missing required fields: subject_name, teacher_email, title, due_date, cycle' },
                { status: 400 }
            );
        }

        const { data, error } = await supabase
            .from('assessments')
            .insert({
                subject_name,
                teacher_email,
                title,
                due_date,
                max_marks: max_marks || null,
                weighting: weighting || null,
                is_test: is_test || false,
                cycle
            })
            .select()
            .single();

        if (error) {
            console.error('[Teacher Assessments API] Create error:', error);
            return NextResponse.json({ error: 'Failed to create assessment' }, { status: 500 });
        }

        return NextResponse.json({ assessment: data }, { status: 201 });

    } catch (error) {
        console.error('[Teacher Assessments API] Unexpected error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}

// PUT - Update existing assessment
export async function PUT(request: NextRequest) {
    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    try {
        const body = await request.json();
        const { id, subject_name, title, due_date, max_marks, weighting, is_test, cycle } = body;

        if (!id) {
            return NextResponse.json({ error: 'Missing required field: id' }, { status: 400 });
        }

        const { data, error } = await supabase
            .from('assessments')
            .update({
                subject_name,
                title,
                due_date,
                max_marks,
                weighting,
                is_test,
                cycle
            })
            .eq('id', id)
            .select()
            .single();

        if (error) {
            console.error('[Teacher Assessments API] Update error:', error);
            return NextResponse.json({ error: 'Failed to update assessment' }, { status: 500 });
        }

        return NextResponse.json({ assessment: data });

    } catch (error) {
        console.error('[Teacher Assessments API] Unexpected error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}

// DELETE - Delete assessment
export async function DELETE(request: NextRequest) {
    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({ error: 'Database not configured' }, { status: 500 });
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey, {
        auth: { autoRefreshToken: false, persistSession: false }
    });

    try {
        const { searchParams } = new URL(request.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: 'Missing required parameter: id' }, { status: 400 });
        }

        // First delete related marks
        await supabase
            .from('assessment_marks')
            .delete()
            .eq('assessment_id', id);

        // Then delete the assessment
        const { error } = await supabase
            .from('assessments')
            .delete()
            .eq('id', id);

        if (error) {
            console.error('[Teacher Assessments API] Delete error:', error);
            return NextResponse.json({ error: 'Failed to delete assessment' }, { status: 500 });
        }

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('[Teacher Assessments API] Unexpected error:', error);
        return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
    }
}
