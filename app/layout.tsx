import type { Metadata } from "next";
import "./globals.css";
import localFont from "next/font/local";

const materialSymbols = localFont({
  src: "../node_modules/@fontsource/material-symbols-outlined/files/material-symbols-outlined-latin-400-normal.woff2",
  variable: "--font-material",
  weight: "400",
  style: "normal",
  display: "swap",
});

export const metadata: Metadata = {
  title: "IVA App",
  description: "Continuous reporting for students and teachers",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${materialSymbols.variable} bg-background text-gray-900`}>
        {children}
      </body>
    </html>
  );
}
