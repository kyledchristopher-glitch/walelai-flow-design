import "./globals.css";
import type { ReactNode } from "react";

export const metadata = {
  title: "WorkOutput Judgment OS",
  description: "Decision CRM for improving human judgment over time",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
