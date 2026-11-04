import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'The Black Box | Anonymous Chat Rooms & Private Spaces',
  description: 'Create private, dark-themed rooms and chat anonymously instantly. No registration, no tracking—just pure, real-time anonymous conversations inside The Black Box.',
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      style={{ colorScheme: 'light' }}
    >
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Black Box" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
      </head>
      <body
        className="min-h-full flex flex-col"
        suppressHydrationWarning={true}
      >
        <div className="atmos" aria-hidden />
        {children}
      </body>
    </html>
  );
}
