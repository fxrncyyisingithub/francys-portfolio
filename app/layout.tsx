import type { Metadata } from "next";
import { Geist_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/lenis";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://francy.dev";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: "francy's portfolio",
  description:
    "An interactive terminal-style portfolio. Software engineer — skills, projects and whoami served live from Supabase.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    title: "francy's portfolio",
    description:
      "An interactive terminal-style portfolio. Skills, projects and whoami served live from Supabase.",
    url: BASE_URL,
    siteName: "francy's portfolio",
  },
  twitter: {
    card: "summary_large_image",
    title: "francy's portfolio",
    description:
      "An interactive terminal-style portfolio. Skills, projects and whoami served live from Supabase.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Francy",
    url: BASE_URL,
    jobTitle: "Software Engineer",
    description: "A developer who loves coding. Based in Italy.",
    sameAs: ["https://github.com/frxncyy"],
  };

  return (
    <html lang="en" className={`${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-black text-white font-mono antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
