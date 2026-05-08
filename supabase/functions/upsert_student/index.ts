// supabase/functions/upsert_student/index.ts
import { createClient } from "jsr:@supabase/supabase-js@2";

interface UpsertStudentInput {
  idempotency_key: string;
  student_num: number;            // 6-digit student id
  grade: number;                  // 0=trial, 4..12, or null for british
  full_name: string;
  name?: string;
  surname?: string;
  mother?: string;
  mother_cell?: string;
  father?: string;
  father_cell?: string;
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const sb = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

function tableForGrade(grade: number | null): string {
  if (grade === 0) return "trial_students";
  if (grade === null) return "grade_british_students";
  if (grade >= 4 && grade <= 12) return `grade_${grade}_students`;
  throw new Error("unsupported_grade");
}

Deno.serve(async (req) => {
  if (req.method !== "POST")
    return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405 });

  let body: UpsertStudentInput;
  try { body = await req.json(); }
  catch { return new Response(JSON.stringify({ error: "invalid_json" }), { status: 400 }); }

  if (!body.idempotency_key || !body.student_num || !body.full_name)
    return new Response(JSON.stringify({ error: "missing_required_fields" }), { status: 400 });

  // Atomic idempotency reservation
  const { error: claimErr } = await sb
    .from("mutation_log")
    .insert({ idempotency_key: body.idempotency_key, result: { ok: false, pending: true } })
    .select("idempotency_key")
    .single();

  if (claimErr) {
    // PG conflict code is "23505". Anything else is a real error.
    if (claimErr.code !== "23505") {
      return new Response(JSON.stringify({ error: "claim_failed", detail: claimErr.message }), { status: 500 });
    }
    // Key already claimed — fetch and return the cached result.
    const { data: cached } = await sb.from("mutation_log").select("result").eq("idempotency_key", body.idempotency_key).single();
    return new Response(JSON.stringify(cached?.result ?? { ok: false }), { status: 200, headers: { "content-type": "application/json" } });
  }

  let table: string;
  try { table = tableForGrade(body.grade ?? null); }
  catch (e) { return new Response(JSON.stringify({ error: "unsupported_grade", detail: String(e) }), { status: 400 }); }

  const row = {
    Number: body.student_num,
    "Full Name": body.full_name,
    Name: body.name ?? null,
    Surname: body.surname ?? null,
    Grade: body.grade,
    Mother: body.mother ?? null,
    "Mother Cell": body.mother_cell ?? null,
    Father: body.father ?? null,
    "Father Cell": body.father_cell ?? null,
  };

  const { error } = await sb.from(table).upsert(row, { onConflict: "Number" });
  if (error) return new Response(JSON.stringify({ error: "upsert_failed", detail: error.message }), { status: 500 });

  const result = { ok: true, student_num: body.student_num, grade: body.grade };
  await sb.from("mutation_log").update({ result }).eq("idempotency_key", body.idempotency_key);

  return new Response(JSON.stringify(result), { status: 200, headers: { "content-type": "application/json" } });
});
