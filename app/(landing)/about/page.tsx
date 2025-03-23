"use client";

import React from "react";
import { motion } from "framer-motion";

const teamMembers = [
  {
    name: "Nikhil Sheoran",
    role: "Full Stack Developer",
    social: {
      github: "https://github.com/nikhilsheoran",
      linkedin: "https://www.linkedin.com/in/nikhilsheoran/",
      twitter: "https://x.com/_nikhilsheoran"
    }
  },
  {
    name: "Aashay Naik",
    role: "Full Stack Developer",
    social: {
      github: "https://github.com/ash594",
      linkedin: "https://www.linkedin.com/in/aashay-naik-43554328b/",
      twitter: "#"
    }
  },
  {
    name: "Utkarsh Misra",
    role: "Full Stack Developer",
    social: {
      github: "https://github.com/utkarshmisra0211",
      linkedin: "https://www.linkedin.com/in/utkarsh-misra-a4b745267/",
      twitter: "#"
    }
  },
  {
    name: "Mohak Jain",
    role: "Full Stack Developer",
    social: {
      github: "https://github.com/mjain1110",
      linkedin: "https://www.linkedin.com/in/mohak-jain-3b2b84262/",
      twitter: "https://x.com/mohakj_"
    }
  },
  {
    name: "Ashit Jain",
    role: "Full Stack Developer",
    social: {
      github: "https://github.com/ASHJAIN9374",
      linkedin: "https://www.linkedin.com/in/ashit-jain-9b7b7324b/",
      twitter: "#"
    }
  },
  {
    name: "Gaurav Singh",
    role: "Full Stack Developer",
    social: {
      github: "#",
      linkedin: "https://www.linkedin.com/in/gaurav-singh-835b98256/",
      twitter: "#"
    }
  }
];

