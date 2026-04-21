import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar/Sidebar";
import { Providers } from "@/components/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OTG Constructora CRM",
  description: "Sistema de gestión de leads para OTG Constructora",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          {/* Usamos flex para garantizar que el Sidebar y el Main estén uno al lado del otro */}
          <div className="flex min-h-screen">
            <Sidebar />
            <main className="flex-1 bg-gray-50 overflow-y-auto">
              {children}
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
