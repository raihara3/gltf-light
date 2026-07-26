// lib
import type { Metadata } from "next";
import { Sometype_Mono } from "next/font/google";
import { Analytics } from "./Analytics";

const sometypeMono = Sometype_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "GLTF Light",
  description: "Lightweight service specialized in gltf",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={sometypeMono.variable}>
      <body>{children}</body>
      <Analytics />
    </html>
  );
}
