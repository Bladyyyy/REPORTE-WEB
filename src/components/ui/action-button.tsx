"use client";

import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ActionButtonProps = Omit<HTMLMotionProps<"button">, "children"> & {
  children: ReactNode;
  icon?: ReactNode;
  tone?: "primary" | "ghost" | "quiet";
};

export function ActionButton({ children, icon, className, tone = "primary", ...props }: ActionButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -1, scale: 1.01 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-hospital-300 disabled:cursor-not-allowed disabled:opacity-50",
        tone === "primary" &&
          "bg-gradient-to-r from-hospital-400 via-cyan-400 to-ocean text-ink shadow-glow hover:brightness-110",
        tone === "ghost" && "border border-cyan-200/15 bg-white/7 text-cyan-50 hover:bg-white/12",
        tone === "quiet" && "text-cyan-100 hover:bg-white/8",
        className
      )}
      {...props}
    >
      {icon}
      <span>{children}</span>
    </motion.button>
  );
}
