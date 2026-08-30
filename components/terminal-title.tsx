"use client";

import { useEffect, useState } from "react";

const TEXT = "francy's portfolio";

export default function TerminalTitle() {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(TEXT.slice(0, i));
      if (i >= TEXT.length) {
        clearInterval(id);
        setDone(true);
      }
    }, 75);
    return () => clearInterval(id);
  }, []);

  return (
    <h1 className="text-5xl sm:text-7xl lg:text-8xl font-bold tracking-tight leading-none">
      {shown}
      <span
        className={
          done
            ? "cursor"
            : "inline-block w-[0.6ch] -mb-1 align-baseline bg-white"
        }
      />
    </h1>
  );
}
