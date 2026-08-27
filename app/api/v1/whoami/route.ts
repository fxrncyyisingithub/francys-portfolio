import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  const { data, error } = await supabase.from("whoami").select("*");

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  const goodData = JSON.stringify(data, null, 3);
  return new Response(goodData, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
