import type { Metadata } from "next";
import "./globals.css";
import { Navigation } from "@/components/navigation";
import { Toaster } from 'react-hot-toast';
import { Radley } from 'next/font/google';

const radley = Radley({
  weight: ['400'],
  subsets: ['latin'],
  variable: '--font-radley',
});

export const metadata: Metadata = {
  title: "ClaudeFund - Get funded to build with Claude Pro",
  description: "Submit your app or website idea. Top 3 most-liked ideas win Claude Pro funding every 24 hours.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={radley.variable}>
      <body className="antialiased bg-[#1a1a1a] text-gray-100">
        <Navigation />
        {children}
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
