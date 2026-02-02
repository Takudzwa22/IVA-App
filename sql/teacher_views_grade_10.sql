-- ============================================================================
-- TEACHER VIEWS FOR GRADE 10
-- ============================================================================

-- View: teacher_subjects_10
-- Shows all subjects a teacher teaches in Grade 10, based on assessments table
-- Primary use: Teacher dashboard to display their subjects

CREATE OR REPLACE VIEW teacher_subjects_10 AS
SELECT DISTINCT 
    t."Email" AS teacher_email,
    t."Name" AS teacher_name,
    t."Surname" AS teacher_surname,
    t."Full name" AS teacher_full_name,
    a.subject_name
FROM teachers t
INNER JOIN assessments a ON a.teacher_email = t."Email"
WHERE a.cycle IN (
    SELECT cycle FROM assessment_cycles WHERE grade = 10
)
ORDER BY t."Email", a.subject_name;

-- Example usage:
-- SELECT * FROM teacher_subjects_10 WHERE teacher_email = 'teacher@school.com';


-- View: teacher_assessments_10
-- Shows all assessments for Grade 10 that a teacher is responsible for
-- Includes cycle info for filtering

CREATE OR REPLACE VIEW teacher_assessments_10 AS
SELECT 
    a.id AS assessment_id,
    a.subject_name,
    a.teacher_email,
    t."Full name" AS teacher_name,
    a.title,
    a.due_date,
    a.max_marks,
    a.weighting,
    a.is_test,
    a.cycle,
    ac.year AS cycle_year,
    ac.start_date AS cycle_start,
    ac.end_date AS cycle_end
FROM assessments a
LEFT JOIN teachers t ON t."Email" = a.teacher_email
INNER JOIN assessment_cycles ac ON ac.cycle = a.cycle AND ac.grade = 10
ORDER BY a.due_date DESC;

-- Example usage:
-- SELECT * FROM teacher_assessments_10 WHERE teacher_email = 'teacher@school.com';


-- View: teacher_gradebook_10
-- Shows students and their marks for a teacher's assessments in Grade 10
-- Used for grading interface

CREATE OR REPLACE VIEW teacher_gradebook_10 AS
SELECT 
    a.id AS assessment_id,
    a.subject_name,
    a.teacher_email,
    a.title AS assessment_title,
    a.max_marks,
    a.due_date,
    a.is_test,
    a.cycle,
    s."Number" AS student_num,
    s."Full Name" AS student_name,
    s."Name" AS student_first_name,
    s."Surname" AS student_surname,
    am.id AS mark_id,
    am.mark_obtained,
    am.teacher_comments,
    am.is_published,
    am.created_at AS mark_created_at,
    am.updated_at AS mark_updated_at
FROM assessments a
INNER JOIN assessment_cycles ac ON ac.cycle = a.cycle AND ac.grade = 10
CROSS JOIN grade_10_students s
LEFT JOIN assessment_marks am ON am.assessment_id = a.id AND am.student_num = s."Number"
ORDER BY a.due_date, s."Surname", s."Name";

-- Example usage:
-- SELECT * FROM teacher_gradebook_10 
-- WHERE teacher_email = 'teacher@school.com' 
-- AND subject_name = 'Mathematics';
