# IVA Database Schema Reference

## Quick Reference for API Development

### Tables Overview

| Table | Primary Key | Purpose |
|-------|-------------|---------|
| `users` | `id` (UUID) | Auth users with role |
| `students` | `student_number` (INT 6-digit) | Student entity |
| `teachers` | `id` (UUID) | Teacher entity |
| `user_links` | `user_id` (UUID) | Links auth → entity |
| `subjects` | `id` (UUID) | Subject catalog |
| `cohorts` | `id` (UUID) | Grade 4-9 cohorts |
| `student_cohorts` | `(student_number, cohort_id)` | Student-cohort M:N |
| `class_groups` | `id` (UUID) | Subject sections (M/N/ALL) |
| `student_class_groups` | `(student_number, class_group_id)` | Student-section |
| `teacher_class_groups` | `(teacher_id, class_group_id)` | Teacher-section |
| `timetables` | `id` (UUID) | Timetable ownership |
| `timetable_entries` | `id` (UUID) | Period content (A1-I5) |
| `timetable_headers` | `code` (TEXT) | Static period times |

---

## Key Relationships

### Timetable Ownership (CRITICAL)

```
Grade 4-9:  Student → student_cohorts → cohort → timetable → timetable_entries
Grade 10+:  Student → timetable (direct) → timetable_entries
```

### User Authentication Flow

```
auth.users (Supabase) → users → user_links → students OR teachers
```

---

## Helper Views (Use These for API)

| View | Purpose | Use Case |
|------|---------|----------|
| `student_timetable_view` | Full timetable with student info | Dashboard, schedule screen |
| `todays_schedule_view` | Periods for current weekday | Daily schedule widget |
| `student_subjects_clean_view` | Grade 10+ subjects (derived) | Subject list for seniors |
| `cohort_roster_view` | Students in each cohort | Class rosters |
| `teacher_classes_view` | Teacher class assignments | Teacher dashboard |

---

## API Endpoint Patterns

### Student Endpoints

```typescript
// Get student's timetable (works for both grade 4-9 and 10+)
GET /api/students/[student_number]/timetable
→ Query: student_timetable_view WHERE student_number = :student_number

// Get today's schedule
GET /api/students/[student_number]/schedule/today
→ Query: todays_schedule_view WHERE student_number = :student_number

// Get student profile
GET /api/students/[student_number]
→ Query: students WHERE student_number = :student_number
```

### Teacher Endpoints

```typescript
// Get teacher's classes
GET /api/teachers/[teacher_id]/classes
→ Query: teacher_classes_view WHERE teacher_id = :teacher_id

// Get class roster
GET /api/cohorts/[cohort_id]/students
→ Query: cohort_roster_view WHERE cohort_id = :cohort_id
```

### Admin Endpoints

```typescript
// Import timetable (Excel upload)
POST /api/admin/timetables/import
→ Upsert: timetables + timetable_entries

// Manage students
POST /api/admin/students
PUT /api/admin/students/[student_number]
DELETE /api/admin/students/[student_number]
```

---

## Period Codes Reference

| Code | Day | Period | Time |
|------|-----|--------|------|
| A1-I1 | Monday | 1-9 | 08:00-16:50 |
| A2-I2 | Tuesday | 1-9 | 08:00-16:50 |
| A3-I3 | Wednesday | 1-9 | 08:00-16:50 |
| A4-I4 | Thursday | 1-9 | 08:00-16:50 |
| A5-I5 | Friday | 1-9 | 08:00-16:50 |

Each period: 50 min lesson + 10 min break

---

## RLS Helper Functions

```sql
get_user_role()        -- Returns: 'admin' | 'teacher' | 'student'
get_student_number()   -- Returns: INT (student's number) or NULL
get_teacher_id()       -- Returns: UUID (teacher's id) or NULL
get_student_cohort_ids(student_number) -- Returns: UUID[] of cohort IDs
```

---

## Security Notes

1. **All tables have RLS enabled** - Direct table access respects policies
2. **Students can only see their own data** - Enforced via `get_student_number()`
3. **Teachers see all students** - For class management
4. **Admins have full access** - All CRUD operations
5. **Timetable headers are public** - Static reference data
6. **Use service role key only in server-side code** - Never expose to client
