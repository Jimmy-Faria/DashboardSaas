"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showPercentage?: boolean;
  className?: string;
  size?: "sm" | "md" | "lg";
}

const sizeVariants = {
  sm: "h-2",
  md: "h-3",
  lg: "h-5",
};

export function ProgressBar({
  value,
  max = 100,
  label,
  showPercentage = true,
  className,
  size = "md",
}: ProgressBarProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn("space-y-3", className)}>
      {(label || showPercentage) && (
        <div className="flex items-center justify-between text-sm">
          {label && <span className="font-semibold text-muted-foreground">{label}</span>}
          {showPercentage && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="font-bold text-foreground"
            >
              {Math.round(percentage)}%
            </motion.span>
          )}
        </div>
      )}
      <div
        className={cn(
          "overflow-hidden rounded-full bg-muted/60 backdrop-blur-sm",
          sizeVariants[size]
        )}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 1.2,
            delay: 0.3,
            type: "spring",
            stiffness: 50,
            damping: 15,
          }}
          className={cn(
            "h-full rounded-full bg-gradient-to-r from-primary to-accent shadow-lg",
            "relative overflow-hidden"
          )}
        >
          {/* Shimmer effect */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{
              duration: 2,
              delay: 1.5,
              repeat: Infinity,
              repeatDelay: 4,
            }}
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
          />
        </motion.div>
      </div>
    </div>
  );
}
