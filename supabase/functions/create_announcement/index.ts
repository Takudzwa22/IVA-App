// supabase/functions/create_announcement/index.ts
import { createClient } from "jsr:@supabase/supabase-js@2";

interface CreateAnnouncementInput {
  idempotency_key: string;
  author_email: string;
  author_name: string;
  author_role: 'teacher' | 'admin';
  title: string;
  content: string;
  category: string;
  priority: 'low' | 'normal' | 'high';
  target_grades: number[] | null;     // null = school-wide
  target_subjects: string[] | null;
  expires_at: string | null;          // ISO
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const sb = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "method_not_allowed" }), { status: 405 });
  }

  let body: CreateAnnouncementInput;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "invalid_json" }), { status: 400 });
  }

  // Required fields
  for (const k of ["idempotency_key","author_email","author_name","author_role","title","content","category","priority"] as const) {
    if (!body[k]) return new Response(JSON.stringify({ error: `missing_${k}` }), { status: 400 });
  }

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

  // Insert announcement
  const { data: row, error } = await sb.from("announcements").insert({
    author_email: body.author_email,
    author_name: body.author_name,
    author_role: body.author_role,
    title: body.title,
    content: body.content,
    category: body.category,
    priority: body.priority,
    target_grades: body.target_grades,
    target_subjects: body.target_subjects,
    expires_at: body.expires_at,
    is_active: true,
  }).select("id").single();

  if (error) return new Response(JSON.stringify({ error: "insert_failed", detail: error.message }), { status: 500 });

  const result = { ok: true, id: row.id };
  await sb.from("mutation_log").update({ result }).eq("idempotency_key", body.idempotency_key);

  return new Response(JSON.stringify(result), { status: 200, headers: { "content-type": "application/json" } });
});
