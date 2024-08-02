import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dan Habot | danhab99",
  description: "My links",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
        <div className="h-screen w-screen fixed top-0 z-[-1000] bg-gradient-to-br from-slate-600 to-slate-800 p-4"></div>
      </body>
    </html>
  );
}
