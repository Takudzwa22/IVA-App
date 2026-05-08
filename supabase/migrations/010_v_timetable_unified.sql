-- ============================================================================
-- 010_v_timetable_unified.sql
-- Unified timetable read view for Plan B mobile schedule screen.
--
-- Mobile queries: .eq('student_num', N).eq('day', D).order('period')
--
-- Column mapping (from timetable_headers seed in 002_seed_timetable_headers.sql):
--   Column letter A=period 1, B=period 2, C=period 3, D=period 4, E=period 5,
--                 F=period 6, G=period 7, H=period 8, I=period 9
--   Column digit  1=Monday, 2=Tuesday, 3=Wednesday, 4=Thursday, 5=Friday
--   (day int: 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri — matches digit suffix)
--
-- Senior High (grades 10-12):
--   Tables: timetables_10, timetables_11, timetables_12
--   PK: "Student Num" (int), columns UPPERCASE A1..I5
--   J1..J5 columns exist in the DB schema but have no rows in timetable_headers
--   and are not used by the web route — excluded from this view.
--
-- Junior High (grades 7-9):
--   Tables: timetables_grade7, timetables_grade8, timetables_grade9
--   PK: class (text), columns lowercase a1..f5 (only periods 1-6 / A-F)
--   Student→class join via grade_X_students."Number" = student_num
--
-- British students: no dedicated timetable table — excluded from view.
-- teacher and room: not stored in any timetable table — returned as NULL.
-- ============================================================================

