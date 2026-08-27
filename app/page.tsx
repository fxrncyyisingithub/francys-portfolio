import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import TerminalBlock from "@/components/terminal-block";
import TerminalTitle from "@/components/terminal-title";

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

export default async function Page() {
  const [whoami, skills, projects] = await Promise.all([
    getTable("whoami"),
    getTable("skills"),
    getTable("projects"),
  ]);

  const whoamiFallback = whoami.length ? whoami : { name: "Francy" };
  const skillsFallback = skills.length ? skills : { skills: {} };
  const projectsFallback = projects.length ? projects : { projects: [] };

  return (
    <main className="bg-black text-white min-h-screen w-full font-mono selection:bg-white selection:text-black">
      {/* First fold - fullscreen */}
      <section className="relative min-h-screen w-full flex flex-col">
        {/* Header */}
        <header className="w-full flex justify-between items-start px-6 sm:px-10 lg:px-12 pt-8 pb-4">
          <TerminalTitle />
          <a
            href="/terminal"
            className="text-[12px] sm:text-[13px] tracking-tight opacity-80 hover:opacity-100 transition-opacity mt-2"
          >
            [ terminal ]
          </a>
        </header>

        {/* Hero - scroll prompt at bottom */}
        <div className="flex-1 w-full flex flex-col items-center justify-end pb-16">
          <p className="text-xl sm:text-3xl tracking-tight opacity-80">
            [ scroll down for more ]
          </p>
          <span className="mt-10 text-3xl sm:text-5xl font-light leading-none animate-pulse">
            ↓
          </span>
        </div>
      </section>

      {/* Terminal blocks - one per screen */}
      <section className="w-full flex flex-col items-center px-6">
        <TerminalBlock
          command="$ curl api.francy.dev/v1/whoami"
          endpoint="/api/v1/whoami"
          fallbackData={whoamiFallback}
        />

        <TerminalBlock
          command="$ curl api.francy.dev/v1/skills"
          endpoint="/api/v1/skills"
          fallbackData={skillsFallback}
        />

        <div
          id="summary"
          className="w-full flex flex-col items-center scroll-mt-20"
        >
          <TerminalBlock
            command="$ curl api.francy.dev/v1/projects"
            endpoint="/api/v1/projects"
            fallbackData={projectsFallback}
          />
        </div>
      </section>

      {/* Machine-readable / scraped content (hidden visually, present in HTML) */}
      <section className="sr-only" aria-label="portfolio content">
        <h2>Who am I</h2>
        <pre>{JSON.stringify(whoami, null, 2)}</pre>
        <h2>Skills</h2>
        <pre>{JSON.stringify(skills, null, 2)}</pre>
        <h2>Projects</h2>
        <pre>{JSON.stringify(projects, null, 2)}</pre>
      </section>

      {/* Bottom padding like Figma long scroll */}
      <div className="h-[10vh]" />
    </main>
  );
}
