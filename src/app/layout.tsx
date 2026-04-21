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
      <body className={inter.className} style={{ backgroundColor: '#0a0a0a', margin: 0 }}>
        <Providers>
          <div className="flex min-h-screen">
            {/* El Sidebar está fijo por su CSS (position: fixed) */}
            <Sidebar />

            {/* FORZAMOS el margen izquierdo de 200px con style inline */}
            <main 
              style={{ marginLeft: '200px', width: 'calc(100% - 200px)' }} 
              className="flex-1 min-h-screen overflow-y-auto"
            >
              <div className="p-8">
                {children}
              </div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
