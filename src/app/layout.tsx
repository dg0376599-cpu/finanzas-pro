import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { AuthProvider } from "@/context/AuthContext";
import AppShell from "@/components/AppShell";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinanzasPro | Control Financiero",
  description: "Tu gestor financiero personal - Venezuela",
  manifest: "/manifest.json",
  appleWebApp: { capable: true, statusBarStyle: "black-translucent", title: "FinanzasPro" },
  icons: { apple: "/icon-192.png" },
};

export const viewport: Viewport = { themeColor: "#667eea" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} mesh-bg min-h-screen`}>
        <AuthProvider>
          <CurrencyProvider>
            <AppShell>{children}</AppShell>
          </CurrencyProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
