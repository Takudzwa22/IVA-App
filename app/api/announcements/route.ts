import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabase() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    return createClient(url, key, {
        auth: { autoRefreshToken: false, persistSession: false },
    });
}

/**
 * GET /api/announcements
 * Query params:
 *   - grade (optional): filter announcements targeting this grade
 *   - role  (optional): 'student' | 'teacher' — students see filtered, teachers see all
 */
export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url);
    const grade = searchParams.get('grade');
    const role = searchParams.get('role') || 'student';

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({ announcements: [] });
    }

    const supabase = getSupabase();

    // Fetch active announcements ordered newest first
    const { data, error } = await supabase
        .from('announcements')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

    if (error) {
        console.error('[Announcements API] Error:', error);
        return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
    }

    // Filter out expired announcements in JS (avoids PostgREST .or() parsing issues)
    const now = new Date();
    let announcements = (data || []).filter((a) =>
        !a.expires_at || new Date(a.expires_at) > now
    );

    // For students, filter by grade targeting (trial students also see grade=0 announcements)
    if (role === 'student' && grade) {
        const gradeNum = parseInt(grade, 10);
        const studentNumber = searchParams.get('studentNumber');

        let isTrialStudent = false;
        if (studentNumber) {
            const { data: trialRow } = await supabase
                .from('trial_students')
                .select('student_num')
                .eq('student_num', parseInt(studentNumber, 10))
                .maybeSingle();
            isTrialStudent = !!trialRow;
        }

        announcements = announcements.filter((a) => {
            if (!a.target_grades || a.target_grades.length === 0) return true;
            if (a.target_grades.includes(gradeNum)) return true;
            if (isTrialStudent && a.target_grades.includes(0)) return true;
            return false;
        });
    }

    return NextResponse.json({ announcements });
}

/**
 * POST /api/announcements
 * Body: { title, content, category, priority, target_grades, target_subjects, author_email, author_name, author_role, expires_at }
 */
export async function POST(request: NextRequest) {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 });
    }

    const body = await request.json();
    const { title, content, category, priority, target_grades, target_subjects, author_email, author_name, author_role, expires_at } = body;

    if (!title?.trim() || !content?.trim() || !author_email || !author_name) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Only teachers, admins, headofschool can create — verify email exists in teachers table
    const validRoles = ['teacher', 'admin', 'headofschool'];
    if (!validRoles.includes(author_role)) {
        return NextResponse.json({ error: 'Unauthorized role' }, { status: 403 });
    }

    const supabase = getSupabase();

    // Server-side check: verify author_email belongs to a real teacher
    const { data: teacherRow } = await supabase
        .from('teachers')
        .select('Email')
        .eq('Email', author_email)
        .maybeSingle();

    if (!teacherRow) {
        return NextResponse.json({ error: 'Author not found in teachers table' }, { status: 403 });
    }

    const { data, error } = await supabase
        .from('announcements')
        .insert({
            title: title.trim(),
            content: content.trim(),
            category: category || 'general',
            priority: priority || 'normal',
            target_grades: target_grades && target_grades.length > 0 ? target_grades : null,
            target_subjects: target_subjects && target_subjects.length > 0 ? target_subjects : null,
            author_email,
            author_name,
            author_role: author_role || 'teacher',
            expires_at: expires_at || null,
        })
        .select()
        .single();

    if (error) {
        console.error('[Announcements API] Insert error:', error);
        return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
    }

    return NextResponse.json({ announcement: data });
}
