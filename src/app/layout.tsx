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
      {/* Forzamos el fondo oscuro en todo el html para evitar bordes blancos */}
      <body className={inter.className} style={{ backgroundColor: '#0a0a0a', margin: 0 }}>
        <Providers>
          <div className="flex min-h-screen">
            
            <Sidebar />

            {/* CONTENEDOR PRINCIPAL */}
            <main 
              style={{ 
                marginLeft: '200px', // El ancho de tu sidebar
                width: 'calc(100% - 200px)',
                minHeight: '100vh',
                backgroundColor: '#0a0a0a' 
              }}
            >
              {/* Este es el "aire" que le faltaba: p-10 (más espacio) y un max-width */}
              <div className="p-10 max-w-[1600px] mx-auto">
                {children}
              </div>
            </main>

          </div>
        </Providers>
      </body>
    </html>
  );
}
