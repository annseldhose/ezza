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
    <html lang="en">
      <head>
        <script src="https://aframe.io/releases/1.4.2/aframe.min.js"></script>
      </head>
      <body>{children}</body>
    </html>
  );
}
