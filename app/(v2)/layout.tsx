import type { Metadata } from "next";
import { Space_Grotesk } from "next/font/google";
import { AppShell } from "./components/AppShell";
import "./styles/global.scss";

// Wordmark / brand typeface. The Figma logotype uses Host Grotesk, which is not
// available in `next/font` on Next 14; Space Grotesk is the closest bundled
// grotesk and is applied only to the "gltf-light" wordmark.
const brandFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-brand",
  display: "swap",
});

// Metadata is rendered on the server and can't read the client-persisted
// locale, so it stays in English (per-locale metadata would need URL routing).
export const metadata: Metadata = {
  title: "gltf-light",
  description: "Preview & optimize glb, offline",
};

export default function V2Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell fontClassName={brandFont.variable}>{children}</AppShell>;
}
