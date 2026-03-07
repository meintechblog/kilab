import type { Metadata } from "next";
import { IBM_Plex_Mono, Space_Grotesk } from "next/font/google";
import "./globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
});

const ibmPlexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: "kilab Strompreis Dashboard",
  description: "Day-Ahead- und Intraday-Viertelstundenpreise fuer Deutschland auf einem lokalen Dashboard.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body className={`${spaceGrotesk.variable} ${ibmPlexMono.variable} bg-white text-zinc-950 antialiased`}>
        {children}
      </body>
    </html>
  );
}
