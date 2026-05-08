-- 019_drop_diagnostic_functions.sql
-- Cleanup of throwaway diagnostic RPCs added during whoami debugging.

drop function if exists public.dbg_student_counts();
drop function if exists public.dbg_student_samples();
