import type { Metadata } from "next";
import "./globals.css";
import { SessionProviderShell } from "@/components/auth/session-provider-shell";

export const metadata: Metadata = {
  title: "FORGE by Wild Card",
  description: "Cashless cafeteria platform for schools.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SessionProviderShell>{children}</SessionProviderShell>
      </body>
    </html>
  );
}
