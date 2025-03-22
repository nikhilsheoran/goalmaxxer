"use client";

import React from "react";
import { motion } from "framer-motion";

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg dark:prose-invert">
          <p className="text-lg text-foreground/80 mb-6">
            Last updated: {new Date().toLocaleDateString()}
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">1. Introduction</h2>
          <p className="text-lg text-foreground/80 mb-6">
            At GoalMaxxer, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">2. Information We Collect</h2>
          <h3 className="text-xl font-semibold mt-8 mb-3">2.1 Personal Information</h3>
          <p className="text-lg text-foreground/80 mb-6">
            We collect information that you provide directly to us, including:
          </p>
          <ul className="space-y-2 text-lg text-foreground/80 mb-6">
            <li>Name and contact information</li>
            <li>Account credentials</li>
            <li>Financial goals and preferences</li>
            <li>Investment history and preferences</li>
          </ul>

          <h3 className="text-xl font-semibold mt-8 mb-3">2.2 Usage Information</h3>
          <p className="text-lg text-foreground/80 mb-6">
            We automatically collect certain information about your device and how you interact with our services, including:
          </p>
          <ul className="space-y-2 text-lg text-foreground/80 mb-6">
            <li>Device information</li>
            <li>Log data</li>
            <li>Usage patterns</li>
            <li>Performance data</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">3. How We Use Your Information</h2>
          <p className="text-lg text-foreground/80 mb-6">
            We use the collected information for various purposes, including:
          </p>
          <ul className="space-y-2 text-lg text-foreground/80 mb-6">
            <li>Providing and improving our services</li>
            <li>Personalizing your experience</li>
            <li>Communicating with you</li>
            <li>Ensuring security and preventing fraud</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">4. Data Security</h2>
          <p className="text-lg text-foreground/80 mb-6">
            We implement appropriate technical and organizational security measures to protect your information. However, no electronic transmission or storage system is 100% secure.
          </p>

          <h2 className="text-2xl font-semibold mt-12 mb-4">5. Your Rights</h2>
          <p className="text-lg text-foreground/80 mb-6">
            You have certain rights regarding your personal information, including:
          </p>
          <ul className="space-y-2 text-lg text-foreground/80 mb-6">
            <li>Access to your data</li>
            <li>Correction of inaccurate data</li>
            <li>Deletion of your data</li>
            <li>Withdrawal of consent</li>
          </ul>

          <h2 className="text-2xl font-semibold mt-12 mb-4">6. Contact Us</h2>
          <p className="text-lg text-foreground/80 mb-6">
            If you have any questions about this Privacy Policy, please contact us at privacy@goalmaxxer.com
          </p>
        </div>
      </motion.div>
    </div>
  );
} 