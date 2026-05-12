"use client";

import Image from "next/image";
import { Activity, BarChart3, Database, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { ActionButton } from "@/components/ui/action-button";

type HeaderProps = {
  view: "dashboard" | "reports" | "analytics";
  setView: (view: "dashboard" | "reports" | "analytics") => void;
};

export function Header({ view, setView }: HeaderProps) {
  return (
    <header className="no-capture no-print sticky top-0 z-40 border-b border-white/10 bg-ink/70 backdrop-blur-2xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
        <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-4">
          <Image src="/assets/img/hospital-mujer-original.jpeg" alt="Hospital de la Mujer" width={72} height={72} priority className="h-14 w-14 rounded-full border border-cyan-100/25 object-cover shadow-glow" />
          <div className="hidden border-l border-white/10 pl-4 md:block">
            <p className="text-xs uppercase tracking-[0.32em] text-cyan-200/75">Turno manana</p>
            <h1 className="text-xl font-semibold text-white">Censo de camas 6.0</h1>
          </div>
        </motion.div>

        <nav className="grid grid-cols-3 gap-2 sm:flex">
          <ActionButton tone={view === "dashboard" ? "primary" : "ghost"} icon={<Activity size={17} />} onClick={() => setView("dashboard")}>
            Dashboard
          </ActionButton>
          <ActionButton tone={view === "reports" ? "primary" : "ghost"} icon={<FileText size={17} />} onClick={() => setView("reports")}>
            Reportes
          </ActionButton>
          <ActionButton tone={view === "analytics" ? "primary" : "ghost"} icon={<BarChart3 size={17} />} onClick={() => setView("analytics")}>
            Indicadores
          </ActionButton>
        </nav>
      </div>
      <div className="panel-line h-px w-full" />
    </header>
  );
}
