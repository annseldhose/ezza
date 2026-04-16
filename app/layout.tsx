import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Ezza - 360° Room Viewer",
  description: "Interactive 360° interior room showcase",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-slate-950">
      <head>
        <meta name="theme-color" content="#0f172a" />
      </head>
      <body className="bg-slate-950 text-white overflow-hidden">{children}</body>
    </html>
  );
}
