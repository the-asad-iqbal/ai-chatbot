import { motion } from 'framer-motion';

export const Overview = () => {

  return (
    <motion.div
      key="overview"
      className="w-full max-w-3xl mx-auto px-4 sm:px-6"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.98 }}
      transition={{ delay: 0.5 }}
    >
      <div className="flex flex-col gap-4 sm:gap-8 leading-relaxed text-center max-w-2xl m-auto py-4 sm:py-8">
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold">
          <span
            className="dark:text-white text-zinc-900 backdrop-blur-md bg-gradient-to-r from-zinc-900 to-zinc-700 dark:from-zinc-50 dark:to-zinc-200"
            style={{
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backdropFilter: 'blur(3px)'
            }}
          >
            Ask me anything!
          </span>
        </h2>
      </div>
    </motion.div>
  );
};