const TeamMemberCard = ({ member }: { member: typeof teamMembers[0] }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="bg-card border border-border rounded-xl p-6 flex flex-col items-center"
    >
      <div className="w-32 h-32 bg-primary/10 rounded-full mb-4 flex items-center justify-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="size-16 text-primary/60" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
          <circle cx="12" cy="7" r="4"></circle>
        </svg>
      </div>
      <h3 className="text-xl font-semibold mb-1">{member.name}</h3>
      <p className="text-foreground/60 text-sm mb-4">{member.role}</p>
      <div className="flex gap-4">
        <a href={member.social.github} className="text-foreground/60 hover:text-foreground transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
            <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path>
          </svg>
        </a>
        <a href={member.social.linkedin} className="text-foreground/60 hover:text-foreground transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
            <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
            <rect width="4" height="12" x="2" y="9"></rect>
            <circle cx="4" cy="4" r="2"></circle>
          </svg>
        </a>
        <a href={member.social.twitter} className="text-foreground/60 hover:text-foreground transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
            <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
          </svg>
        </a>
      </div>
    </motion.div>
  );
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-6">About GoalMaxxer</h1>
          <p className="text-lg text-foreground/80 max-w-4xl mx-auto mb-6">
            GoalMaxxer is a modern goal-based investment platform developed at the Dezerv X BITS Goa Hackathon 2025. Our mission is to revolutionize personal finance by making goal-based investing accessible, intuitive, and effective for everyone.
          </p>
          <p className="text-lg text-foreground/80 max-w-4xl mx-auto">
            Created by Team VibeCoders, our platform combines cutting-edge technology with user-friendly design to help you define, track, and achieve your financial goals with confidence.
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mb-20 bg-card border border-border rounded-xl p-8"
        >
          <h2 className="text-2xl font-semibold mb-6 text-center">Our Innovative Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-background p-6 rounded-lg border border-border flex flex-col h-full">
              <div className="size-12 bg-primary/10 rounded-full mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-6 text-primary" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Personalized Goal Setting</h3>
              <p className="text-foreground/70 flex-grow">Define and track your financial goals, from retirement to education planning, with personalized recommendations.</p>
            </div>
            <div className="bg-background p-6 rounded-lg border border-border flex flex-col h-full">
              <div className="size-12 bg-primary/10 rounded-full mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-6 text-primary" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z"></path>
                  <path d="M12 2v2"></path>
                  <path d="M12 20v2"></path>
                  <path d="m4.93 4.93 1.41 1.41"></path>
                  <path d="m17.66 17.66 1.41 1.41"></path>
                  <path d="M2 12h2"></path>
                  <path d="M20 12h2"></path>
                  <path d="m6.34 17.66-1.41 1.41"></path>
                  <path d="m19.07 4.93-1.41 1.41"></path>
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Smart Investment Recommendations</h3>
              <p className="text-foreground/70 flex-grow">Get tailored investment suggestions based on your goals, risk tolerance, and time horizon.</p>
            </div>
            <div className="bg-background p-6 rounded-lg border border-border flex flex-col h-full">
              <div className="size-12 bg-primary/10 rounded-full mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="size-6 text-primary" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                </svg>
              </div>
              <h3 className="text-xl font-medium mb-2">Real-time Progress Tracking</h3>
              <p className="text-foreground/70 flex-grow">Monitor your journey towards financial objectives with interactive dashboards and visual progress indicators.</p>
            </div>
          </div>
        </motion.div>

        <div className="mb-20" id="team">
          <h2 className="text-2xl font-semibold mb-8 text-center">Meet Our Team</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {teamMembers.map((member, index) => (
              <TeamMemberCard key={index} member={member} />
            ))}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-semibold">The Challenge</h2>
            <p className="text-lg text-foreground/80">
              We tackled the Goal-Based Investing track at the hackathon, focusing on creating innovative tools that help users align their investments with their personal financial goals. Our solution combines cutting-edge technology with user-friendly design to make financial planning accessible to everyone.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <h2 className="text-2xl font-semibold">Our Values</h2>
            <ul className="space-y-4 text-foreground/80">
              <li className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary"></div>
                <span><strong>Innovation:</strong> We leverage technology to create intuitive financial planning solutions.</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary"></div>
                <span><strong>Accessibility:</strong> We believe financial planning should be understandable and achievable for everyone.</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary"></div>
                <span><strong>User-Centric:</strong> Our platform is designed around real user needs and goals.</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="size-2 rounded-full bg-primary"></div>
                <span><strong>Security:</strong> We prioritize the protection of your financial data.</span>
              </li>
            </ul>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20"
        >
          <h2 className="text-2xl font-semibold mb-6">Our Solution</h2>
          <p className="text-lg text-foreground/80 mb-8">
            GoalMaxxer helps you define your financial goals, whether it's saving for retirement, buying a home, or funding education. Our platform provides personalized investment recommendations and real-time tracking to ensure you stay on course to achieve your goals. We combine advanced technology with an intuitive interface to make financial planning accessible and effective.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="bg-primary/5 rounded-xl p-8 border border-primary/10">
              <h3 className="text-xl font-semibold mb-3">Tech Stack</h3>
              <ul className="space-y-2 text-foreground/80">
                <li className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-primary"></div>
                  <span><strong>Frontend:</strong> Next.js 15, React 19, TailwindCSS</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-primary"></div>
                  <span><strong>Authentication:</strong> Clerk for robust user authentication</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-primary"></div>
                  <span><strong>Animations:</strong> Framer Motion for smooth transitions</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="size-2 rounded-full bg-primary"></div>
                  <span><strong>Development:</strong> TypeScript, ESLint, Turbopack</span>
                </li>
              </ul>
            </div>
            
            <div className="bg-primary/5 rounded-xl p-8 border border-primary/10">
              <h3 className="text-xl font-semibold mb-3">Hackathon Recognition</h3>
              <p className="text-foreground/80 mb-4">
                Created at the Dezerv X BITS Goa Hackathon 2025, where we focused on revolutionizing personal finance through goal-based investing solutions.
              </p>
              <p className="text-foreground/80">
                Our team is proud to have developed a solution that addresses real financial planning challenges while providing an exceptional user experience.
              </p>
            </div>
          </div>

          <div className="bg-card border border-border rounded-xl p-8">
            <h3 className="text-xl font-semibold mb-3">Looking Forward</h3>
            <p className="text-foreground/80 mb-4">
              We're committed to continuously improving GoalMaxxer with new features and enhancements. Our roadmap includes:
            </p>
            <ul className="space-y-2 text-foreground/80">
              <li className="flex items-start gap-2">
                <div className="size-2 rounded-full bg-primary mt-2"></div>
                <span>Advanced AI-powered financial forecasting for more accurate goal planning</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="size-2 rounded-full bg-primary mt-2"></div>
                <span>Expanded investment options to provide more diversified portfolio recommendations</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="size-2 rounded-full bg-primary mt-2"></div>
                <span>Enhanced mobile experience with native app development</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="size-2 rounded-full bg-primary mt-2"></div>
                <span>Integration with additional financial institutions for seamless account management</span>
              </li>
            </ul>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20 text-center"
        >
          <h2 className="text-2xl font-semibold mb-6">Get Started Today</h2>
          <p className="text-lg text-foreground/80 mb-8 max-w-3xl mx-auto">
            Ready to take control of your financial future? Sign up for GoalMaxxer today and start your journey toward achieving your financial goals with confidence.
          </p>
          <a href="/sign-up" className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-lg font-medium text-white hover:bg-primary/90 transition-colors">
            Start Your Financial Journey
          </a>
        </motion.div>
      </motion.div>
    </div>
  );
} 