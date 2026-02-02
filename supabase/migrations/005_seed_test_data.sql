-- ============================================================================
-- SEED DATA: Test Students (Grade 10)
-- First 3 students from Grade 10 Timetable CSV
-- ============================================================================

-- Insert test students (Grade 10 = personal timetables, not cohort-based)
INSERT INTO students (student_number, first_name, last_name, email, grade, active) VALUES
(100001, 'Hadassah', 'Adams', '100001@ivaschool.online', 10, true),
(100002, 'Ella', 'Van Der Merwe', '100002@ivaschool.online', 10, true),
(100003, 'Hlalumi', 'Qina', '100003@ivaschool.online', 10, true);

-- Insert timetables for Grade 10 students (personal ownership)
INSERT INTO timetables (id, grade, academic_year, cohort_id, student_number) VALUES
('11111111-1111-1111-1111-111111111111', 10, '2025', NULL, 100001),
('22222222-2222-2222-2222-222222222222', 10, '2025', NULL, 100002),
('33333333-3333-3333-3333-333333333333', 10, '2025', NULL, 100003);

-- ============================================================================
-- Student 1: Hadassah Adams
-- CSV row: Physical Science,Physical Science,Cycle Test,Physical Science,English All,,Afrikaans,,Afrikaans,All Life Science,Mathematics,Mathematics,,Mathematics,Mathematics All,Life Orientation,English,English,English,Afrikaans All,,Life Science,All Physical Science,Life Science,,Further focus Physical Science,History,,History,History All,,,Assembly,,,,,,,,,,,,,
-- ============================================================================
INSERT INTO timetable_entries (
    id, timetable_id,
    "A1", "A2", "A3", "A4", "A5",
    "B1", "B2", "B3", "B4", "B5",
    "C1", "C2", "C3", "C4", "C5",
    "D1", "D2", "D3", "D4", "D5",
    "E1", "E2", "E3", "E4", "E5",
    "F1", "F2", "F3", "F4", "F5",
    "G1", "G2", "G3", "G4", "G5",
    "H1", "H2", "H3", "H4", "H5",
    "I1", "I2", "I3", "I4", "I5"
) VALUES (
    'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    '11111111-1111-1111-1111-111111111111',
    -- A1-A5 (Period 1: Mon-Fri)
    'Physical Science', 'Physical Science', 'Cycle Test', 'Physical Science', 'English All',
    -- B1-B5 (Period 2: Mon-Fri)
    NULL, 'Afrikaans', NULL, 'Afrikaans', 'All Life Science',
    -- C1-C5 (Period 3: Mon-Fri)
    'Mathematics', 'Mathematics', NULL, 'Mathematics', 'Mathematics All',
    -- D1-D5 (Period 4: Mon-Fri)
    'Life Orientation', 'English', 'English', 'English', 'Afrikaans All',
    -- E1-E5 (Period 5: Mon-Fri)
    NULL, 'Life Science', 'All Physical Science', 'Life Science', NULL,
    -- F1-F5 (Period 6: Mon-Fri)
    'Further focus Physical Science', 'History', NULL, 'History', 'History All',
    -- G1-G5 (Period 7: Mon-Fri)
    NULL, NULL, 'Assembly', NULL, NULL,
    -- H1-H5 (Period 8: Mon-Fri)
    NULL, NULL, NULL, NULL, NULL,
    -- I1-I5 (Period 9: Mon-Fri)
    NULL, NULL, NULL, NULL, NULL
);

