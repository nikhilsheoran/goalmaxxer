"use client";

import React from "react";
import { motion } from "framer-motion";

const integrations = [
  {
    name: "Plaid",
    description: "Secure financial data connections",
    logo: (
      <svg viewBox="0 0 24 24" className="size-12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="12" fill="currentColor" fillOpacity="0.1" />
        <path d="M8 8.5H12V15.5H8V8.5Z" fill="currentColor" />
        <path d="M12 8.5H16V12.5H12V8.5Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Mint",
    description: "Budget tracking integration",
    logo: (
      <svg viewBox="0 0 24 24" className="size-12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="12" fill="currentColor" fillOpacity="0.1" />
        <path d="M12 6L16 12L12 18L8 12L12 6Z" fill="currentColor" />
      </svg>
    ),
  },
  {
    name: "Morningstar",
    description: "Investment insights and analysis",
    logo: (
      <svg viewBox="0 0 24 24" className="size-12" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="24" height="24" rx="12" fill="currentColor" fillOpacity="0.1" />
        <path d="M12 6L14.5 10.5L20 11.5L16 15L17 20.5L12 18L7 20.5L8 15L4 11.5L9.5 10.5L12 6Z" fill="currentColor" />
      </svg>
    ),
  },
];

const IntegrationsSection = () => {
  return (
    <section className="py-24 bg-muted/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Tools & Integrations</h2>
          <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
            GoalMaxxer works seamlessly with the tools you already use.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-4xl mx-auto"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {integrations.map((integration, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-card rounded-xl shadow-md p-8 text-center flex flex-col items-center border border-border hover:shadow-lg transition-all"
              >
                <div className="text-primary mb-4">{integration.logo}</div>
                <h3 className="text-xl font-semibold mb-2">{integration.name}</h3>
                <p className="text-foreground/70">{integration.description}</p>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-16 text-center"
          >
            <p className="text-foreground/70">
              For now, we pull demo data. <a href="#" className="text-primary font-medium hover:underline">Request an integration</a>
            </p>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default IntegrationsSection; 