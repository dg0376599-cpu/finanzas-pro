import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";
import ServiceWorkerRegister from "@/components/ServiceWorkerRegister";
import { CurrencyProvider } from "@/context/CurrencyContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinanzasPro | Control Financiero",
  description: "Tu gestor financiero personal - Venezuela",
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={`${inter.className} mesh-bg min-h-screen`}>
        <CurrencyProvider>
          <ServiceWorkerRegister />
          <div className="flex min-h-screen">
            <Sidebar />
            {/* desktop: ml-64 for sidebar | mobile: mt-14 top bar + mb-20 bottom nav */}
            <main className="flex-1 md:ml-64 mt-14 md:mt-0 mb-20 md:mb-0 p-4 md:p-8 min-h-screen w-full">
              {children}
            </main>
          </div>
        </CurrencyProvider>
      </body>
    </html>
  );
}
