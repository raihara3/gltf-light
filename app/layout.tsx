// lib
import type { Metadata } from "next";
import { Sometype_Mono } from "next/font/google";

const sometypeMono = Sometype_Mono({ subsets: ["latin"] });

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
    <html lang="en">
      <body className={sometypeMono.className}>{children}</body>
    </html>
  );
}
