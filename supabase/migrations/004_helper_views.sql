-- ============================================================================
-- HELPER VIEWS FOR COMMON QUERIES
-- NULL periods are shown as 'Free' via COALESCE
-- ============================================================================

-- ============================================================================
-- STUDENT TIMETABLE VIEW
-- Resolves timetable ownership (cohort vs direct) automatically
-- NULL entries are replaced with 'Free'
-- ============================================================================

CREATE OR REPLACE VIEW student_timetable_view AS
SELECT 
    s.student_number,
    s.first_name,
    s.last_name,
    s.grade,
    t.id AS timetable_id,
    t.academic_year,
    -- Timetable entry columns with NULL -> 'Free' conversion
    COALESCE(te."A1", 'Free') AS "A1", COALESCE(te."B1", 'Free') AS "B1", COALESCE(te."C1", 'Free') AS "C1",
    COALESCE(te."D1", 'Free') AS "D1", COALESCE(te."E1", 'Free') AS "E1", COALESCE(te."F1", 'Free') AS "F1",
    COALESCE(te."G1", 'Free') AS "G1", COALESCE(te."H1", 'Free') AS "H1", COALESCE(te."I1", 'Free') AS "I1",
    COALESCE(te."A2", 'Free') AS "A2", COALESCE(te."B2", 'Free') AS "B2", COALESCE(te."C2", 'Free') AS "C2",
    COALESCE(te."D2", 'Free') AS "D2", COALESCE(te."E2", 'Free') AS "E2", COALESCE(te."F2", 'Free') AS "F2",
    COALESCE(te."G2", 'Free') AS "G2", COALESCE(te."H2", 'Free') AS "H2", COALESCE(te."I2", 'Free') AS "I2",
    COALESCE(te."A3", 'Free') AS "A3", COALESCE(te."B3", 'Free') AS "B3", COALESCE(te."C3", 'Free') AS "C3",
    COALESCE(te."D3", 'Free') AS "D3", COALESCE(te."E3", 'Free') AS "E3", COALESCE(te."F3", 'Free') AS "F3",
    COALESCE(te."G3", 'Free') AS "G3", COALESCE(te."H3", 'Free') AS "H3", COALESCE(te."I3", 'Free') AS "I3",
    COALESCE(te."A4", 'Free') AS "A4", COALESCE(te."B4", 'Free') AS "B4", COALESCE(te."C4", 'Free') AS "C4",
    COALESCE(te."D4", 'Free') AS "D4", COALESCE(te."E4", 'Free') AS "E4", COALESCE(te."F4", 'Free') AS "F4",
    COALESCE(te."G4", 'Free') AS "G4", COALESCE(te."H4", 'Free') AS "H4", COALESCE(te."I4", 'Free') AS "I4",
    COALESCE(te."A5", 'Free') AS "A5", COALESCE(te."B5", 'Free') AS "B5", COALESCE(te."C5", 'Free') AS "C5",
    COALESCE(te."D5", 'Free') AS "D5", COALESCE(te."E5", 'Free') AS "E5", COALESCE(te."F5", 'Free') AS "F5",
    COALESCE(te."G5", 'Free') AS "G5", COALESCE(te."H5", 'Free') AS "H5", COALESCE(te."I5", 'Free') AS "I5",
    CASE 
        WHEN t.cohort_id IS NOT NULL THEN 'cohort'
        ELSE 'personal'
    END AS ownership_type,
    c.name AS cohort_name
FROM students s
LEFT JOIN student_cohorts sc ON s.student_number = sc.student_number
LEFT JOIN timetables t ON (
    -- Grade 10+: direct ownership
    (s.grade >= 10 AND t.student_number = s.student_number)
    OR
    -- Grade 4-9: cohort ownership
    (s.grade BETWEEN 4 AND 9 AND t.cohort_id = sc.cohort_id)
)
LEFT JOIN timetable_entries te ON te.timetable_id = t.id
LEFT JOIN cohorts c ON t.cohort_id = c.id
WHERE s.active = true;

-- ============================================================================
-- TODAY'S SCHEDULE VIEW
-- Shows periods for today based on current weekday
-- Subject will be 'Free' for empty periods (via student_timetable_view)
-- ============================================================================

