-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_cohorts ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_class_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_class_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetables ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_headers ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Get current user's role
CREATE OR REPLACE FUNCTION get_user_role()
RETURNS user_role AS $$
    SELECT role FROM users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current user's student_number (if student)
CREATE OR REPLACE FUNCTION get_student_number()
RETURNS INT AS $$
    SELECT student_number FROM user_links WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get current user's teacher_id (if teacher)
CREATE OR REPLACE FUNCTION get_teacher_id()
RETURNS UUID AS $$
    SELECT teacher_id FROM user_links WHERE user_id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Get student's cohort IDs
CREATE OR REPLACE FUNCTION get_student_cohort_ids(student_num INT)
RETURNS UUID[] AS $$
    SELECT ARRAY_AGG(cohort_id) FROM student_cohorts WHERE student_number = student_num;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================================
-- USERS TABLE POLICIES
-- ============================================================================

-- Users can read their own record
CREATE POLICY users_select_own ON users
    FOR SELECT USING (id = auth.uid());

-- Admins can read all users
CREATE POLICY users_select_admin ON users
    FOR SELECT USING (get_user_role() = 'admin');

-- Admins can manage users
CREATE POLICY users_all_admin ON users
    FOR ALL USING (get_user_role() = 'admin');

-- ============================================================================
-- STUDENTS TABLE POLICIES
-- ============================================================================

-- Students can read their own record
CREATE POLICY students_select_own ON students
    FOR SELECT USING (student_number = get_student_number());

-- Teachers can read all students (for class rosters)
CREATE POLICY students_select_teacher ON students
    FOR SELECT USING (get_user_role() = 'teacher');

-- Admins can manage all students
CREATE POLICY students_all_admin ON students
    FOR ALL USING (get_user_role() = 'admin');

-- ============================================================================
-- TEACHERS TABLE POLICIES
-- ============================================================================

-- Teachers can read their own record
CREATE POLICY teachers_select_own ON teachers
    FOR SELECT USING (id = get_teacher_id());

-- Teachers can read all teachers (for collaboration)
CREATE POLICY teachers_select_teacher ON teachers
    FOR SELECT USING (get_user_role() = 'teacher');

-- Students can read teachers (to see instructor info)
CREATE POLICY teachers_select_student ON teachers
    FOR SELECT USING (get_user_role() = 'student');

-- Admins can manage all teachers
CREATE POLICY teachers_all_admin ON teachers
    FOR ALL USING (get_user_role() = 'admin');

-- ============================================================================
-- USER_LINKS TABLE POLICIES
-- ============================================================================

-- Users can read their own link
CREATE POLICY user_links_select_own ON user_links
    FOR SELECT USING (user_id = auth.uid());

-- Admins can manage all links
CREATE POLICY user_links_all_admin ON user_links
    FOR ALL USING (get_user_role() = 'admin');

-- ============================================================================
-- SUBJECTS TABLE POLICIES
-- ============================================================================

-- Everyone can read subjects (public catalog)
CREATE POLICY subjects_select_all ON subjects
    FOR SELECT USING (true);

-- Admins can manage subjects
CREATE POLICY subjects_all_admin ON subjects
    FOR ALL USING (get_user_role() = 'admin');

-- ============================================================================
-- COHORTS TABLE POLICIES
-- ============================================================================

-- Everyone can read active cohorts
CREATE POLICY cohorts_select_all ON cohorts
    FOR SELECT USING (active = true);

-- Admins can manage cohorts
CREATE POLICY cohorts_all_admin ON cohorts
    FOR ALL USING (get_user_role() = 'admin');

-- ============================================================================
-- STUDENT_COHORTS TABLE POLICIES
-- ============================================================================

-- Students can read their own cohort memberships
CREATE POLICY student_cohorts_select_own ON student_cohorts
    FOR SELECT USING (student_number = get_student_number());

-- Teachers can read all (for class rosters)
CREATE POLICY student_cohorts_select_teacher ON student_cohorts
    FOR SELECT USING (get_user_role() = 'teacher');

