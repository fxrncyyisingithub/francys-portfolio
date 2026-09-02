"use client";

import { useState } from "react";
import TerminalTitle from "@/components/terminal-title";
import PageLoader from "@/components/page-loader";

export default function HomeHero() {
  const [bootDone, setBootDone] = useState(false);

  return (
    <header className="w-full flex justify-between items-start px-6 sm:px-10 lg:px-12 pt-8 pb-4">
      <TerminalTitle start={bootDone} />
      <a
        href="/terminal"
        className="text-lg sm:text-xl lg:text-2xl tracking-tight opacity-70 hover:opacity-100 transition-opacity duration-300 mt-2"
      >
        [ terminal ]
      </a>
      <PageLoader onDone={() => setBootDone(true)} />
    </header>
  );
}