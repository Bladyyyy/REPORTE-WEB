"use client";

import { BarChart3, Download, Gauge, LineChart as LineIcon, Printer, TrendingUp } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Line, LineChart, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { motion } from "framer-motion";
import { ActionButton } from "@/components/ui/action-button";
import { KpiCard } from "@/components/kpi-card";
import type { AnalyticsSummary } from "@/lib/analytics";

type AnalyticsDashboardProps = {
  analytics?: AnalyticsSummary;
  dashboardRef: React.RefObject<HTMLDivElement>;
  onPdf: () => Promise<void>;
  onChartDownload: () => Promise<void>;
};

const palette = ["#22d3ee", "#63f6d3", "#0b6ee8", "#f8d66d", "#d9f99d"];

export function AnalyticsDashboard({ analytics, dashboardRef, onPdf, onChartDownload }: AnalyticsDashboardProps) {
  const data = analytics?.tendencias ?? [];
  const pie = analytics?.distribucion ?? [];

  return (
    <section ref={dashboardRef} className="space-y-6">
      <div className="no-capture no-print flex flex-col gap-3 sm:flex-row sm:justify-end">
        <ActionButton tone="ghost" icon={<Download size={17} />} onClick={onChartDownload}>
          Descargar graficos
        </ActionButton>
        <ActionButton tone="ghost" icon={<Printer size={17} />} onClick={onPdf}>
          Imprimir dashboard
        </ActionButton>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total diario" value={analytics?.totalDiario ?? 0} detail="Camas ocupadas del dia" icon={<Gauge size={22} />} />
        <KpiCard label="Total mensual" value={analytics?.totalMensual ?? 0} detail="Acumulado del mes turno manana" icon={<TrendingUp size={22} />} />
        <KpiCard label="Total anual" value={analytics?.totalAnual ?? 0} detail="Historico anual consolidado" icon={<BarChart3 size={22} />} />
        <KpiCard label="Productividad" value={`${analytics?.productividad ?? 0}%`} detail="Promedio de utilizacion operativa" icon={<LineIcon size={22} />} />
      </div>

      <div className="grid gap-4 lg:grid-cols-[.75fr_.75fr_1.5fr]">
        <KpiCard label="Dias reportados" value={analytics?.diasReportadosMes ?? 0} detail="Cobertura del mes actual" icon={<Gauge size={22} />} />
        <KpiCard label="Pico mensual" value={analytics?.picoOcupacionMes ?? 0} detail="Maxima ocupacion registrada" icon={<TrendingUp size={22} />} />
        <div className="glass rounded-3xl p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-100/60">Decision mensual</p>
          <h3 className="mt-2 text-lg font-semibold text-white">
            {analytics?.cierreMensualListo ? "Cierre mensual completo" : "Seguimiento mensual en curso"}
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-300">{analytics?.decisionMensual}</p>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.4fr_.8fr]">
        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.25em] text-cyan-100/60">Tendencias</p>
              <h3 className="mt-1 text-xl font-semibold text-white">Evolucion temporal</h3>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="areaCyan" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#08131f", border: "1px solid rgba(103,232,249,.25)", borderRadius: 16 }} />
                <Area type="monotone" dataKey="ocupadas" stroke="#22d3ee" fill="url(#areaCyan)" strokeWidth={3} />
                <Line type="monotone" dataKey="libres" stroke="#63f6d3" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-100/60">Distribucion</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Ocupacion por unidad</h3>
          <div className="mt-4 h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pie} dataKey="value" nameKey="name" innerRadius={62} outerRadius={102} paddingAngle={4}>
                  {pie.map((_, index) => (
                    <Cell key={index} fill={palette[index % palette.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "#08131f", border: "1px solid rgba(103,232,249,.25)", borderRadius: 16 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="glass rounded-3xl p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-100/60">Comparativas</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Altas y rendimiento</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid stroke="rgba(255,255,255,.08)" vertical={false} />
                <XAxis dataKey="label" stroke="#94a3b8" tickLine={false} axisLine={false} />
                <YAxis stroke="#94a3b8" tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "#08131f", border: "1px solid rgba(103,232,249,.25)", borderRadius: 16 }} />
                <Bar dataKey="altas" fill="#f8d66d" radius={[8, 8, 0, 0]} />
                <Bar dataKey="utilizacion" fill="#22d3ee" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass rounded-3xl p-5">
          <p className="text-xs uppercase tracking-[0.25em] text-cyan-100/60">Heatmap</p>
          <h3 className="mt-1 text-xl font-semibold text-white">Intensidad operativa</h3>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {(analytics?.heatmap ?? []).slice(-16).map((item) => (
              <div key={item.day} className="rounded-2xl border border-cyan-200/10 p-4" style={{ background: `rgba(34, 211, 238, ${Math.max(item.value / 160, 0.08)})` }}>
                <p className="text-xs text-cyan-50/70">{item.day}</p>
                <strong className="mt-2 block text-xl text-white">{item.value}%</strong>
              </div>
            ))}
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="glass rounded-3xl p-12 text-center text-slate-300">
          Guarda reportes del turno manana para activar los indicadores mensuales.
        </div>
      ) : null}
    </section>
  );
}