-- ============================================================================
-- Student 2: Ella Van Der Merwe
-- CSV row: Life Orientation,,Cycle Test,Afrikaans,English All,Afrikaans,English,English,English,All Life Science,,,,,All Math Lit,Math Literacy,Math Literacy,Math Literacy,Tourism,Afrikaans All,,Life Science,,Life Science,,,History,,History,History All,,,Assembly,,,Tourism,,,,,,,,,,
-- ============================================================================
INSERT INTO timetable_entries (
    id, timetable_id,
    "A1", "A2", "A3", "A4", "A5",
    "B1", "B2", "B3", "B4", "B5",
    "C1", "C2", "C3", "C4", "C5",
    "D1", "D2", "D3", "D4", "D5",
    "E1", "E2", "E3", "E4", "E5",
    "F1", "F2", "F3", "F4", "F5",
    "G1", "G2", "G3", "G4", "G5",
    "H1", "H2", "H3", "H4", "H5",
    "I1", "I2", "I3", "I4", "I5"
) VALUES (
    'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    '22222222-2222-2222-2222-222222222222',
    -- A1-A5 (Period 1: Mon-Fri)
    'Life Orientation', NULL, 'Cycle Test', 'Afrikaans', 'English All',
    -- B1-B5 (Period 2: Mon-Fri)
    'Afrikaans', 'English', 'English', 'English', 'All Life Science',
    -- C1-C5 (Period 3: Mon-Fri)
    NULL, NULL, NULL, NULL, 'All Math Lit',
    -- D1-D5 (Period 4: Mon-Fri)
    'Math Literacy', 'Math Literacy', 'Math Literacy', 'Tourism', 'Afrikaans All',
    -- E1-E5 (Period 5: Mon-Fri)
    NULL, 'Life Science', NULL, 'Life Science', NULL,
    -- F1-F5 (Period 6: Mon-Fri)
    NULL, 'History', NULL, 'History', 'History All',
    -- G1-G5 (Period 7: Mon-Fri)
    NULL, NULL, 'Assembly', NULL, NULL,
    -- H1-H5 (Period 8: Mon-Fri)
    NULL, NULL, NULL, NULL, 'Tourism',
    -- I1-I5 (Period 9: Mon-Fri)
    NULL, NULL, NULL, NULL, NULL
);

-- ============================================================================
-- Student 3: Hlalumi Qina
-- CSV row: Afrikaans,Afrikaans,Cycle Test,,English All,All Business,Business Studies,Economics,Business Studies,Life Orientation,IT,IT,,IT,All Math Lit,Math Literacy,Math Literacy,Math Literacy,,Afrikaans All,English,English,,English,,,History,,History,History All,Economics,,Assembly,Economics,,,,,,,,,,,,
-- ============================================================================
INSERT INTO timetable_entries (
    id, timetable_id,
    "A1", "A2", "A3", "A4", "A5",
    "B1", "B2", "B3", "B4", "B5",
    "C1", "C2", "C3", "C4", "C5",
    "D1", "D2", "D3", "D4", "D5",
    "E1", "E2", "E3", "E4", "E5",
    "F1", "F2", "F3", "F4", "F5",
    "G1", "G2", "G3", "G4", "G5",
    "H1", "H2", "H3", "H4", "H5",
    "I1", "I2", "I3", "I4", "I5"
) VALUES (
    'cccccccc-cccc-cccc-cccc-cccccccccccc',
    '33333333-3333-3333-3333-333333333333',
    -- A1-A5 (Period 1: Mon-Fri)
    'Afrikaans', 'Afrikaans', 'Cycle Test', NULL, 'English All',
    -- B1-B5 (Period 2: Mon-Fri)
    'All Business', 'Business Studies', 'Economics', 'Business Studies', 'Life Orientation',
    -- C1-C5 (Period 3: Mon-Fri)
    'IT', 'IT', NULL, 'IT', 'All Math Lit',
    -- D1-D5 (Period 4: Mon-Fri)
    'Math Literacy', 'Math Literacy', 'Math Literacy', NULL, 'Afrikaans All',
    -- E1-E5 (Period 5: Mon-Fri)
    'English', 'English', NULL, 'English', NULL,
    -- F1-F5 (Period 6: Mon-Fri)
    NULL, 'History', NULL, 'History', 'History All',
    -- G1-G5 (Period 7: Mon-Fri)
    'Economics', NULL, 'Assembly', 'Economics', NULL,
    -- H1-H5 (Period 8: Mon-Fri)
    NULL, NULL, NULL, NULL, NULL,
    -- I1-I5 (Period 9: Mon-Fri)
    NULL, NULL, NULL, NULL, NULL
);

-- ============================================================================
-- Verification query (run after seeding)
-- ============================================================================
-- SELECT 
--     s.student_number, 
--     s.first_name, 
--     s.last_name,
--     te."A1" as "Mon P1",
--     te."B1" as "Mon P2",
--     te."C1" as "Mon P3"
-- FROM students s
-- JOIN timetables t ON t.student_number = s.student_number
-- JOIN timetable_entries te ON te.timetable_id = t.id
-- WHERE s.grade = 10;
