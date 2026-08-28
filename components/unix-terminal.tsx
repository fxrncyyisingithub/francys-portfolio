"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Line = { kind: "input" | "output" | "hint"; text: string };

type FsNode =
  | { type: "file"; content: string }
  | { type: "dir"; children: Record<string, FsNode> };

type Dir = { type: "dir"; children: Record<string, FsNode> };

const root: Dir = {
  type: "dir",
  children: {
    "about.txt": {
      type: "file",
      content:
        "francy — software engineer (in training)\na guy who LOVES coding. based in italy.",
    },
    "README.md": {
      type: "file",
      content:
        "# francy.dev\nwelcome to my portfolio terminal.\ntype `curl api.francy.dev/v1/whoami` to meet me.",
    },
    "contact.txt": {
      type: "file",
      content: "email: francypizzitola03@gmail.com\ngithub: github.com/frxncyy",
    },
  },
};

const HELP = `available commands:
  ls                           list files
  cat <file>                   print a file
  touch <file>                 create an empty file
  mkdir <dir>                  create a directory
  rm [-r] <path>               remove a file or directory
  doas <cmd>                   run a command as root
  sudo <cmd>                   (hint: we don't)
  curl api.francy.dev/v1/<x>   fetch an endpoint (whoami, skills, projects)
  echo <text>                  print text
  exit                         return to the main page
  clear                        clear the screen
  help                         show this`;

async function fetchEndpoint(endpoint: string): Promise<string> {
  try {
    const res = await fetch(endpoint);
    if (!res.ok) return `curl: (${res.status}) failed to reach ${endpoint}`;
    const json = await res.json();
    if (Array.isArray(json) && json.length === 0) return "[]";
    return JSON.stringify(json, null, 2);
  } catch {
    return `curl: could not reach ${endpoint}`;
  }
}

export default function UnixTerminal() {
  const [lines, setLines] = useState<Line[]>([
    { kind: "hint", text: "francy@portfolio — interactive shell" },
    { kind: "hint", text: "type `help` to get started." },
  ]);
  const [value, setValue] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fsRef = useRef<Dir>(root);
  const router = useRouter();

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [lines]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function push(text: string, kind: Line["kind"] = "output") {
    setLines((l) => [...l, { kind, text }]);
  }

  async function run(raw: string, echo = true) {
    const cmd = raw.trim();
    if (echo) {
      setLines((l) => [
        ...l,
        { kind: "input", text: `francy@portfolio:~$ ${cmd}` },
      ]);
    }
    if (!cmd) return;

    const parts = cmd.split(/\s+/);
    const name = parts[0];
    const args = parts.slice(1);

    if (name === "clear") {
      setLines([]);
      return;
    }
    if (name === "exit") {
      push("bye.");
      router.push("/");
      return;
    }
    if (name === "help") {
      push(HELP);
      return;
    }
    if (name === "echo") {
      const redirIdx = args.findIndex((a) => a === ">" || a === ">>");
      if (redirIdx !== -1) {
        const append = args[redirIdx] === ">>";
        const file = args[redirIdx + 1];
        const text = args
          .slice(0, redirIdx)
          .join(" ")
          .replace(/^["']|["']$/g, "");
        if (!file) return push("syntax error: missing filename");
        const node = fsRef.current.children[file];
        if (node && node.type === "dir")
          return push(`bash: ${file}: is a directory`);
        const current = node && node.type === "file" ? node.content : "";
        fsRef.current.children[file] = {
          type: "file",
          content: append
            ? current + (current && !current.endsWith("\n") ? "\n" : "") + text
            : text,
        };
        return;
      }
      push(args.join(" ").replace(/^["']|["']$/g, ""));
      return;
    }
    if (name === "ls") {
      push(Object.keys(fsRef.current.children).join("  "));
      return;
    }
    if (name === "cat") {
      const file = args[0];
      if (!file) return push("cat: missing file operand");
      const node = fsRef.current.children[file];
      if (!node) return push(`cat: ${file}: no such file`);
      if (node.type === "dir") return push(`cat: ${file}: is a directory`);
      push(node.content);
      return;
    }
    if (name === "touch") {
      const file = args[0];
      if (!file) return push("touch: missing file operand");
      if (fsRef.current.children[file])
        return push(`touch: ${file}: already exists`);
      fsRef.current.children[file] = { type: "file", content: "" };
      return;
    }
    if (name === "mkdir") {
      const dir = args[0];
      if (!dir) return push("mkdir: missing operand");
      if (fsRef.current.children[dir])
        return push(`mkdir: ${dir}: already exists`);
      fsRef.current.children[dir] = { type: "dir", children: {} };
      return;
    }
    if (name === "sudo") {
      push("sorry, we use doas, we're too opsec");
      return;
    }
    if (name === "doas") {
      const rest = parts.slice(1).join(" ");
      if (!rest) return push("doas: missing operand");
      return run(rest, false);
    }
    if (name === "rm") {
      const isRecursive =
        args.includes("-r") ||
        args.includes("-rf") ||
        args.includes("-fr") ||
        args.includes("--recursive");
      const target = args.find((a) => !a.startsWith("-"));
      const destructive =
        target === "/" || target === "/*" || target === "/." || target === "..";
      if (isRecursive && destructive) {
        push("nice try skid");
        return;
      }
    }
    if (name === "rm") {
      const recursive =
        args[0] === "-r" || args[0] === "-rf" || args[0] === "-fr";
      const target = recursive ? args[1] : args[0];
      if (!target) return push("rm: missing operand");
      const node = fsRef.current.children[target];
      if (!node) return push(`rm: ${target}: no such file or directory`);
      if (node.type === "dir" && !recursive)
        return push(`rm: ${target}: is a directory (use rm -r)`);
      delete fsRef.current.children[target];
      return;
    }
    if (name === "curl") {
      const url = args[0];
      if (!url) {
        return push("curl: try 'curl api.francy.dev/v1/whoami'");
      }
      const match = url.match(
        /^api\.francy\.dev\/v1\/(whoami|skills|projects)$/,
      );
      if (!match) {
        return push(
          "curl: only api.francy.dev/v1/{whoami,skills,projects} are supported",
        );
      }
      setBusy(true);
      const out = await fetchEndpoint(`/api/v1/${match[1]}`);
      setBusy(false);
      push(out);
      return;
    }

    push(`command not found: ${name}\ntype 'help' for a list of commands.`);
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    const v = value;
    setValue("");
    void run(v);
  }

  return (
    <div
      className="fixed inset-0 z-10 w-full h-screen flex flex-col items-start px-6 sm:px-12 lg:px-20 py-6 cursor-text bg-black"
      onClick={() => inputRef.current?.focus()}
    >
      <div
        ref={scrollRef}
        className="w-full flex-1 min-h-0 overflow-y-auto font-mono text-base sm:text-xl leading-relaxed whitespace-pre-wrap break-words"
      >
        {lines.map((line, i) => (
          <div
            key={i}
            className={
              line.kind === "input"
                ? "font-bold"
                : line.kind === "hint"
                  ? "opacity-50"
                  : "opacity-90"
            }
          >
            {line.text}
          </div>
        ))}

        <form onSubmit={onSubmit} className="flex items-start gap-2 mt-1">
          <span className="font-bold">francy@portfolio:~$</span>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            spellCheck={false}
            autoComplete="off"
            disabled={busy}
            className="flex-1 bg-transparent outline-none border-none font-mono text-base sm:text-xl caret-white min-w-0"
            placeholder={busy ? "..." : ""}
          />
        </form>
      </div>
    </div>
  );
}
