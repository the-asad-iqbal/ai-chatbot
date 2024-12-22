'use client'

import React, { useState, useEffect } from 'react'
import { ImageIcon, DownloadIcon, Copy, Check } from 'lucide-react'
import { motion, useAnimation, AnimatePresence } from "framer-motion"
import Image from 'next/image'
import { toast } from 'sonner'

import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { Button } from './ui/button'
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from '@/lib/utils'

export const ImageToolCallSkeleton: React.FC = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-[720px] mx-auto p-2 sm:p-4 bg-background border rounded-lg shadow-sm"
        >
            <div className="flex gap-2 sm:gap-3 items-center h-8 sm:h-10 mb-3 sm:mb-4">
                <div className="flex items-center gap-1.5 sm:gap-2 animate-pulse">
                    <div className="relative size-8 sm:size-10 rounded-full overflow-hidden shrink-0">
                        <Skeleton className="absolute inset-0" />
                        <motion.div
                            className="absolute inset-0 size-full flex items-center justify-center"
                            animate={{
                                scale: [1, 1.1, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        >
                            <ImageIcon className="size-5 text-muted-foreground/30" />
                        </motion.div>
                    </div>
                    <div className="space-y-1.5 sm:space-y-2">
                        <Skeleton className="h-3 sm:h-4 w-24 sm:w-32" />
                        <Skeleton className="h-2.5 sm:h-3 w-20 sm:w-24" />
                    </div>
                </div>
            </div>

            <div className="w-full max-w-[654px] mx-auto px-0 sm:px-4">
                <div className="relative w-full aspect-[4/3]">
                    <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-800 rounded-lg overflow-hidden">
                        <div className="absolute inset-0 flex items-center justify-center">
                            <ProgressRing />
                        </div>

                        <motion.div
                            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                            animate={{
                                x: ['-100%', '100%'],
                            }}
                            transition={{
                                duration: 1.5,
                                repeat: Infinity,
                                ease: 'linear',
                            }}
                        />
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

const ProgressRing: React.FC = () => {
    const controls = useAnimation();

    useEffect(() => {
        controls.start({
            strokeDashoffset: [251.2, 0],
            transition: {
                duration: 10,
                ease: "linear",
            },
        });
    }, [controls]);

    return (
        <div className="relative size-16">
            <svg className="size-full" viewBox="0 0 100 100">
                <circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="4"
                />
                <motion.circle
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke="white"
                    strokeWidth="4"
                    strokeDasharray="251.2"
                    initial={{ strokeDashoffset: 251.2 }}
                    animate={controls}
                />
            </svg>
            <motion.div
                className='absolute inset-0 flex items-center justify-center'
                animate={{
                    scale: [1, 1.2, 1],
                    rotate: [0, 360],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <ImageIcon className="size-5 text-white" />
            </motion.div>
        </div>
    );
};

const ExpandablePrompt: React.FC<{ text: string }> = ({ text }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isCopied, setIsCopied] = useState(false);
    const shouldShowToggle = text.length > 75;

    const copyPrompt = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            toast.success('Prompt copied to clipboard');
            setIsCopied(true);
            setTimeout(() => setIsCopied(false), 1000);
        } catch (error) {
            toast.error('Failed to copy prompt');
        }
    };

    return (
        <div className="flex flex-col gap-2 mt-1">
            <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                    <div className={cn(
                        "relative",
                        !isExpanded && shouldShowToggle && "max-h-[2.4em] overflow-hidden"
                    )}>
                        <p className="text-xs text-muted-foreground">
                            {text}
                        </p>

                        {!isExpanded && shouldShowToggle && (
                            <div className="absolute bottom-0 inset-x-0 h-4 bg-gradient-to-t from-background to-transparent" />
                        )}
                    </div>

                    {shouldShowToggle && (
                        <Button
                            variant="link"
                            className="text-xs h-auto p-0 mt-1 text-muted-foreground hover:text-primary"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? 'Show less' : 'Show more'}
                        </Button>
                    )}
                </div>

                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button
                                variant="ghost"
                                size="icon"
                                className={cn(
                                    "h-8 w-8 shrink-0 transition-all",
                                    isCopied && "text-green-500"
                                )}
                                onClick={() => copyPrompt(text)}
                            >
                                <AnimatePresence mode="wait">
                                    {isCopied ? (
                                        <motion.div
                                            key="check"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                        >
                                            <Check className="size-4" />
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="copy"
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            exit={{ scale: 0 }}
                                        >
                                            <Copy className="size-4" />
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{isCopied ? 'Copied!' : 'Copy prompt'}</p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>
        </div>
    );
};



export const ImageToolResponse: React.FC<{
    result: {
        url: string;
        prompt?: string;
    };
}> = ({ result }) => {
    const [isImageLoaded, setIsImageLoaded] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full h-auto p-2 sm:p-4 bg-background border rounded-lg space-y-3 sm:space-y-4 shadow-sm"
        >
            <div className="flex items-start space-x-2 sm:space-x-4">
                <div className="bg-green-500/10 p-1.5 sm:p-2 rounded-full">
                    <ImageIcon className="text-green-500 size-5 sm:size-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-xs sm:text-sm">Image Generated</h3>
                    {result.prompt && <ExpandablePrompt text={result.prompt} />}
                </div>
            </div>

            <div className="relative w-full aspect-[4/3] sm:max-w-[654px] mx-auto">
                <div className={cn(
                    "absolute inset-0 bg-zinc-900/10 rounded-lg transition-opacity duration-300",
                    isImageLoaded ? "opacity-0" : "opacity-100"
                )}>
                    <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-zinc-900/10 via-zinc-800/10 to-zinc-900/10" />
                </div>
                <Image
                    src={result.url}
                    alt={result.prompt || "Generated Image"}
                    width={1024}
                    height={720}
                    className={cn(
                        "rounded-lg object-cover transition-opacity duration-300",
                        isImageLoaded ? "opacity-100" : "opacity-0"
                    )}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    onLoad={() => setIsImageLoaded(true)}
                    priority
                />
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="absolute right-2 bottom-3 sm:bottom-5 md:bottom-10"
                >
                    <motion.div
                        initial={{ y: -4, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.5 }}
                    >
                        <a
                            href={result.url}
                            download={result?.prompt}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="shadow-gray-300 bg-white/90 hover:bg-white text-[10px] sm:text-xs text-black px-2 sm:px-3 py-1 sm:py-1.5 rounded-full shadow-sm flex items-center space-x-1.5 sm:space-x-2 transition-all hover:scale-105"
                        >
                            <DownloadIcon className="size-3 sm:size-4" />
                            <span>Download</span>
                        </a>
                    </motion.div>
                </motion.div>
            </div>
        </motion.div>
    );
};
