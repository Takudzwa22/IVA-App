-- ============================================================================
-- IVA APP DATABASE SCHEMA
-- Version: 1.0
-- Description: Users, Academics, and Timetables (excluding assignments/grades)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. ENUMS
-- ============================================================================

CREATE TYPE user_role AS ENUM ('admin', 'teacher', 'student');

-- ============================================================================
-- 2. USERS & ACCESS
-- ============================================================================

-- Users table (linked to Supabase auth.users)
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Students table
CREATE TABLE students (
    student_number INT PRIMARY KEY CHECK (student_number BETWEEN 100000 AND 999999),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    grade INT NOT NULL CHECK (grade BETWEEN 4 AND 12),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Teachers table
CREATE TABLE teachers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    first_name TEXT NOT NULL,
    last_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Links: bridges auth.users to domain entities
CREATE TABLE user_links (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    student_number INT REFERENCES students(student_number) ON DELETE SET NULL,
    teacher_id UUID REFERENCES teachers(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Exactly one of student_number OR teacher_id must be set (admins have neither)
    CONSTRAINT valid_link CHECK (
        (student_number IS NOT NULL AND teacher_id IS NULL) OR
        (student_number IS NULL AND teacher_id IS NOT NULL) OR
        (student_number IS NULL AND teacher_id IS NULL)
    )
);

-- ============================================================================
-- 3. ACADEMICS
-- ============================================================================

-- Subjects catalog
CREATE TABLE subjects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Cohorts: ONLY for Grades 4-9
CREATE TABLE cohorts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade INT NOT NULL CHECK (grade BETWEEN 4 AND 9),
    name TEXT NOT NULL,                    -- e.g. "Grade 6 A"
    academic_year TEXT NOT NULL,           -- e.g. "2025"
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE (grade, name, academic_year)
);

-- Student-Cohort membership (Grades 4-9 only)
CREATE TABLE student_cohorts (
    student_number INT REFERENCES students(student_number) ON DELETE CASCADE,
    cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (student_number, cohort_id)
);

-- Class groups: handles section splits (e.g., English M/N/ALL)
CREATE TABLE class_groups (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,  -- NULL for Grade 10+
    label TEXT NOT NULL,                   -- "English M", "Maths ALL"
    section TEXT NOT NULL DEFAULT 'ALL',   -- "M", "N", "ALL"
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student-ClassGroup assignment
CREATE TABLE student_class_groups (
    student_number INT REFERENCES students(student_number) ON DELETE CASCADE,
    class_group_id UUID REFERENCES class_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (student_number, class_group_id)
);

-- Teacher-ClassGroup assignment
CREATE TABLE teacher_class_groups (
    teacher_id UUID REFERENCES teachers(id) ON DELETE CASCADE,
    class_group_id UUID REFERENCES class_groups(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    PRIMARY KEY (teacher_id, class_group_id)
);

-- ============================================================================
-- 4. TIMETABLES (Conditional Ownership)
-- ============================================================================

-- Timetables: owned by EITHER cohort (4-9) OR student (10+), never both
CREATE TABLE timetables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    grade INT NOT NULL CHECK (grade BETWEEN 4 AND 12),
    academic_year TEXT NOT NULL,
    cohort_id UUID REFERENCES cohorts(id) ON DELETE CASCADE,
    student_number INT REFERENCES students(student_number) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- HARD CONSTRAINT: conditional ownership based on grade
    CONSTRAINT timetable_ownership CHECK (
        (grade BETWEEN 4 AND 9 AND cohort_id IS NOT NULL AND student_number IS NULL) OR
        (grade >= 10 AND student_number IS NOT NULL AND cohort_id IS NULL)
    )
);

-- Unique constraints for ownership
CREATE UNIQUE INDEX idx_timetables_cohort ON timetables(cohort_id, academic_year) 
    WHERE cohort_id IS NOT NULL;
CREATE UNIQUE INDEX idx_timetables_student ON timetables(student_number, academic_year) 
    WHERE student_number IS NOT NULL;

-- ============================================================================
-- 5. TIMETABLE CONTENT (Excel-Faithful)
-- ============================================================================

-- Timetable entries: one row = one complete timetable (flat structure)
CREATE TABLE timetable_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    timetable_id UUID NOT NULL REFERENCES timetables(id) ON DELETE CASCADE,
    
    -- Monday periods (A1-I1)
    "A1" TEXT, "B1" TEXT, "C1" TEXT, "D1" TEXT, "E1" TEXT, "F1" TEXT, "G1" TEXT, "H1" TEXT, "I1" TEXT,
    -- Tuesday periods (A2-I2)
    "A2" TEXT, "B2" TEXT, "C2" TEXT, "D2" TEXT, "E2" TEXT, "F2" TEXT, "G2" TEXT, "H2" TEXT, "I2" TEXT,
    -- Wednesday periods (A3-I3)
    "A3" TEXT, "B3" TEXT, "C3" TEXT, "D3" TEXT, "E3" TEXT, "F3" TEXT, "G3" TEXT, "H3" TEXT, "I3" TEXT,
    -- Thursday periods (A4-I4)
    "A4" TEXT, "B4" TEXT, "C4" TEXT, "D4" TEXT, "E4" TEXT, "F4" TEXT, "G4" TEXT, "H4" TEXT, "I4" TEXT,
    -- Friday periods (A5-I5)
    "A5" TEXT, "B5" TEXT, "C5" TEXT, "D5" TEXT, "E5" TEXT, "F5" TEXT, "G5" TEXT, "H5" TEXT, "I5" TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE (timetable_id)
);

-- Timetable headers: static period-to-time mapping (seed data, never changes)
CREATE TABLE timetable_headers (
    code TEXT PRIMARY KEY,         -- A1, B1, C1, etc.
    weekday TEXT NOT NULL,         -- Monday, Tuesday, etc.
    period_number INT NOT NULL,    -- 1, 2, 3, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

-- ============================================================================
-- 6. INDEXES FOR PERFORMANCE
-- ============================================================================

-- Users & Access
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_students_grade ON students(grade);
CREATE INDEX idx_students_active ON students(active);
CREATE INDEX idx_teachers_active ON teachers(active);
CREATE INDEX idx_user_links_student ON user_links(student_number) WHERE student_number IS NOT NULL;
CREATE INDEX idx_user_links_teacher ON user_links(teacher_id) WHERE teacher_id IS NOT NULL;

-- Academics
CREATE INDEX idx_cohorts_grade ON cohorts(grade);
CREATE INDEX idx_cohorts_academic_year ON cohorts(academic_year);
CREATE INDEX idx_cohorts_active ON cohorts(active);
CREATE INDEX idx_class_groups_subject ON class_groups(subject_id);
CREATE INDEX idx_class_groups_cohort ON class_groups(cohort_id) WHERE cohort_id IS NOT NULL;
CREATE INDEX idx_student_cohorts_cohort ON student_cohorts(cohort_id);
CREATE INDEX idx_student_class_groups_group ON student_class_groups(class_group_id);
CREATE INDEX idx_teacher_class_groups_group ON teacher_class_groups(class_group_id);

-- Timetables
CREATE INDEX idx_timetables_grade ON timetables(grade);
CREATE INDEX idx_timetables_academic_year ON timetables(academic_year);

-- ============================================================================
-- 7. UPDATED_AT TRIGGERS
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_students_updated_at
    BEFORE UPDATE ON students
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_teachers_updated_at
    BEFORE UPDATE ON teachers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_cohorts_updated_at
    BEFORE UPDATE ON cohorts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_class_groups_updated_at
    BEFORE UPDATE ON class_groups
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_timetables_updated_at
    BEFORE UPDATE ON timetables
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_timetable_entries_updated_at
    BEFORE UPDATE ON timetable_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ============================================================================
-- 8. COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE users IS 'Auth users with role assignment';
COMMENT ON TABLE students IS 'Student entity with 6-digit student_number PK';
COMMENT ON TABLE teachers IS 'Teacher entity';
COMMENT ON TABLE user_links IS 'Links auth.users to students or teachers (admins have neither)';
COMMENT ON TABLE subjects IS 'Subject catalog (e.g., English, Maths)';
COMMENT ON TABLE cohorts IS 'Class cohorts for Grades 4-9 only';
COMMENT ON TABLE student_cohorts IS 'M:N relationship between students and cohorts';
COMMENT ON TABLE class_groups IS 'Subject sections with M/N/ALL splits';
COMMENT ON TABLE timetables IS 'Timetable ownership: cohort (4-9) OR student (10+)';
COMMENT ON TABLE timetable_entries IS 'Flat timetable content with A1-I5 period columns';
COMMENT ON TABLE timetable_headers IS 'Static period code to time mapping';

COMMENT ON CONSTRAINT timetable_ownership ON timetables IS 
    'Grade 4-9: cohort_id required, student_number NULL. Grade 10+: student_number required, cohort_id NULL';
