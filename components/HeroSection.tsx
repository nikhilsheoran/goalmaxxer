"use client";

import React from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-24 pb-16">
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent -z-10" />
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="space-y-6"
          >
            <motion.h1 
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.3 }}
            >
              Struggling to align your investments with your financial goals?
            </motion.h1>
            
            <motion.p 
              className="text-xl text-foreground/80 max-w-xl"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.5 }}
            >
              GoalMaxxer makes it effortless to plan and track investments tailored to your life goals.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.7, delay: 0.7 }}
              className="pt-4"
            >
              <Button size="lg" className="text-base px-8 py-6">
                Start Planning Now
              </Button>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="bg-card rounded-xl shadow-lg border border-border p-2 relative overflow-hidden"
          >
            <div className="relative rounded-lg overflow-hidden aspect-video bg-gradient-to-tr from-primary/10 to-accent/10 flex items-center justify-center">
              <div className="absolute inset-0 bg-pattern opacity-5"></div>
              <div className="text-center p-8">
                <p className="text-xl font-medium mb-4">Demo Video</p>
                <p className="text-foreground/70">Watch how GoalMaxxer helps plan and track your financial goals</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection; 