-- Admins can manage all
CREATE POLICY student_cohorts_all_admin ON student_cohorts
    FOR ALL USING (get_user_role() = 'admin');

-- ============================================================================
-- CLASS_GROUPS TABLE POLICIES
-- ============================================================================

-- Everyone can read active class groups
CREATE POLICY class_groups_select_all ON class_groups
    FOR SELECT USING (active = true);

-- Admins can manage class groups
CREATE POLICY class_groups_all_admin ON class_groups
    FOR ALL USING (get_user_role() = 'admin');

-- ============================================================================
-- STUDENT_CLASS_GROUPS TABLE POLICIES
-- ============================================================================

-- Students can read their own assignments
CREATE POLICY student_class_groups_select_own ON student_class_groups
    FOR SELECT USING (student_number = get_student_number());

-- Teachers can read class group memberships for their classes
CREATE POLICY student_class_groups_select_teacher ON student_class_groups
    FOR SELECT USING (
        get_user_role() = 'teacher' AND
        class_group_id IN (
            SELECT class_group_id FROM teacher_class_groups 
            WHERE teacher_id = get_teacher_id()
        )
    );

-- Admins can manage all
CREATE POLICY student_class_groups_all_admin ON student_class_groups
    FOR ALL USING (get_user_role() = 'admin');

-- ============================================================================
-- TEACHER_CLASS_GROUPS TABLE POLICIES
-- ============================================================================

-- Teachers can read all teacher assignments (for collaboration)
CREATE POLICY teacher_class_groups_select_teacher ON teacher_class_groups
    FOR SELECT USING (get_user_role() = 'teacher');

-- Students can read (to see who teaches their classes)
CREATE POLICY teacher_class_groups_select_student ON teacher_class_groups
    FOR SELECT USING (get_user_role() = 'student');

-- Admins can manage all
CREATE POLICY teacher_class_groups_all_admin ON teacher_class_groups
    FOR ALL USING (get_user_role() = 'admin');

-- ============================================================================
-- TIMETABLES TABLE POLICIES
-- ============================================================================

-- Students can read their own timetable (direct or via cohort)
CREATE POLICY timetables_select_student ON timetables
    FOR SELECT USING (
        get_user_role() = 'student' AND (
            -- Direct ownership (Grade 10+)
            student_number = get_student_number() OR
            -- Cohort ownership (Grade 4-9)
            cohort_id = ANY(get_student_cohort_ids(get_student_number()))
        )
    );

-- Teachers can read all timetables (for scheduling awareness)
CREATE POLICY timetables_select_teacher ON timetables
    FOR SELECT USING (get_user_role() = 'teacher');

-- Admins can manage all timetables
CREATE POLICY timetables_all_admin ON timetables
    FOR ALL USING (get_user_role() = 'admin');

-- ============================================================================
-- TIMETABLE_ENTRIES TABLE POLICIES
-- ============================================================================

-- Students can read entries for timetables they can access
CREATE POLICY timetable_entries_select_student ON timetable_entries
    FOR SELECT USING (
        get_user_role() = 'student' AND
        timetable_id IN (
            SELECT id FROM timetables WHERE
                student_number = get_student_number() OR
                cohort_id = ANY(get_student_cohort_ids(get_student_number()))
        )
    );

-- Teachers can read all entries
CREATE POLICY timetable_entries_select_teacher ON timetable_entries
    FOR SELECT USING (get_user_role() = 'teacher');

-- Admins can manage all entries
CREATE POLICY timetable_entries_all_admin ON timetable_entries
    FOR ALL USING (get_user_role() = 'admin');

-- ============================================================================
-- TIMETABLE_HEADERS TABLE POLICIES
-- ============================================================================

-- Everyone can read headers (public, static data)
CREATE POLICY timetable_headers_select_all ON timetable_headers
    FOR SELECT USING (true);

-- Only admins can modify (should be rare)
CREATE POLICY timetable_headers_all_admin ON timetable_headers
    FOR ALL USING (get_user_role() = 'admin');