create or replace view public.v_timetable_unified as

  -- ========================================================================
  -- SENIOR HIGH: Grade 10
  -- 9 periods × 5 days = 45 legs
  -- ========================================================================

  -- Monday (day=1), periods 1-9
  select "Student Num"::int as student_num, 10 as grade, 1 as day, 1 as period, "A1" as subject_code, null::text as teacher, null::text as room from public.timetables_10 where "A1" is not null
  union all
  select "Student Num"::int, 10, 1, 2, "B1", null::text, null::text from public.timetables_10 where "B1" is not null
  union all
  select "Student Num"::int, 10, 1, 3, "C1", null::text, null::text from public.timetables_10 where "C1" is not null
  union all
  select "Student Num"::int, 10, 1, 4, "D1", null::text, null::text from public.timetables_10 where "D1" is not null
  union all
  select "Student Num"::int, 10, 1, 5, "E1", null::text, null::text from public.timetables_10 where "E1" is not null
  union all
  select "Student Num"::int, 10, 1, 6, "F1", null::text, null::text from public.timetables_10 where "F1" is not null
  union all
  select "Student Num"::int, 10, 1, 7, "G1", null::text, null::text from public.timetables_10 where "G1" is not null
  union all
  select "Student Num"::int, 10, 1, 8, "H1", null::text, null::text from public.timetables_10 where "H1" is not null
  union all
  select "Student Num"::int, 10, 1, 9, "I1", null::text, null::text from public.timetables_10 where "I1" is not null
  -- Tuesday (day=2)
  union all
  select "Student Num"::int, 10, 2, 1, "A2", null::text, null::text from public.timetables_10 where "A2" is not null
  union all
  select "Student Num"::int, 10, 2, 2, "B2", null::text, null::text from public.timetables_10 where "B2" is not null
  union all
  select "Student Num"::int, 10, 2, 3, "C2", null::text, null::text from public.timetables_10 where "C2" is not null
  union all
  select "Student Num"::int, 10, 2, 4, "D2", null::text, null::text from public.timetables_10 where "D2" is not null
  union all
  select "Student Num"::int, 10, 2, 5, "E2", null::text, null::text from public.timetables_10 where "E2" is not null
  union all
  select "Student Num"::int, 10, 2, 6, "F2", null::text, null::text from public.timetables_10 where "F2" is not null
  union all
  select "Student Num"::int, 10, 2, 7, "G2", null::text, null::text from public.timetables_10 where "G2" is not null
  union all
  select "Student Num"::int, 10, 2, 8, "H2", null::text, null::text from public.timetables_10 where "H2" is not null
  union all
  select "Student Num"::int, 10, 2, 9, "I2", null::text, null::text from public.timetables_10 where "I2" is not null
  -- Wednesday (day=3)
  union all
  select "Student Num"::int, 10, 3, 1, "A3", null::text, null::text from public.timetables_10 where "A3" is not null
  union all
  select "Student Num"::int, 10, 3, 2, "B3", null::text, null::text from public.timetables_10 where "B3" is not null
  union all
  select "Student Num"::int, 10, 3, 3, "C3", null::text, null::text from public.timetables_10 where "C3" is not null
  union all
  select "Student Num"::int, 10, 3, 4, "D3", null::text, null::text from public.timetables_10 where "D3" is not null
  union all
  select "Student Num"::int, 10, 3, 5, "E3", null::text, null::text from public.timetables_10 where "E3" is not null
  union all
  select "Student Num"::int, 10, 3, 6, "F3", null::text, null::text from public.timetables_10 where "F3" is not null
  union all
  select "Student Num"::int, 10, 3, 7, "G3", null::text, null::text from public.timetables_10 where "G3" is not null
  union all
  select "Student Num"::int, 10, 3, 8, "H3", null::text, null::text from public.timetables_10 where "H3" is not null
  union all
  select "Student Num"::int, 10, 3, 9, "I3", null::text, null::text from public.timetables_10 where "I3" is not null
  -- Thursday (day=4)
  union all
  select "Student Num"::int, 10, 4, 1, "A4", null::text, null::text from public.timetables_10 where "A4" is not null
  union all
  select "Student Num"::int, 10, 4, 2, "B4", null::text, null::text from public.timetables_10 where "B4" is not null
  union all
  select "Student Num"::int, 10, 4, 3, "C4", null::text, null::text from public.timetables_10 where "C4" is not null
  union all
  select "Student Num"::int, 10, 4, 4, "D4", null::text, null::text from public.timetables_10 where "D4" is not null
  union all
  select "Student Num"::int, 10, 4, 5, "E4", null::text, null::text from public.timetables_10 where "E4" is not null
  union all
  select "Student Num"::int, 10, 4, 6, "F4", null::text, null::text from public.timetables_10 where "F4" is not null
  union all
  select "Student Num"::int, 10, 4, 7, "G4", null::text, null::text from public.timetables_10 where "G4" is not null
  union all
  select "Student Num"::int, 10, 4, 8, "H4", null::text, null::text from public.timetables_10 where "H4" is not null
  union all
  select "Student Num"::int, 10, 4, 9, "I4", null::text, null::text from public.timetables_10 where "I4" is not null
  -- Friday (day=5)
  union all
  select "Student Num"::int, 10, 5, 1, "A5", null::text, null::text from public.timetables_10 where "A5" is not null
  union all
  select "Student Num"::int, 10, 5, 2, "B5", null::text, null::text from public.timetables_10 where "B5" is not null
  union all
  select "Student Num"::int, 10, 5, 3, "C5", null::text, null::text from public.timetables_10 where "C5" is not null
  union all
  select "Student Num"::int, 10, 5, 4, "D5", null::text, null::text from public.timetables_10 where "D5" is not null
  union all
  select "Student Num"::int, 10, 5, 5, "E5", null::text, null::text from public.timetables_10 where "E5" is not null
  union all
  select "Student Num"::int, 10, 5, 6, "F5", null::text, null::text from public.timetables_10 where "F5" is not null
  union all
  select "Student Num"::int, 10, 5, 7, "G5", null::text, null::text from public.timetables_10 where "G5" is not null
  union all
  select "Student Num"::int, 10, 5, 8, "H5", null::text, null::text from public.timetables_10 where "H5" is not null
  union all
  select "Student Num"::int, 10, 5, 9, "I5", null::text, null::text from public.timetables_10 where "I5" is not null

  -- ========================================================================
  -- SENIOR HIGH: Grade 11
  -- ========================================================================

  -- Monday (day=1)
  union all
  select "Student Num"::int, 11, 1, 1, "A1", null::text, null::text from public.timetables_11 where "A1" is not null
  union all
  select "Student Num"::int, 11, 1, 2, "B1", null::text, null::text from public.timetables_11 where "B1" is not null
  union all
  select "Student Num"::int, 11, 1, 3, "C1", null::text, null::text from public.timetables_11 where "C1" is not null
  union all
  select "Student Num"::int, 11, 1, 4, "D1", null::text, null::text from public.timetables_11 where "D1" is not null
  union all
  select "Student Num"::int, 11, 1, 5, "E1", null::text, null::text from public.timetables_11 where "E1" is not null
  union all
  select "Student Num"::int, 11, 1, 6, "F1", null::text, null::text from public.timetables_11 where "F1" is not null
  union all
  select "Student Num"::int, 11, 1, 7, "G1", null::text, null::text from public.timetables_11 where "G1" is not null
  union all
  select "Student Num"::int, 11, 1, 8, "H1", null::text, null::text from public.timetables_11 where "H1" is not null
  union all
  select "Student Num"::int, 11, 1, 9, "I1", null::text, null::text from public.timetables_11 where "I1" is not null
  -- Tuesday (day=2)
  union all
  select "Student Num"::int, 11, 2, 1, "A2", null::text, null::text from public.timetables_11 where "A2" is not null
  union all
  select "Student Num"::int, 11, 2, 2, "B2", null::text, null::text from public.timetables_11 where "B2" is not null
  union all
  select "Student Num"::int, 11, 2, 3, "C2", null::text, null::text from public.timetables_11 where "C2" is not null
  union all
  select "Student Num"::int, 11, 2, 4, "D2", null::text, null::text from public.timetables_11 where "D2" is not null
  union all
  select "Student Num"::int, 11, 2, 5, "E2", null::text, null::text from public.timetables_11 where "E2" is not null
  union all
  select "Student Num"::int, 11, 2, 6, "F2", null::text, null::text from public.timetables_11 where "F2" is not null
  union all
  select "Student Num"::int, 11, 2, 7, "G2", null::text, null::text from public.timetables_11 where "G2" is not null
  union all
  select "Student Num"::int, 11, 2, 8, "H2", null::text, null::text from public.timetables_11 where "H2" is not null
  union all
  select "Student Num"::int, 11, 2, 9, "I2", null::text, null::text from public.timetables_11 where "I2" is not null
  -- Wednesday (day=3)
  union all
  select "Student Num"::int, 11, 3, 1, "A3", null::text, null::text from public.timetables_11 where "A3" is not null
  union all
  select "Student Num"::int, 11, 3, 2, "B3", null::text, null::text from public.timetables_11 where "B3" is not null
  union all
  select "Student Num"::int, 11, 3, 3, "C3", null::text, null::text from public.timetables_11 where "C3" is not null
  union all
  select "Student Num"::int, 11, 3, 4, "D3", null::text, null::text from public.timetables_11 where "D3" is not null
  union all
  select "Student Num"::int, 11, 3, 5, "E3", null::text, null::text from public.timetables_11 where "E3" is not null
  union all
  select "Student Num"::int, 11, 3, 6, "F3", null::text, null::text from public.timetables_11 where "F3" is not null
  union all
  select "Student Num"::int, 11, 3, 7, "G3", null::text, null::text from public.timetables_11 where "G3" is not null
  union all
  select "Student Num"::int, 11, 3, 8, "H3", null::text, null::text from public.timetables_11 where "H3" is not null
  union all
  select "Student Num"::int, 11, 3, 9, "I3", null::text, null::text from public.timetables_11 where "I3" is not null
  -- Thursday (day=4)
  union all
  select "Student Num"::int, 11, 4, 1, "A4", null::text, null::text from public.timetables_11 where "A4" is not null
  union all
  select "Student Num"::int, 11, 4, 2, "B4", null::text, null::text from public.timetables_11 where "B4" is not null
  union all
  select "Student Num"::int, 11, 4, 3, "C4", null::text, null::text from public.timetables_11 where "C4" is not null
  union all
  select "Student Num"::int, 11, 4, 4, "D4", null::text, null::text from public.timetables_11 where "D4" is not null
  union all
  select "Student Num"::int, 11, 4, 5, "E4", null::text, null::text from public.timetables_11 where "E4" is not null
  union all
  select "Student Num"::int, 11, 4, 6, "F4", null::text, null::text from public.timetables_11 where "F4" is not null
  union all
  select "Student Num"::int, 11, 4, 7, "G4", null::text, null::text from public.timetables_11 where "G4" is not null
  union all
  select "Student Num"::int, 11, 4, 8, "H4", null::text, null::text from public.timetables_11 where "H4" is not null
  union all
  select "Student Num"::int, 11, 4, 9, "I4", null::text, null::text from public.timetables_11 where "I4" is not null
  -- Friday (day=5)
  union all
  select "Student Num"::int, 11, 5, 1, "A5", null::text, null::text from public.timetables_11 where "A5" is not null
  union all
  select "Student Num"::int, 11, 5, 2, "B5", null::text, null::text from public.timetables_11 where "B5" is not null
  union all
  select "Student Num"::int, 11, 5, 3, "C5", null::text, null::text from public.timetables_11 where "C5" is not null
  union all
  select "Student Num"::int, 11, 5, 4, "D5", null::text, null::text from public.timetables_11 where "D5" is not null
  union all
  select "Student Num"::int, 11, 5, 5, "E5", null::text, null::text from public.timetables_11 where "E5" is not null
  union all
  select "Student Num"::int, 11, 5, 6, "F5", null::text, null::text from public.timetables_11 where "F5" is not null
  union all
  select "Student Num"::int, 11, 5, 7, "G5", null::text, null::text from public.timetables_11 where "G5" is not null
  union all
  select "Student Num"::int, 11, 5, 8, "H5", null::text, null::text from public.timetables_11 where "H5" is not null
  union all
  select "Student Num"::int, 11, 5, 9, "I5", null::text, null::text from public.timetables_11 where "I5" is not null

  -- ========================================================================
  -- SENIOR HIGH: Grade 12
  -- ========================================================================

  -- Monday (day=1)
  union all
  select "Student Num"::int, 12, 1, 1, "A1", null::text, null::text from public.timetables_12 where "A1" is not null
  union all
  select "Student Num"::int, 12, 1, 2, "B1", null::text, null::text from public.timetables_12 where "B1" is not null
  union all
  select "Student Num"::int, 12, 1, 3, "C1", null::text, null::text from public.timetables_12 where "C1" is not null
  union all
  select "Student Num"::int, 12, 1, 4, "D1", null::text, null::text from public.timetables_12 where "D1" is not null
  union all
  select "Student Num"::int, 12, 1, 5, "E1", null::text, null::text from public.timetables_12 where "E1" is not null
  union all
  select "Student Num"::int, 12, 1, 6, "F1", null::text, null::text from public.timetables_12 where "F1" is not null
  union all
  select "Student Num"::int, 12, 1, 7, "G1", null::text, null::text from public.timetables_12 where "G1" is not null
  union all
  select "Student Num"::int, 12, 1, 8, "H1", null::text, null::text from public.timetables_12 where "H1" is not null
  union all
  select "Student Num"::int, 12, 1, 9, "I1", null::text, null::text from public.timetables_12 where "I1" is not null
  -- Tuesday (day=2)
  union all
  select "Student Num"::int, 12, 2, 1, "A2", null::text, null::text from public.timetables_12 where "A2" is not null
  union all
  select "Student Num"::int, 12, 2, 2, "B2", null::text, null::text from public.timetables_12 where "B2" is not null
  union all
  select "Student Num"::int, 12, 2, 3, "C2", null::text, null::text from public.timetables_12 where "C2" is not null
  union all
  select "Student Num"::int, 12, 2, 4, "D2", null::text, null::text from public.timetables_12 where "D2" is not null
  union all
  select "Student Num"::int, 12, 2, 5, "E2", null::text, null::text from public.timetables_12 where "E2" is not null
  union all
  select "Student Num"::int, 12, 2, 6, "F2", null::text, null::text from public.timetables_12 where "F2" is not null
  union all
  select "Student Num"::int, 12, 2, 7, "G2", null::text, null::text from public.timetables_12 where "G2" is not null
  union all
  select "Student Num"::int, 12, 2, 8, "H2", null::text, null::text from public.timetables_12 where "H2" is not null
  union all
  select "Student Num"::int, 12, 2, 9, "I2", null::text, null::text from public.timetables_12 where "I2" is not null
  -- Wednesday (day=3)
  union all
  select "Student Num"::int, 12, 3, 1, "A3", null::text, null::text from public.timetables_12 where "A3" is not null
  union all
  select "Student Num"::int, 12, 3, 2, "B3", null::text, null::text from public.timetables_12 where "B3" is not null
  union all
  select "Student Num"::int, 12, 3, 3, "C3", null::text, null::text from public.timetables_12 where "C3" is not null
  union all
  select "Student Num"::int, 12, 3, 4, "D3", null::text, null::text from public.timetables_12 where "D3" is not null
  union all
  select "Student Num"::int, 12, 3, 5, "E3", null::text, null::text from public.timetables_12 where "E3" is not null
  union all
  select "Student Num"::int, 12, 3, 6, "F3", null::text, null::text from public.timetables_12 where "F3" is not null
  union all
  select "Student Num"::int, 12, 3, 7, "G3", null::text, null::text from public.timetables_12 where "G3" is not null
  union all
  select "Student Num"::int, 12, 3, 8, "H3", null::text, null::text from public.timetables_12 where "H3" is not null
  union all
  select "Student Num"::int, 12, 3, 9, "I3", null::text, null::text from public.timetables_12 where "I3" is not null
  -- Thursday (day=4)
  union all
  select "Student Num"::int, 12, 4, 1, "A4", null::text, null::text from public.timetables_12 where "A4" is not null
  union all
  select "Student Num"::int, 12, 4, 2, "B4", null::text, null::text from public.timetables_12 where "B4" is not null
  union all
  select "Student Num"::int, 12, 4, 3, "C4", null::text, null::text from public.timetables_12 where "C4" is not null
  union all
  select "Student Num"::int, 12, 4, 4, "D4", null::text, null::text from public.timetables_12 where "D4" is not null
  union all
  select "Student Num"::int, 12, 4, 5, "E4", null::text, null::text from public.timetables_12 where "E4" is not null
  union all
  select "Student Num"::int, 12, 4, 6, "F4", null::text, null::text from public.timetables_12 where "F4" is not null
  union all
  select "Student Num"::int, 12, 4, 7, "G4", null::text, null::text from public.timetables_12 where "G4" is not null
  union all
  select "Student Num"::int, 12, 4, 8, "H4", null::text, null::text from public.timetables_12 where "H4" is not null
  union all
  select "Student Num"::int, 12, 4, 9, "I4", null::text, null::text from public.timetables_12 where "I4" is not null
  -- Friday (day=5)
  union all
  select "Student Num"::int, 12, 5, 1, "A5", null::text, null::text from public.timetables_12 where "A5" is not null
  union all
  select "Student Num"::int, 12, 5, 2, "B5", null::text, null::text from public.timetables_12 where "B5" is not null
  union all
  select "Student Num"::int, 12, 5, 3, "C5", null::text, null::text from public.timetables_12 where "C5" is not null
  union all
  select "Student Num"::int, 12, 5, 4, "D5", null::text, null::text from public.timetables_12 where "D5" is not null
  union all
  select "Student Num"::int, 12, 5, 5, "E5", null::text, null::text from public.timetables_12 where "E5" is not null
  union all
  select "Student Num"::int, 12, 5, 6, "F5", null::text, null::text from public.timetables_12 where "F5" is not null
  union all
  select "Student Num"::int, 12, 5, 7, "G5", null::text, null::text from public.timetables_12 where "G5" is not null
  union all
  select "Student Num"::int, 12, 5, 8, "H5", null::text, null::text from public.timetables_12 where "H5" is not null
  union all
  select "Student Num"::int, 12, 5, 9, "I5", null::text, null::text from public.timetables_12 where "I5" is not null

  -- ========================================================================
  -- JUNIOR HIGH: Grade 7
  -- Keyed by class; join grade_7_students to get student_num.
  -- Lowercase cols a1..f5 (periods 1-6 only — matches headers F cap at 6).
  -- ========================================================================

  -- Monday (day=1), periods 1-6
  union all
  select s."Number"::int, 7, 1, 1, t.a1, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.a1 is not null
  union all
  select s."Number"::int, 7, 1, 2, t.b1, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.b1 is not null
  union all
  select s."Number"::int, 7, 1, 3, t.c1, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.c1 is not null
  union all
  select s."Number"::int, 7, 1, 4, t.d1, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.d1 is not null
  union all
  select s."Number"::int, 7, 1, 5, t.e1, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.e1 is not null
  union all
  select s."Number"::int, 7, 1, 6, t.f1, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.f1 is not null
  -- Tuesday (day=2)
  union all
  select s."Number"::int, 7, 2, 1, t.a2, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.a2 is not null
  union all
  select s."Number"::int, 7, 2, 2, t.b2, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.b2 is not null
  union all
  select s."Number"::int, 7, 2, 3, t.c2, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.c2 is not null
  union all
  select s."Number"::int, 7, 2, 4, t.d2, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.d2 is not null
  union all
  select s."Number"::int, 7, 2, 5, t.e2, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.e2 is not null
  union all
  select s."Number"::int, 7, 2, 6, t.f2, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.f2 is not null
  -- Wednesday (day=3)
  union all
  select s."Number"::int, 7, 3, 1, t.a3, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.a3 is not null
  union all
  select s."Number"::int, 7, 3, 2, t.b3, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.b3 is not null
  union all
  select s."Number"::int, 7, 3, 3, t.c3, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.c3 is not null
  union all
  select s."Number"::int, 7, 3, 4, t.d3, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.d3 is not null
  union all
  select s."Number"::int, 7, 3, 5, t.e3, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.e3 is not null
  union all
  select s."Number"::int, 7, 3, 6, t.f3, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.f3 is not null
  -- Thursday (day=4)
  union all
  select s."Number"::int, 7, 4, 1, t.a4, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.a4 is not null
  union all
  select s."Number"::int, 7, 4, 2, t.b4, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.b4 is not null
  union all
  select s."Number"::int, 7, 4, 3, t.c4, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.c4 is not null
  union all
  select s."Number"::int, 7, 4, 4, t.d4, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.d4 is not null
  union all
  select s."Number"::int, 7, 4, 5, t.e4, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.e4 is not null
  union all
  select s."Number"::int, 7, 4, 6, t.f4, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.f4 is not null
  -- Friday (day=5)
  union all
  select s."Number"::int, 7, 5, 1, t.a5, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.a5 is not null
  union all
  select s."Number"::int, 7, 5, 2, t.b5, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.b5 is not null
  union all
  select s."Number"::int, 7, 5, 3, t.c5, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.c5 is not null
  union all
  select s."Number"::int, 7, 5, 4, t.d5, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.d5 is not null
  union all
  select s."Number"::int, 7, 5, 5, t.e5, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.e5 is not null
  union all
  select s."Number"::int, 7, 5, 6, t.f5, null::text, null::text
    from public.timetables_grade7 t
    join public.grade_7_students s on s.class = t.class
   where t.f5 is not null

  -- ========================================================================
  -- JUNIOR HIGH: Grade 8
  -- ========================================================================

  -- Monday (day=1), periods 1-6
  union all
  select s."Number"::int, 8, 1, 1, t.a1, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.a1 is not null
  union all
  select s."Number"::int, 8, 1, 2, t.b1, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.b1 is not null
  union all
  select s."Number"::int, 8, 1, 3, t.c1, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.c1 is not null
  union all
  select s."Number"::int, 8, 1, 4, t.d1, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.d1 is not null
  union all
  select s."Number"::int, 8, 1, 5, t.e1, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.e1 is not null
  union all
  select s."Number"::int, 8, 1, 6, t.f1, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.f1 is not null
  -- Tuesday (day=2)
  union all
  select s."Number"::int, 8, 2, 1, t.a2, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.a2 is not null
  union all
  select s."Number"::int, 8, 2, 2, t.b2, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.b2 is not null
  union all
  select s."Number"::int, 8, 2, 3, t.c2, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.c2 is not null
  union all
  select s."Number"::int, 8, 2, 4, t.d2, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.d2 is not null
  union all
  select s."Number"::int, 8, 2, 5, t.e2, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.e2 is not null
  union all
  select s."Number"::int, 8, 2, 6, t.f2, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.f2 is not null
  -- Wednesday (day=3)
  union all
  select s."Number"::int, 8, 3, 1, t.a3, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.a3 is not null
  union all
  select s."Number"::int, 8, 3, 2, t.b3, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.b3 is not null
  union all
  select s."Number"::int, 8, 3, 3, t.c3, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.c3 is not null
  union all
  select s."Number"::int, 8, 3, 4, t.d3, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.d3 is not null
  union all
  select s."Number"::int, 8, 3, 5, t.e3, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.e3 is not null
  union all
  select s."Number"::int, 8, 3, 6, t.f3, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.f3 is not null
  -- Thursday (day=4)
  union all
  select s."Number"::int, 8, 4, 1, t.a4, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.a4 is not null
  union all
  select s."Number"::int, 8, 4, 2, t.b4, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.b4 is not null
  union all
  select s."Number"::int, 8, 4, 3, t.c4, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.c4 is not null
  union all
  select s."Number"::int, 8, 4, 4, t.d4, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.d4 is not null
  union all
  select s."Number"::int, 8, 4, 5, t.e4, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.e4 is not null
  union all
  select s."Number"::int, 8, 4, 6, t.f4, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.f4 is not null
  -- Friday (day=5)
  union all
  select s."Number"::int, 8, 5, 1, t.a5, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.a5 is not null
  union all
  select s."Number"::int, 8, 5, 2, t.b5, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.b5 is not null
  union all
  select s."Number"::int, 8, 5, 3, t.c5, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.c5 is not null
  union all
  select s."Number"::int, 8, 5, 4, t.d5, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.d5 is not null
  union all
  select s."Number"::int, 8, 5, 5, t.e5, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.e5 is not null
  union all
  select s."Number"::int, 8, 5, 6, t.f5, null::text, null::text
    from public.timetables_grade8 t
    join public.grade_8_students s on s.class = t.class
   where t.f5 is not null

  -- ========================================================================
  -- JUNIOR HIGH: Grade 9
  -- ========================================================================

  -- Monday (day=1), periods 1-6
  union all
  select s."Number"::int, 9, 1, 1, t.a1, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.a1 is not null
  union all
  select s."Number"::int, 9, 1, 2, t.b1, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.b1 is not null
  union all
  select s."Number"::int, 9, 1, 3, t.c1, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.c1 is not null
  union all
  select s."Number"::int, 9, 1, 4, t.d1, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.d1 is not null
  union all
  select s."Number"::int, 9, 1, 5, t.e1, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.e1 is not null
  union all
  select s."Number"::int, 9, 1, 6, t.f1, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.f1 is not null
  -- Tuesday (day=2)
  union all
  select s."Number"::int, 9, 2, 1, t.a2, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.a2 is not null
  union all
  select s."Number"::int, 9, 2, 2, t.b2, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.b2 is not null
  union all
  select s."Number"::int, 9, 2, 3, t.c2, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.c2 is not null
  union all
  select s."Number"::int, 9, 2, 4, t.d2, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.d2 is not null
  union all
  select s."Number"::int, 9, 2, 5, t.e2, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.e2 is not null
  union all
  select s."Number"::int, 9, 2, 6, t.f2, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.f2 is not null
  -- Wednesday (day=3)
  union all
  select s."Number"::int, 9, 3, 1, t.a3, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.a3 is not null
  union all
  select s."Number"::int, 9, 3, 2, t.b3, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.b3 is not null
  union all
  select s."Number"::int, 9, 3, 3, t.c3, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.c3 is not null
  union all
  select s."Number"::int, 9, 3, 4, t.d3, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.d3 is not null
  union all
  select s."Number"::int, 9, 3, 5, t.e3, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.e3 is not null
  union all
  select s."Number"::int, 9, 3, 6, t.f3, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.f3 is not null
  -- Thursday (day=4)
  union all
  select s."Number"::int, 9, 4, 1, t.a4, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.a4 is not null
  union all
  select s."Number"::int, 9, 4, 2, t.b4, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.b4 is not null
  union all
  select s."Number"::int, 9, 4, 3, t.c4, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.c4 is not null
  union all
  select s."Number"::int, 9, 4, 4, t.d4, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.d4 is not null
  union all
  select s."Number"::int, 9, 4, 5, t.e4, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.e4 is not null
  union all
  select s."Number"::int, 9, 4, 6, t.f4, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.f4 is not null
  -- Friday (day=5)
  union all
  select s."Number"::int, 9, 5, 1, t.a5, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.a5 is not null
  union all
  select s."Number"::int, 9, 5, 2, t.b5, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.b5 is not null
  union all
  select s."Number"::int, 9, 5, 3, t.c5, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.c5 is not null
  union all
  select s."Number"::int, 9, 5, 4, t.d5, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.d5 is not null
  union all
  select s."Number"::int, 9, 5, 5, t.e5, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.e5 is not null
  union all
  select s."Number"::int, 9, 5, 6, t.f5, null::text, null::text
    from public.timetables_grade9 t
    join public.grade_9_students s on s.class = t.class
   where t.f5 is not null
;

-- Grant read access to anon and authenticated roles (no RLS on views by default)
grant select on public.v_timetable_unified to anon, authenticated;
