"use client";

import React from "react";
import { motion } from "framer-motion";

const features = [
  {
    tag: "Goal Setting",
    description: "Define your 'why'. Get hyper-personalized recommendations.",
  },
  {
    tag: "Risk Assessment",
    description: "Investments that match your vibe.",
  },
  {
    tag: "Easy to Use",
    description: "No prior knowledge required. AI takes care of everything.",
  },
  {
    tag: "Progress Dashboard",
    description: "Watch your goals get closer.",
  },
];

const FeaturesSection = () => {
  return (
    <section className="py-24 bg-gradient-to-b from-background to-secondary/20" id="features">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Key Features</h2>
          <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
            Powerful tools to maximize your financial planning experience.
          </p>
        </motion.div>

        <div className="max-w-4xl mx-auto grid grid-cols-1 gap-8 lg:grid-cols-2">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="bg-card p-8 rounded-xl shadow-sm border border-border flex items-start gap-4 group hover:shadow-md transition-all"
            >
              <div className="bg-primary/10 p-4 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-8 text-primary">
                  <path d="M12 2L2 7l10 5 10-5-10-5z"></path>
                  <path d="M2 17l10 5 10-5"></path>
                  <path d="M2 12l10 5 10-5"></path>
                </svg>
              </div>
              <div>
                <div className="inline-block text-sm font-semibold bg-primary/10 text-primary rounded-full px-3 py-1 mb-2 group-hover:bg-primary group-hover:text-white transition-colors">
                  {feature.tag}
                </div>
                <p className="text-foreground/80">{feature.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
};

export default FeaturesSection; 