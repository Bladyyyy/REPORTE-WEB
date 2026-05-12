"use client";

import { Download, FileSearch, RotateCcw, Search } from "lucide-react";
import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import type { StoredReport } from "@/lib/types";
import { useReportStore } from "@/store/report-store";

type ReportsHistoryProps = {
  reports: StoredReport[];
  onExcelAll: (reports: StoredReport[]) => Promise<void>;
};

export function ReportsHistory({ reports, onExcelAll }: ReportsHistoryProps) {
  const [query, setQuery] = useState("");
  const [date, setDate] = useState("");
  const loadReport = useReportStore((state) => state.loadReport);

  const filtered = useMemo(() => {
    return reports.filter((report) => {
      const text = `${report.folio} ${report.generatedBy} ${report.reportDate} ${report.createdAt}`.toLowerCase();
      return text.includes(query.toLowerCase()) && (date ? report.reportDate.slice(0, 10) === date : true);
    });
  }, [date, query, reports]);

  return (
    <section className="glass rounded-3xl p-4 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-white/10 pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-100/60">Archivo clinico operativo</p>
          <h2 className="mt-2 text-2xl font-semibold text-white">Historial de reportes</h2>
        </div>
        <ActionButton icon={<Download size={17} />} onClick={() => onExcelAll(filtered)}>
          Exportar registros
        </ActionButton>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-[1fr_220px]">
        <label className="flex min-h-12 items-center gap-3 rounded-2xl border border-cyan-200/15 bg-white/7 px-4">
          <Search size={18} className="text-cyan-200" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar por folio o fecha"
            className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
          />
        </label>
        <input
          type="date"
          value={date}
          onChange={(event) => setDate(event.target.value)}
          className="min-h-12 rounded-2xl border border-cyan-200/15 bg-white/7 px-4 text-sm text-white outline-none"
        />
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[820px] border-separate border-spacing-y-2 text-left text-sm">
          <thead className="text-xs uppercase tracking-[0.18em] text-cyan-100/55">
            <tr>
              <th className="px-4 py-2">Folio</th>
              <th className="px-4 py-2">Fecha</th>
              <th className="px-4 py-2">Usuario</th>
              <th className="px-4 py-2">Ocupadas</th>
              <th className="px-4 py-2">Libres</th>
              <th className="px-4 py-2">Utilizacion</th>
              <th className="px-4 py-2">Altas M</th>
              <th className="px-4 py-2 text-right">Accion</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((report, index) => (
              <motion.tr
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
                key={report.id}
                className="rounded-2xl bg-white/[0.055] text-slate-200"
              >
                <td className="rounded-l-2xl px-4 py-4 font-semibold text-white">{report.folio}</td>
                <td className="px-4 py-4">{new Date(report.reportDate).toLocaleDateString("es-BO")}</td>
                <td className="px-4 py-4">{report.generatedBy || "Sin usuario"}</td>
                <td className="px-4 py-4">{report.totals.occupiedBeds}</td>
                <td className="px-4 py-4">{report.totals.availableBeds}</td>
                <td className="px-4 py-4">{report.totals.utilizationRate}%</td>
                <td className="px-4 py-4">{report.totals.dischargesMorning}</td>
                <td className="rounded-r-2xl px-4 py-3 text-right">
                  <ActionButton tone="quiet" icon={<RotateCcw size={16} />} onClick={() => loadReport(report)}>
                    Reabrir
                  </ActionButton>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-3xl border border-dashed border-cyan-200/20 p-10 text-center text-slate-400">
          <FileSearch className="mb-3 text-cyan-200" />
          No hay reportes con esos filtros.
        </div>
      ) : null}
    </section>
  );
}
