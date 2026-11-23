import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "SalonBook | Discover and Book Beauty Services",
    template: "%s | SalonBook",
  },
  description:
    "Discover trusted beauty salons, compare services, and book your next appointment with SalonBook.",
  applicationName: "SalonBook",
  keywords: [
    "salon booking",
    "beauty salon",
    "hair salon",
    "spa booking",
    "salon management",
  ],
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