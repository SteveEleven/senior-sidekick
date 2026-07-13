import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SeniorSidekick",
  description: "Simple, step-by-step tech help.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
