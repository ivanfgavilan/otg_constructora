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
          <div className="flex min-h-screen">
            {/* El Sidebar está fijo por CSS, así que no ocupa espacio en el flujo flex */}
            <Sidebar />

            {/* Agregamos ml-[200px] para compensar el ancho del Sidebar fijo */}
            <main className="flex-1 bg-gray-50 overflow-y-auto ml-[200px]">
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
