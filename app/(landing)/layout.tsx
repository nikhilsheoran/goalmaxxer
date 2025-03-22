import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function LandingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen">
      <Navbar />
      <div className="pt-24">
        {children}
      </div>
      <Footer />
    </main>
  );
} 