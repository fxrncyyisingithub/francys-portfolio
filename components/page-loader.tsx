"use client";

import { useEffect, useRef, useState } from "react";

const BOOT_LINES = [
  "francy@bootstrap:~$ systemctl --user start portfolio.service",
  "[  OK  ] portfolio.service is active (running)",
  "  ▸ serving page...",
];

export default function PageLoader({ onDone }: { onDone?: () => void }) {
  const [fading, setFading] = useState(false);
  const [hidden, setHidden] = useState(false);
  const onDoneRef = useRef(onDone);

  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  useEffect(() => {
    const start = setTimeout(() => setFading(true), 1600);
    const remove = setTimeout(() => {
      setHidden(true);
      onDoneRef.current?.();
    }, 2100);
    return () => {
      clearTimeout(start);
      clearTimeout(remove);
    };
  }, []);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-500 ${
        fading ? "opacity-0" : "opacity-100"
      }`}
    >
      <div className="font-mono text-left w-full max-w-lg px-8">
        <div className="mb-2 text-sm opacity-50">francy-powerd-boot v0.1.0</div>
        {BOOT_LINES.map((line, i) => (
          <div
            key={i}
            className="text-sm sm:text-base leading-relaxed opacity-0 animate-[bootline_0.1s_ease_forwards_0.9s]"
            style={{ animationDelay: `${0.9 + i * 0.55}s` }}
          >
            {line}
          </div>
        ))}
        <div className="mt-4 h-1 w-full overflow-hidden rounded bg-white/10">
          <div
            className="h-full bg-white animate-[bootbar_1.2s_linear_forwards_1.5s]"
            style={{ width: "0%" }}
          />
        </div>
      </div>
    </div>
  );
}