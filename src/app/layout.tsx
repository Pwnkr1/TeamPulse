import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "TeamPulse — AI Retrospective Coach",
  description: "AI-driven retrospective analysis and coaching for engineering teams",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
