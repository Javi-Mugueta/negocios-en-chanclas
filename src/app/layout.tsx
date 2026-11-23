import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono, Instrument_Serif } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const serif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Negocios en Chanclas – Gestión LLC´s",
    template: "%s · Negocios en Chanclas",
  },
  description:
    "Tu LLC en Estados Unidos, con atención en español e inglés y sin agobios. Presentación anual de los formularios 1120 y 5472, baja de LLC y acompañamiento humano.",
  applicationName: "Negocios en Chanclas",
  metadataBase: new URL("https://negociosenchanclas.com"),
  openGraph: {
    title: "Negocios en Chanclas – Gestión LLC´s",
    description: "Tu empresa en EE. UU., sin quitarte las chanclas.",
    locale: "es_ES",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#fbf6ee",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="es-ES"
      suppressHydrationWarning
      className={`${display.variable} ${serif.variable} ${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <head>
        <script
          dangerouslySetInnerHTML={{ __html: "document.documentElement.classList.add('js')" }}
        />
      </head>
      <body className="flex min-h-full flex-col">
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
