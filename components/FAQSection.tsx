"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const faqs = [
  {
    question: "How does GoalMaxxer personalize my plan?",
    answer: "We assess your goals, timeline, and risk tolerance to build a custom strategy that aligns with your specific financial objectives. Our algorithm analyzes multiple factors to create an investment plan uniquely suited to your needs.",
  },
  {
    question: "Is my financial data secure?",
    answer: "Absolutely. We use bank-level encryption and never share your information with third parties. Your security is our top priority, and we implement the latest security protocols to ensure your data remains protected.",
  },
  {
    question: "Can I change my goals later?",
    answer: "Yes! Life changes—GoalMaxxer adapts with you. You can adjust your goals, timelines, and investment preferences at any time, and our system will recalibrate your investment strategy accordingly.",
  },
  {
    question: "How often should I check my investments?",
    answer: "While GoalMaxxer provides real-time updates, we recommend a monthly review of your progress. This balanced approach helps you stay informed without getting caught up in daily market fluctuations.",
  },
];

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="border-b border-border last:border-0"
    >
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex justify-between items-center w-full py-6 text-left text-foreground font-medium focus:outline-none"
      >
        <span>{question}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`size-5 transition-transform ${isOpen ? "rotate-180" : ""}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <p className="pb-6 text-foreground/70">{answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const FAQSection = () => {
  return (
    <section className="py-24" id="faq">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
          <p className="text-foreground/70 text-lg max-w-2xl mx-auto">
            Find answers to common questions about GoalMaxxer.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl mx-auto bg-card rounded-xl shadow-md border border-border p-6 md:p-8"
        >
          {faqs.map((faq, index) => (
            <FAQItem key={index} question={faq.question} answer={faq.answer} />
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FAQSection; 