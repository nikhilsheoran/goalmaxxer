import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const Footer = () => {
  return (
    <footer className="w-full bg-card border-t border-border">
        <div className="p-4 mx-auto max-w-7xl flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm">
            © {new Date().getFullYear()} GoalMaxxer, Made with ❤️ by Team VibeCoders.
          </p>
          <div className="flex gap-4">
            <Link href="/privacy" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-foreground/60 hover:text-foreground transition-colors">Terms of Use</Link>
          </div>
        </div>
    </footer>
  );
};

export default Footer; 