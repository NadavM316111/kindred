import type { Metadata, Viewport } from "next";
import Header from "@/components/Header";
import { FONT } from "@/lib/theme";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kindred",
  description: "Kindred watches a patient's wearable during cancer treatment and warns their coach before a rough patch.",
};

export const viewport: Viewport = { width: "device-width", initialScale: 1, viewportFit: "cover" };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400;500;700;800&display=swap" />
      </head>
      <body style={{ fontFamily: FONT, minHeight: "100vh" }}>
        <Header />
        {children}
      </body>
    </html>
  );
}