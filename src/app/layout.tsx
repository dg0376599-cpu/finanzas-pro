import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinanzasPro | Control Financiero",
  description: "Tu gestor financiero personal",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FinanzasPro",
  },
  icons: {
    apple: "/icon-192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#667eea",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} mesh-bg min-h-screen`}>
        <ServiceWorkerRegister />
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 p-8 min-h-screen">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
