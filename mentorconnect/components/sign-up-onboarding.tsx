"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SignUpForm } from "./sign-up-form";
import ProfileForm from "./profile-form";

type Role = "mentee" | "peer" | "senior" | "professional" | null;

const pageVariants = {
  hidden: { opacity: 0, x: 100 },
  visible: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -100 },
};

const transition = { duration: 0.4, ease: "easeInOut" as const };

export function SignUpOnboarding() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<Role>(null);

  const handleRoleSelect = (selectedRole: Role) => {
    setRole(selectedRole);
    setStep(3);
  };

  return (
    <section id="center">
      <AnimatePresence mode="wait">

        {/* STEP 1 — Email / password form */}
        {step === 1 && (
          <motion.div
            key="step1"
            className="w-full max-w-sm"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transition}
          >
            <SignUpForm onSuccess={() => setStep(2)} />
          </motion.div>
        )}

        {/* STEP 2 — Role selection */}
        {step === 2 && (
          <motion.div
            key="step2"
            className="form"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transition}
          >
            <div
              onClick={() => setStep(1)}
              className="mb-5 cursor-pointer text-sm text-muted-foreground hover:text-foreground"
            >
              &lt; Back
            </div>

            <h1 className="form-title">I am a...</h1>
            <p className="form-subtitle">
              Choose the role that best describes you. This shapes your profile.
            </p>

            <div className="roles-grid">
              <div className="role-tile" onClick={() => handleRoleSelect("mentee")}>
                <div className="tile-title">Mentee</div>
                <div className="tile-desc">First year student</div>
              </div>

              <div className="role-tile" onClick={() => handleRoleSelect("peer")}>
                <div className="tile-title">Peer mentor</div>
                <div className="tile-desc">2nd year UG</div>
              </div>

              <div className="role-tile" onClick={() => handleRoleSelect("senior")}>
                <div className="tile-title">Senior peer mentor</div>
                <div className="tile-desc">3rd / 4th year UG</div>
              </div>

              <div className="role-tile" onClick={() => handleRoleSelect("professional")}>
                <div className="tile-title">Professional mentor</div>
                <div className="tile-desc">M.Tech / PhD</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* STEP 3 — Profile form */}
        {step === 3 && role && (
          <motion.div
            key="step3"
            className="form"
            variants={pageVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={transition}
          >
            <ProfileForm role={role} onBack={() => setStep(2)} />
          </motion.div>
        )}

      </AnimatePresence>
    </section>
  );
}
