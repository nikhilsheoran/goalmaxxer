import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";
const geist = Geist({
  variable: "--font-geist",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "GoalMaxxer - Align your investments with your financial goals",
  description: "GoalMaxxer makes it effortless to plan and track investments tailored to your life goals.",
  keywords: "financial goals, investment planning, goal tracking, retirement planning, wealth management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body
        className={`${geist.variable} ${geistMono.variable} antialiased`}
      >
        <ClerkProvider>
          <Toaster richColors />
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
