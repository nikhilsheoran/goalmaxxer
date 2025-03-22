"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowRight, Goal } from "lucide-react";
import Link from "next/link";

const CTASection = () => {
  return (
    <section className="relative py-24 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-primary/10" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(ellipse_at_center,rgba(var(--primary-rgb),0.08),transparent_50%)]" />
      </div>

      <div className="container relative mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative max-w-4xl mx-auto"
        >
          {/* Card background with enhanced styling */}
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 to-zinc-900 rounded-2xl transform rotate-1 opacity-70" />
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-950 to-zinc-900 rounded-2xl transform -rotate-1 opacity-70" />
          
          <div className="relative bg-gradient-to-b from-zinc-950 to-zinc-900 rounded-2xl p-12 border border-primary/30 shadow-2xl backdrop-blur-sm">
            {/* Decorative top accent */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-1/2 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center flex flex-col items-center gap-4"
            >
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
                className="flex items-center justify-center gap-4"
              >
                <div className="relative">
                  <div className="absolute inset-0 bg-primary/20 rounded-full blur-md" />
                  <div className="relative bg-gradient-to-br from-primary/30 to-primary/10 p-4 rounded-full border border-primary/30">
                    <Goal className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h2 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                  Ready to max out your financial goals?
                </h2>
              </motion.div>
              <p className="text-zinc-200 text-lg max-w-2xl mx-auto leading-relaxed">
                Join GoalMaxxer today and start aligning your investments with your life goals.
              </p>

              <motion.div 
                className="flex flex-col sm:flex-row gap-4 justify-center"
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Button 
                  size="lg" 
                  className="relative px-8 bg-white text-zinc-900 font-semibold shadow-lg hover:bg-zinc-100 transition-all duration-300 group"
                  asChild
                >
                  <Link href="/sign-in">
                    <span className="relative z-10 flex items-center gap-2">
                      Get Started for Free
                      <ArrowRight className="w-4 h-4" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-transparent to-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                  </Link>
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="px-8 bg-transparent border-white/30 text-white hover:text-zinc-100 hover:bg-white/10 hover:border-white transition-all duration-300"
                  asChild
                >
                  <Link href="/contact">Schedule a Demo</Link>
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CTASection;

 