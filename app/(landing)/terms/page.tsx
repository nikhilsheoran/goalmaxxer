"use client";

import React from "react";
import { motion } from "framer-motion";

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8">Terms of Use</h1>
        
        <div className="prose prose-lg dark:prose-invert">
          <p className="text-lg text-foreground/80 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">1. Acceptance of Terms</h2>
          <p className="text-lg text-foreground/80 mb-6">
            By accessing and using GoalMaxxer's services, you agree to be bound by these Terms of Use and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using or accessing our service.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">2. Use License</h2>
          <p className="text-lg text-foreground/80 mb-6">
            Permission is granted to temporarily access and use GoalMaxxer's services for personal, non-commercial purposes. This license does not include:
          </p>
          <ul className="space-y-2 text-lg text-foreground/80 mb-6">
            <li>Modifying or copying our materials</li>
            <li>Using materials for commercial purposes</li>
            <li>Attempting to reverse engineer any software</li>
            <li>Removing any copyright or proprietary notations</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">3. Account Responsibilities</h2>
          <p className="text-lg text-foreground/80 mb-6">
            You are responsible for:
          </p>
          <ul className="space-y-2 text-lg text-foreground/80 mb-6">
            <li>Maintaining the confidentiality of your account</li>
            <li>All activities that occur under your account</li>
            <li>Notifying us of any unauthorized use</li>
            <li>Ensuring your account information is accurate</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">4. Service Modifications</h2>
          <p className="text-lg text-foreground/80 mb-6">
            GoalMaxxer reserves the right to:
          </p>
          <ul className="space-y-2 text-lg text-foreground/80 mb-6">
            <li>Modify or discontinue any part of our service</li>
            <li>Change service fees with notice</li>
            <li>Restrict access to some or all features</li>
            <li>Update these terms at any time</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">5. Disclaimer</h2>
          <p className="text-lg text-foreground/80 mb-6">
            Our services are provided "as is" without any warranties, expressed or implied. GoalMaxxer does not warrant that our services will be uninterrupted or error-free.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">6. Limitation of Liability</h2>
          <p className="text-lg text-foreground/80 mb-6">
            GoalMaxxer shall not be liable for any indirect, incidental, special, consequential, or punitive damages resulting from your use or inability to use our services.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">7. Contact Information</h2>
          <p className="text-lg text-foreground/80 mb-6">
            If you have any questions about these Terms of Use, please contact us at legal@goalmaxxer.com
          </p>
        </div>
      </motion.div>
    </div>
  );
} 