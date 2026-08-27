# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a **Next.js 16** portfolio project for "francy" built with:
- **React 19** with Server Components
- **TypeScript** (strict mode)
- **Tailwind CSS v4** (PostCSS plugin)
- **Supabase** for backend/database (SSR-compatible client setup)
- **GSAP** for animations (terminal typing effect)
- **Lenis** for smooth scrolling
- **shadcn/ui** components (via `shadcn` package)
- **Bun** as package manager

## Architecture

### File Structure (App Router)
```
app/
├── api/v1/
│   ├── whoami/route.ts     # Returns user profile from Supabase
│   ├── projects/route.ts   # Returns projects from Supabase
│   └── skills/route.ts     # Returns skills from Supabase
├── layout.tsx              # Root layout with fonts, Lenis, GSAP providers
├── page.tsx                # Home page - fetches todos from Supabase
├── globals.css             # Tailwind v4 + custom styles
└── favicon.ico
components/
├── lenis.tsx               # Client component - smooth scroll provider
├── gsap.tsx                # Client component - terminal typing animation
└── terminal.tsx            # Unused terminal component
utils/
├── supabase/
│   ├── client.ts           # Browser Supabase client
│   ├── server.ts           # Server Supabase client (for RSC)
│   └── middleware.ts       # Middleware client for session refresh
└── lib/utils.ts            # cn() utility (clsx + tailwind-merge)
```

### Supabase Integration
Three client patterns for different contexts:
- **Client** (`utils/supabase/client.ts`): Browser-only, uses `createBrowserClient`
- **Server** (`utils/supabase/server.ts`): Server Components, uses `createServerClient` with cookies()
- **Middleware** (`utils/supabase/middleware.ts`): Edge middleware for session refresh

Tables used: `todos`, `whoami`, `projects`, `skills`

### Animation Stack
- **Lenis** (`components/lenis.tsx`): Smooth scroll with `lerp: 0.05`, auto-destroy on unmount
- **GSAP** (`components/gsap.tsx`): Terminal-style typing animation fetching from `/api/v1/whoami`

### Fonts
Loaded via `next/font/google` in `layout.tsx`:
- Geist Sans (variable font)
- DM Sans (primary, used on body)
- Poppins (weights 400-700)
- Inter (weights 400-700)

## Commands

```bash
# Development
bun dev          # Start dev server (Next.js 16)

# Build & Production
bun build        # Production build
bun start        # Run production server

# Code Quality
bun lint         # ESLint (extends next/core-web-vitals + next/typescript)
```

## Environment Variables

Required in `.env`:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

## Key Patterns

### Server Component Data Fetching
```tsx
// app/page.tsx
import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)
  const { data: todos } = await supabase.from('todos').select()
  // ...
}
```

### API Route Pattern
```tsx
// app/api/v1/whoami/route.ts
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);
  const { data, error } = await supabase.from("whoami").select("*");
  // ...
}
```

### Client Components
Mark with `"use client"` directive. Used for:
- Lenis (scroll provider)
- GSAP (animation)

### Utility Function
```ts
// lib/utils.ts
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
```

## TypeScript Config

- Target: ES2017
- Module: ESNext (bundler resolution)
- Strict mode enabled
- Path alias: `@/*` → `./*`
- JSX: react-jsx

## ESLint Config

Flat config extending:
- `eslint-config-next/core-web-vitals`
- `eslint-config-next/typescript`

Ignores: `.next/**`, `out/**`, `build/**`, `next-env.d.ts`

## Notes

- No test files or test configuration found
- No CI/CD configuration visible
- Middleware not explicitly configured in `next.config.ts` but Supabase middleware client exists
- The `terminal.tsx` component exists but appears unused
- Dark mode support via CSS media query in `globals.css`