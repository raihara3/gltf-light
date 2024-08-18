// lib
import type { Metadata } from "next";
import { Sometype_Mono } from "next/font/google";
import Script from "next/script";

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
      <Script type="module" src="/lib/model-viewer_3.5.0.min.js"></Script>
      <body className={sometypeMono.className}>{children}</body>
    </html>
  );
}
