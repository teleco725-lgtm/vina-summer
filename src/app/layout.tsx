import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "sonner";
import { Providers } from "@/components/providers/session-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Viña Summer · Dashboard Municipal",
  description:
    "Dashboard de gestión de playas, piscinas municipales y gimnasios con piscina de Viña del Mar. Mapa GPS, matrículas y asignación de colaboradores con protección de datos.",
  keywords: [
    "Viña del Mar",
    "playas",
    "piscina municipal",
    "gimnasio municipal",
    "colaboradores",
    "matrículas",
    "dashboard",
  ],
  authors: [{ name: "Municipalidad de Viña del Mar" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <Providers>
          {children}
        </Providers>
        <Toaster />
        <SonnerToaster position="top-right" richColors closeButton />
      </body>
    </html>
  );
}
