"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type KpiCardProps = {
  label: string;
  value: string | number;
  detail: string;
  icon: ReactNode;
  className?: string;
};

export function KpiCard({ label, value, detail, icon, className }: KpiCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn("glass rounded-2xl p-5", className)}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-cyan-100/60">{label}</p>
          <strong className="mt-3 block text-3xl font-semibold text-white">{value}</strong>
        </div>
        <div className="rounded-2xl border border-cyan-200/15 bg-cyan-300/10 p-3 text-cyan-200">{icon}</div>
      </div>
      <p className="mt-4 text-sm text-slate-300">{detail}</p>
    </motion.article>
  );
}
