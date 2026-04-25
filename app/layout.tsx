import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Drop Gallery",
  description: "Campus Anonymous Pulse",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
  lang="en"
  className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
  style={{ colorScheme: 'dark' }}
>
      {/* suppressHydrationWarning prevents errors caused by browser extensions injecting code */}
      <body 
        className="min-h-full flex flex-col" 
        suppressHydrationWarning={true}
      >
        {children}
      </body>
    </html>
  );
}