CREATE OR REPLACE VIEW todays_schedule_view AS
WITH today_periods AS (
    SELECT 
        code,
        period_number,
        start_time,
        end_time
    FROM timetable_headers
    WHERE weekday = TO_CHAR(CURRENT_DATE, 'FMDay')  -- Monday, Tuesday, etc.
)
SELECT 
    stv.student_number,
    stv.first_name,
    stv.last_name,
    stv.grade,
    tp.period_number,
    tp.start_time,
    tp.end_time,
    CASE tp.code
        WHEN 'A1' THEN stv."A1" WHEN 'B1' THEN stv."B1" WHEN 'C1' THEN stv."C1"
        WHEN 'D1' THEN stv."D1" WHEN 'E1' THEN stv."E1" WHEN 'F1' THEN stv."F1"
        WHEN 'G1' THEN stv."G1" WHEN 'H1' THEN stv."H1" WHEN 'I1' THEN stv."I1"
        WHEN 'A2' THEN stv."A2" WHEN 'B2' THEN stv."B2" WHEN 'C2' THEN stv."C2"
        WHEN 'D2' THEN stv."D2" WHEN 'E2' THEN stv."E2" WHEN 'F2' THEN stv."F2"
        WHEN 'G2' THEN stv."G2" WHEN 'H2' THEN stv."H2" WHEN 'I2' THEN stv."I2"
        WHEN 'A3' THEN stv."A3" WHEN 'B3' THEN stv."B3" WHEN 'C3' THEN stv."C3"
        WHEN 'D3' THEN stv."D3" WHEN 'E3' THEN stv."E3" WHEN 'F3' THEN stv."F3"
        WHEN 'G3' THEN stv."G3" WHEN 'H3' THEN stv."H3" WHEN 'I3' THEN stv."I3"
        WHEN 'A4' THEN stv."A4" WHEN 'B4' THEN stv."B4" WHEN 'C4' THEN stv."C4"
        WHEN 'D4' THEN stv."D4" WHEN 'E4' THEN stv."E4" WHEN 'F4' THEN stv."F4"
        WHEN 'G4' THEN stv."G4" WHEN 'H4' THEN stv."H4" WHEN 'I4' THEN stv."I4"
        WHEN 'A5' THEN stv."A5" WHEN 'B5' THEN stv."B5" WHEN 'C5' THEN stv."C5"
        WHEN 'D5' THEN stv."D5" WHEN 'E5' THEN stv."E5" WHEN 'F5' THEN stv."F5"
        WHEN 'G5' THEN stv."G5" WHEN 'H5' THEN stv."H5" WHEN 'I5' THEN stv."I5"
        ELSE 'Free'
    END AS subject
FROM student_timetable_view stv
CROSS JOIN today_periods tp
ORDER BY stv.student_number, tp.period_number;

-- ============================================================================
-- GRADE 10+ SUBJECTS VIEW
-- Derives subjects from personal timetable entries
-- ============================================================================

CREATE OR REPLACE VIEW student_subjects_view AS
SELECT DISTINCT
    s.student_number,
    s.first_name,
    s.last_name,
    s.grade,
    unnest(ARRAY[
        te."A1", te."B1", te."C1", te."D1", te."E1", te."F1", te."G1", te."H1", te."I1",
        te."A2", te."B2", te."C2", te."D2", te."E2", te."F2", te."G2", te."H2", te."I2",
        te."A3", te."B3", te."C3", te."D3", te."E3", te."F3", te."G3", te."H3", te."I3",
        te."A4", te."B4", te."C4", te."D4", te."E4", te."F4", te."G4", te."H4", te."I4",
        te."A5", te."B5", te."C5", te."D5", te."E5", te."F5", te."G5", te."H5", te."I5"
    ]) AS subject
FROM students s
JOIN timetables t ON t.student_number = s.student_number
JOIN timetable_entries te ON te.timetable_id = t.id
WHERE s.grade >= 10 
  AND s.active = true;

-- Filter out nulls, 'Free', and common non-subjects
CREATE OR REPLACE VIEW student_subjects_clean_view AS
SELECT 
    student_number,
    first_name,
    last_name,
    grade,
    subject
FROM student_subjects_view
WHERE subject IS NOT NULL 
  AND subject NOT IN ('Free', 'Break', 'Lunch', 'Assembly', 'Cycle Test', '')
ORDER BY student_number, subject;

-- ============================================================================
-- COHORT ROSTER VIEW
-- ============================================================================

CREATE OR REPLACE VIEW cohort_roster_view AS
SELECT 
    c.id AS cohort_id,
    c.name AS cohort_name,
    c.grade,
    c.academic_year,
    s.student_number,
    s.first_name,
    s.last_name,
    s.email
FROM cohorts c
JOIN student_cohorts sc ON sc.cohort_id = c.id
JOIN students s ON s.student_number = sc.student_number
WHERE c.active = true AND s.active = true
ORDER BY c.grade, c.name, s.last_name, s.first_name;

-- ============================================================================
-- TEACHER CLASS ASSIGNMENTS VIEW
-- ============================================================================

CREATE OR REPLACE VIEW teacher_classes_view AS
SELECT 
    t.id AS teacher_id,
    t.first_name,
    t.last_name,
    t.email AS teacher_email,
    cg.id AS class_group_id,
    cg.label AS class_label,
    cg.section,
    sub.code AS subject_code,
    sub.name AS subject_name,
    c.name AS cohort_name,
    c.grade,
    c.academic_year
FROM teachers t
JOIN teacher_class_groups tcg ON tcg.teacher_id = t.id
JOIN class_groups cg ON cg.id = tcg.class_group_id
JOIN subjects sub ON sub.id = cg.subject_id
LEFT JOIN cohorts c ON c.id = cg.cohort_id
WHERE t.active = true AND cg.active = true
ORDER BY t.last_name, c.grade, sub.name;
