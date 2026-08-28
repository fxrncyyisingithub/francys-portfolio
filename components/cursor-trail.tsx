"use client";

import { useEffect, useRef } from "react";

const CHARS = "0123456789{}[]();:=>+<>/\\|#@$%^&*~!?-_.,`'\"";
const COL_W = 26;
const ROW_H = 30;

export default function CursorTrail() {
  const containerRef = useRef<HTMLDivElement>(null);
  const fieldRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const mouseRef = useRef({ x: -300, y: -300 });
  const smoothRef = useRef({ x: -300, y: -300 });

  useEffect(() => {
    const fieldEl = fieldRef.current;
    const containerEl = containerRef.current;
    if (!fieldEl || !containerEl) return;

    function buildField() {
      const field = fieldEl!;
      field.innerHTML = "";
      const cols = Math.ceil(window.innerWidth / COL_W) + 1;
      const rows = Math.ceil(window.innerHeight / ROW_H) + 1;
      const frag = document.createDocumentFragment();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const span = document.createElement("span");
          span.textContent = CHARS[Math.floor(Math.random() * CHARS.length)];
          span.style.position = "absolute";
          span.style.left = `${c * COL_W}px`;
          span.style.top = `${r * ROW_H}px`;
          frag.appendChild(span);
        }
      }
      field.appendChild(frag);
    }

    buildField();

    let lastMx = -999;
    let lastMy = -999;

    function tick() {
      const container = containerEl!;
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;
      smoothRef.current.x += (mx - smoothRef.current.x) * 0.2;
      smoothRef.current.y += (my - smoothRef.current.y) * 0.2;

      const cx = smoothRef.current.x;
      const cy = smoothRef.current.y;

      // only recompute the (expensive) mask when the cursor actually moved
      if (Math.abs(cx - lastMx) > 1.5 || Math.abs(cy - lastMy) > 1.5) {
        lastMx = cx;
        lastMy = cy;
        const mask = `radial-gradient(circle 96px at ${cx}px ${cy}px, #000 0%, #000 55%, rgba(0,0,0,0.15) 82%, transparent 100%)`;
        container.style.webkitMaskImage = mask;
        container.style.maskImage = mask;
      }

      rafRef.current = requestAnimationFrame(tick);
    }

    function onMove(e: MouseEvent) {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    }
    function onLeave() {
      mouseRef.current = { x: -300, y: -300 };
    }

    let resizeTimer = 0;
    function onResize() {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(buildField, 150);
    }

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseleave", onLeave);
    window.addEventListener("resize", onResize);
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseleave", onLeave);
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimer);
      cancelAnimationFrame(rafRef.current);
      fieldEl.innerHTML = "";
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-50"
      aria-hidden="true"
    >
      <div
        ref={fieldRef}
        className="absolute inset-0 font-mono text-[13px] leading-none text-white/60"
        style={{ color: "#888" }}
      />
    </div>
  );
}
