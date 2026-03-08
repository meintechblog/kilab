import type { Metadata } from "next";
import { Fira_Code, Fira_Sans } from "next/font/google";
import "./globals.css";

const firaSans = Fira_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const firaCode = Fira_Code({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "kilab Strompreis Dashboard",
  description: "Day-Ahead- und Intraday-Viertelstundenpreise fuer Deutschland mit Realpreis- und Fixpreisvergleich.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de">
      <body className={`${firaSans.variable} ${firaCode.variable} bg-[#07111f] text-slate-50 antialiased`}>
        {children}
      </body>
    </html>
  );
}
