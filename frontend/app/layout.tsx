import type { Metadata } from "next";
import { Syne, Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

export const metadata: Metadata = {
  title: "Backlog.gg",
  description: "Your game library, organized.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${syne.variable} ${inter.variable}`}>
      <body className="font-[family-name:var(--font-inter)]">
        {children}

        <Toaster
          position="bottom-right"
          theme="dark"
          toastOptions={{
            className: "border border-white/10 backdrop-blur-xl",
            style: {
              background: "rgba(20,20,35,0.65)",
              color: "white",
            },
          }}
        />
      </body>
    </html>
  );
}

