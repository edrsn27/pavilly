// Pavilly — Next.js font setup using next/font.
// Drop into app/fonts.ts and import { sans, mono } in app/layout.tsx.

import { Geist, Geist_Mono } from "next/font/google";

export const sans = Geist({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-sans",
  display: "swap",
});

export const mono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-mono",
  display: "swap",
});
