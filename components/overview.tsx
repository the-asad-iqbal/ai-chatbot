"use client"

import { motion } from 'framer-motion';

export const Overview = () => {
  const userName = localStorage.getItem('name') || "Bro";

  return (
    <motion.div
      key="overview"
      className="max-w-3xl mx-auto"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex flex-col gap-8 leading-relaxed text-center max-w-2xl m-auto">
        <h2 className="text-5xl font-bold">
          <span
            className="dark:text-white text-zinc-900 backdrop-blur-md bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-50 dark:to-zinc-200"
            style={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backdropFilter: 'blur(3px)'
            }}
          >
            What&#39;s up{" "}
          </span>
          <span className="font-bold text-green-500 font-mono tracking-tighter">{userName}</span>!
        </h2>
      </div>
    </motion.div>
  );
};
