"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { motion, HTMLMotionProps } from 'framer-motion';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  children: React.ReactNode;
}

export function Button({ 
  className, 
  variant = 'primary', 
  size = 'md', 
  children, 
  ...props 
}: ButtonProps) {
  const variants = {
    primary: "bg-gold-gradient text-black font-semibold shadow-gold-glow hover:shadow-gold-glow-intense border border-gold-300/60",
    outline: "bg-transparent text-gold-500 border border-gold-500/50 hover:bg-gold-500/10 hover:border-gold-500",
    ghost: "bg-transparent text-text-secondary hover:text-gold-500 hover:bg-bg-app",
  };

  const sizes = {
    sm: "px-4 py-2 text-sm",
    md: "px-6 py-3 text-base",
    lg: "px-8 py-4 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative rounded-md overflow-hidden transition-all duration-300 flex items-center justify-center min-h-11",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {/* Shine effect overlay for primary button */}
      {variant === 'primary' && (
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/40 to-transparent hover:animate-[shimmer_1.5s_infinite]" />
      )}
      <span className="relative z-10 flex items-center gap-2">{children}</span>
    </motion.button>
  );
}


