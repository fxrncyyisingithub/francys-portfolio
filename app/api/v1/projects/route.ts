import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.from("projects").select("*");
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  return new Response(JSON.stringify(data, null, 2));
}
