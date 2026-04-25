"use client";

import { motion } from "framer-motion";

export default function HeroWordmark({ lines = ["W.", "DEWEYS"], className = "" }) {
  const label = lines.join("");

  return (
    <h1 className={`hero-title ${className}`.trim()} aria-label={label}>
      {lines.map((line, lineIndex) => (
        <span
          className={`hero-title-line ${lineIndex === lines.length - 1 ? "hero-title-line-accent" : ""}`.trim()}
          key={`${line}-${lineIndex}`}
          aria-hidden="true"
        >
          {Array.from(line).map((character, charIndex) => (
            <motion.span
              className="hero-title-char"
              key={`${lineIndex}-${charIndex}-${character}`}
              initial={{ opacity: 0, y: "0.78em", filter: "blur(12px)" }}
              animate={{ opacity: 1, y: "0em", filter: "blur(0px)" }}
              transition={{
                duration: 0.72,
                delay: 0.1 + lineIndex * 0.14 + charIndex * 0.04,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {character === " " ? "\u00A0" : character}
            </motion.span>
          ))}
        </span>
      ))}
    </h1>
  );
}
