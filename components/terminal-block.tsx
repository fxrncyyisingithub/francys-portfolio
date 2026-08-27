"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

const fetchCache = new Map<string, Promise<unknown>>();

async function fetchOnce(endpoint: string): Promise<unknown> {
  if (!fetchCache.has(endpoint)) {
    fetchCache.set(
      endpoint,
      fetch(endpoint)
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null),
    );
  }
  return fetchCache.get(endpoint)!;
}

type TerminalBlockProps = {
  command: string;
  endpoint: string;
  fallbackData: unknown;
  delay?: number;
};

export default function TerminalBlock({
  command,
  endpoint,
  fallbackData,
  delay = 0,
}: TerminalBlockProps) {
  const commandRef = useRef<HTMLSpanElement>(null);
  const [output, setOutput] = useState("");
  const [started, setStarted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const playedRef = useRef(false);
  const tweensRef = useRef<gsap.core.Tween[]>([]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started) {
          setStarted(true);
        }
      },
      { threshold: 0.5, rootMargin: "0px 0px -25% 0px" },
    );

    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [started]);

  useEffect(() => {
    if (!started || playedRef.current) return;
    playedRef.current = true;

    const timeout = setTimeout(() => {
      const obj = { chars: 0 };

      tweensRef.current.push(
        gsap.to(obj, {
          chars: command.length,
          duration: 0.9,
          ease: "none",
          onUpdate: () => {
            if (commandRef.current) {
              commandRef.current.textContent = command.slice(
                0,
                Math.floor(obj.chars),
              );
            }
          },
          onComplete: async () => {
            let data: unknown = fallbackData;
            try {
              const json = await fetchOnce(endpoint);
              if (json) {
                // API returns array for Supabase, normalize to object shape like figma
                // fallbackData already has correct shape, only override if json is meaningful
                if (Array.isArray(json) && json.length > 0) {
                  // whoami: array -> keep as is for pretty print, terminal expects array
                  data = json;
                } else if (json && typeof json === "object") {
                  // could be already shaped
                  const isEmptyArray =
                    Array.isArray((json as Record<string, unknown>).data) &&
                    ((json as Record<string, unknown>).data as unknown[])
                      .length === 0;
                  data = isEmptyArray ? fallbackData : json;
                }
              }
            } catch {
              // keep fallback
            }

            const pretty = JSON.stringify(data, null, 2);
            const out = { chars: 0 };
            tweensRef.current.push(
              gsap.to(out, {
                chars: pretty.length,
                duration: 2.2,
                ease: "none",
                onUpdate: () => {
                  setOutput(pretty.slice(0, Math.floor(out.chars)));
                },
              }),
            );
          },
        }),
      );
    }, delay);

    return () => {
      clearTimeout(timeout);
      tweensRef.current.forEach((t) => t.kill());
      tweensRef.current = [];
    };
  }, [started, command, endpoint, fallbackData, delay]);

  return (
    <div
      ref={containerRef}
      className="w-full min-h-screen flex flex-col items-start justify-center px-6 sm:px-12 lg:px-20 py-16"
    >
      <div className="font-mono font-bold text-2xl sm:text-3xl lg:text-4xl leading-relaxed tracking-tight">
        <span ref={commandRef} className="whitespace-pre" />
        <span className="cursor">|</span>
      </div>
      {output && (
        <pre className="font-mono text-lg sm:text-xl lg:text-2xl leading-relaxed whitespace-pre-wrap break-words text-left mt-10 w-full">
          {output}
        </pre>
      )}
    </div>
  );
}
