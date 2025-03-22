"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const pathname = usePathname();
  const isHomePage = pathname === "/";
  const [scrolled, setScrolled] = useState(false);
  const [showCompact, setShowCompact] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // First threshold for initial navbar fade
      const isScrolled = window.scrollY > 20;
      // Second threshold for compact navbar appearance
      const shouldShowCompact = window.scrollY > 100;

      setScrolled(isScrolled);
      setShowCompact(shouldShowCompact);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleHashLink = (hash: string) => {
    if (isHomePage) {
      return hash;
    } else {
      return `/${hash}`;
    }
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <AnimatePresence mode="wait">
        {!showCompact ? (
          <motion.div
            key="full-navbar"
            initial={{ opacity: 1 }}
            animate={{ opacity: scrolled ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className={cn(
              "w-full border-b border-white/10",
              "bg-background/30 backdrop-blur-md"
            )}
          >
            <div className="container mx-auto flex items-center justify-between h-16 px-6">
              <Link href="/" className="flex items-center gap-2">
                <Image
                  src="/goalmaxxer-dark.png"
                  alt="GoalMaxxer Logo"
                  width={160}
                  height={40}
                  className="hidden dark:block"
                />
                <Image
                  src="/goalmaxxer-light.png"
                  alt="GoalMaxxer Logo"
                  width={160}
                  height={40}
                  className="block dark:hidden"
                />
              </Link>

              <nav className="hidden md:flex items-center gap-8">
                {[
                  { href: "/", label: "Home" },
                  { href: "#features", label: "Features" },
                  { href: "#who-is-it-for", label: "Who is it for?" },
                  { href: "/about", label: "About Us" },
                ].map((link) => (
                  <Link
                    key={link.label}
                    href={link.href.startsWith("#") ? handleHashLink(link.href) : link.href}
                    className={cn(
                      "relative text-sm font-medium",
                      "text-foreground/70 hover:text-foreground",
                      "transition-all duration-300 ease-out",
                      "after:absolute after:-bottom-1 after:left-0",
                      "after:h-0.5 after:w-0 after:rounded-full",
                      "after:bg-gradient-to-r after:from-primary/80 after:to-primary",
                      "after:transition-all after:duration-300 hover:after:w-full",
                      pathname === link.href && "text-foreground after:w-full"
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden sm:flex hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
                  asChild
                >
                  <Link href="/login">Log In</Link>
                </Button>
                <Button
                  size="sm"
                  className={cn(
                    "bg-gradient-to-r from-primary to-primary/90",
                    "hover:from-primary/95 hover:to-primary/85",
                    "transition-colors",
                    "shadow-md shadow-primary/20 font-bold"
                  )}
                  asChild
                >
                  <Link href="/signup">Get Started</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="compact-navbar"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
            className="px-6 py-4"
          >
            <div
              className={cn(
                "mx-auto max-w-6xl",
                "bg-background/50 backdrop-blur-md",
                "border border-white/20 dark:border-white/10",
                "rounded-full shadow-lg shadow-black/5 dark:shadow-black/10",
                "ring-1 ring-black/5 dark:ring-white/5"
              )}
            >
              <div className="flex items-center justify-between h-14 px-4">
                <Link href="/" className="flex items-center gap-2">
                  <div className="scale-[0.85] transition-transform duration-300 ease-in-out">
                    <Image
                      src="/goalmaxxer-dark.png"
                      alt="GoalMaxxer Logo"
                      width={160}
                      height={40}
                      className="hidden dark:block"
                    />
                    <Image
                      src="/goalmaxxer-light.png"
                      alt="GoalMaxxer Logo"
                      width={160}
                      height={40}
                      className="block dark:hidden"
                    />
                  </div>
                </Link>

                <nav className="hidden md:flex items-center gap-8">
                  {[
                    { href: "/", label: "Home" },
                    { href: "#features", label: "Features" },
                    { href: "#who-is-it-for", label: "Who is it for?" },
                    { href: "/about", label: "About Us" },
                  ].map((link) => (
                    <Link
                      key={link.label}
                      href={link.href.startsWith("#") ? handleHashLink(link.href) : link.href}
                      className={cn(
                        "relative text-sm font-medium",
                        "text-foreground/70 hover:text-foreground",
                        "transition-all duration-300 ease-out",
                        "after:absolute after:-bottom-1 after:left-0",
                        "after:h-0.5 after:w-0 after:rounded-full",
                        "after:bg-gradient-to-r after:from-primary/80 after:to-primary",
                        "after:transition-all after:duration-300 hover:after:w-full",
                        pathname === link.href && "text-foreground after:w-full"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </nav>

                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={cn(
                      "hidden sm:flex rounded-full px-6",
                      "hover:bg-white/10 dark:hover:bg-white/5",
                      "transition-colors"
                    )}
                    asChild
                  >
                    <Link href="/login">Log In</Link>
                  </Button>
                  <Button
                    size="sm"
                    className={cn(
                      "bg-gradient-to-r from-primary to-primary/90",
                      "hover:from-primary/95 hover:to-primary/85",
                      "transition-colors",
                      "shadow-md shadow-primary/20",
                      "rounded-full px-6 py-2 font-bold"
                    )}
                    asChild
                  >
                    <Link href="/signup">Get Started</Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar; 