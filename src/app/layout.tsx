import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SalonBook | Discover Beauty & Wellness",
    template: "%s | SalonBook",
  },

  description:
    "Discover trusted beauty salons, explore services, compare prices, and book your next appointment with SalonBook.",

  applicationName: "SalonBook",

  keywords: [
    "SalonBook",
    "beauty salon",
    "salon booking",
    "hair salon",
    "spa booking",
    "beauty services",
    "salon management",
  ],

  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fcfaf9",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}