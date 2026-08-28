import UnixTerminal from "@/components/unix-terminal";

export default function TerminalPage() {
  return (
    <main className="text-white w-full font-mono selection:bg-white selection:text-black">
      <UnixTerminal />
    </main>
  );
}
