import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FinCoach VN - AI-Powered 6-Jar Money Management",
  description: "Empower your financial journey with AI-powered money management using the 6-jar method. Built for young Vietnamese professionals.",
  keywords: "personal finance, money management, 6-jar method, budgeting, Vietnam, VPBank",
  authors: [{ name: "Team 261" }],
  openGraph: {
    title: "FinCoach VN - Smart Money Management",
    description: "Take control of your finances with the 6-jar method",
    type: "website",
    locale: "vi_VN",
    alternateLocale: "en_US",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased bg-gray-50`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
