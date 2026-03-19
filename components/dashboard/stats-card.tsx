"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: string;
    positive: boolean;
  };
  icon: LucideIcon;
  color: "primary" | "success" | "warning" | "destructive";
  index?: number;
}

const colorVariants = {
  primary: {
    bg: "bg-primary/15",
    icon: "text-primary",
    glow: "shadow-primary/20",
    gradient: "from-primary/10 via-transparent to-accent/5",
  },
  success: {
    bg: "bg-success/15",
    icon: "text-success",
    glow: "shadow-success/20",
    gradient: "from-success/10 via-transparent to-transparent",
  },
  warning: {
    bg: "bg-warning/15",
    icon: "text-warning",
    glow: "shadow-warning/20",
    gradient: "from-warning/10 via-transparent to-transparent",
  },
  destructive: {
    bg: "bg-destructive/15",
    icon: "text-destructive",
    glow: "shadow-destructive/20",
    gradient: "from-destructive/10 via-transparent to-transparent",
  },
};

export function StatsCard({
  title,
  value,
  trend,
  icon: Icon,
  color,
  index = 0,
}: StatsCardProps) {
  const colors = colorVariants[color];

  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.5,
        delay: index * 0.1,
        type: "spring",
        stiffness: 100,
        damping: 15,
      }}
      whileHover={{
        y: -4,
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 17 },
      }}
      whileTap={{ scale: 0.98 }}
      className="group relative overflow-hidden rounded-3xl border border-border/60 bg-card/90 backdrop-blur-sm p-6 shadow-sm transition-shadow hover:shadow-xl"
    >
      {/* Background gradient on hover */}
      <motion.div 
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={cn(
          "absolute inset-0 -z-10 bg-gradient-to-br",
          colors.gradient
        )} 
      />

      {/* Shimmer effect */}
      <div className="absolute inset-0 -z-10 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
      </div>

      <div className="flex items-start justify-between">
        <div className="space-y-3">
          <p className="text-sm font-semibold text-muted-foreground">{title}</p>
          <motion.p
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              delay: index * 0.1 + 0.2, 
              type: "spring",
              stiffness: 200,
              damping: 15
            }}
            className="text-4xl font-bold tracking-tight"
          >
            {value}
          </motion.p>
          {trend && (
            <motion.div
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.35 }}
              className={cn(
                "inline-flex items-center gap-1.5 text-sm font-semibold",
                trend.positive ? "text-success" : "text-destructive"
              )}
            >
              <span className={cn(
                "flex items-center justify-center h-5 w-5 rounded-full text-xs",
                trend.positive ? "bg-success/15" : "bg-destructive/15"
              )}>
                {trend.positive ? "+" : "-"}
              </span>
              <span>{trend.value}</span>
              <span className="text-muted-foreground font-medium">vs last week</span>
            </motion.div>
          )}
        </div>

        <motion.div
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{
            delay: index * 0.1 + 0.15,
            type: "spring",
            stiffness: 200,
            damping: 12,
          }}
          whileHover={{ scale: 1.15, rotate: 8 }}
          className={cn(
            "flex h-14 w-14 items-center justify-center rounded-2xl shadow-lg",
            colors.bg,
            colors.glow
          )}
        >
          <Icon className={cn("h-7 w-7", colors.icon)} />
        </motion.div>
      </div>
    </motion.div>
  );
}
