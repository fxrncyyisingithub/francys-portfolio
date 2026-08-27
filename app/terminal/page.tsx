import UnixTerminal from "@/components/unix-terminal";

export default function TerminalPage() {
  return (
    <main className="bg-black text-white min-h-screen w-full font-mono selection:bg-white selection:text-black">
      <UnixTerminal />
    </main>
  );
}
