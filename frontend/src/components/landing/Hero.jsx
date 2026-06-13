import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { Icon } from "@iconify/react";
import MorningBoard from "./MorningBoard";

export default function Hero() {
  const reduce = useReducedMotion();
  const ease = [0.2, 0, 0, 1];

  const container = {
    hidden: {},
    show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
  };
  const item = {
    hidden: reduce ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease } },
  };

  return (
    <header className="max-w-6xl mx-auto px-4 md:px-8 pt-16 md:pt-24 pb-16">
      <div className="grid lg:grid-cols-12 gap-10 lg:gap-12 items-center">
        <motion.div
          className="lg:col-span-7 min-w-0"
          variants={container}
          initial="hidden"
          animate="show"
        >
          <motion.span
            variants={item}
            className="pill mb-5"
            style={{ color: "var(--accent)" }}
          >
            <Icon icon="ph:lightning-fill" width="13" /> No app. No queue. No download.
          </motion.span>
          <motion.h1
            variants={item}
            className="font-semibold leading-[1.02]"
            style={{
              fontFamily: "'Gabarito', sans-serif",
              fontSize: "clamp(2.5rem, 6vw, 4.75rem)",
              letterSpacing: "-0.03em",
              color: "var(--text-1)",
              overflowWrap: "anywhere",
            }}
          >
            Your usual, ready before you hit the door.
          </motion.h1>
          <motion.p
            variants={item}
            className="mt-5 text-lg leading-relaxed max-w-xl"
            style={{ color: "var(--text-2)" }}
          >
            BrewPass turns your commuter regulars into confirmed daily orders with a single
            text link. They tap once each morning — their cup is on the counter ten minutes later.
          </motion.p>
          <motion.div variants={item} className="mt-7 flex flex-wrap items-center gap-3">
            <Link to="/register" className="btn-cta">
              Send your first link
              <Icon icon="ph:arrow-right" width="18" />
            </Link>
            <a href="#how" className="btn-secondary">See how it works</a>
          </motion.div>
          <motion.div variants={item} className="mt-6 flex items-center gap-2 text-sm" style={{ color: "var(--text-2)" }}>
            <Icon icon="ph:check-circle" width="16" style={{ color: "var(--accent)" }} />
            Free for one location. No card to start.
          </motion.div>
        </motion.div>

        <motion.div
          className="lg:col-span-5 min-w-0"
          initial={reduce ? { opacity: 1 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease, delay: 0.25 }}
        >
          <MorningBoard />
        </motion.div>
      </div>
    </header>
  );
}