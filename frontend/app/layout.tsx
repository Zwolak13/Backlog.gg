import type { Metadata } from "next";
import { Syne } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

const syne = Syne({ subsets: ["latin"], variable: "--font-syne", display: "swap" });

export const metadata: Metadata = {
  title: "Backlog.gg",
  description: "Your game library, organized.",
};

export default function RootLayout({
  children,
  auth,
  dashboard,
}: {
  children: React.ReactNode;
  auth: React.ReactNode;
  dashboard: React.ReactNode;
}) {
  return (
    <html lang="en" className={syne.variable}>
      <body>
        {auth}
        {dashboard}
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

