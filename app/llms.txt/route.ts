import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export const dynamic = "force-dynamic";

async function getTable(table: string): Promise<unknown[]> {
  try {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);
    const { data, error } = await supabase.from(table).select("*");
    if (error || !data) return [];
    return data as unknown[];
  } catch {
    return [];
  }
}

export async function GET() {
  const [whoami, skills, projects] = await Promise.all([
    getTable("whoami"),
    getTable("skills"),
    getTable("projects"),
  ]);

  const lines: string[] = [];
  lines.push("# francy's portfolio");
  lines.push("");
  lines.push(
    "An interactive, terminal-style personal portfolio. The public site is a black monospace terminal; visit /terminal for a working shell (ls, cat, echo, curl, mkdir, touch, rm, doas, exit).",
  );
  lines.push("");
  lines.push("## Site structure");
  lines.push("- `/` : hero + typed terminal output (whoami, skills, projects)");
  lines.push(
    "- `/terminal` : interactive shell. Run `curl api.francy.dev/v1/whoami` etc.",
  );
  lines.push(
    "- `/api/v1/whoami`, `/api/v1/skills`, `/api/v1/projects` : JSON endpoints (Supabase)",
  );
  lines.push("");
  lines.push("## whoami");
  lines.push("```json");
  lines.push(JSON.stringify(whoami, null, 2));
  lines.push("```");
  lines.push("");
  lines.push("## skills");
  lines.push("```json");
  lines.push(JSON.stringify(skills, null, 2));
  lines.push("```");
  lines.push("");
  lines.push("## projects");
  lines.push("```json");
  lines.push(JSON.stringify(projects, null, 2));
  lines.push("```");
  lines.push("");

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=60",
    },
  });
}
