import type { StoredReport } from "@/lib/types";

export type AnalyticsPoint = {
  label: string;
  ocupadas: number;
  libres: number;
  altas: number;
  utilizacion: number;
};

export type AnalyticsSummary = {
  totalDiario: number;
  totalMensual: number;
  totalAnual: number;
  diasReportadosMes: number;
  cierreMensualListo: boolean;
  promedioOcupacion: number;
  promedioAltas: number;
  productividad: number;
  picoOcupacionMes: number;
  decisionMensual: string;
  reportes: number;
  tendencias: AnalyticsPoint[];
  distribucion: { name: string; value: number }[];
  heatmap: { day: string; value: number }[];
};

const sameDay = (a: Date, b: Date) => a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);

export const buildAnalytics = (reports: StoredReport[], now = new Date()): AnalyticsSummary => {
  const morningReports = reports.filter((report) => report.shift === "MANANA");
  const daily = morningReports.filter((report) => sameDay(new Date(report.reportDate), now));
  const monthly = morningReports.filter((report) => {
    const date = new Date(report.reportDate);
    return date.getUTCFullYear() === now.getUTCFullYear() && date.getUTCMonth() === now.getUTCMonth();
  });
  const annual = morningReports.filter((report) => new Date(report.reportDate).getUTCFullYear() === now.getUTCFullYear());

  const source = monthly.length > 0 ? monthly : morningReports;
  const occupied = source.reduce((sum, report) => sum + report.totals.occupiedBeds, 0);
  const discharges = source.reduce((sum, report) => sum + report.totals.dischargesMorning, 0);
  const utilization = source.reduce((sum, report) => sum + report.totals.utilizationRate, 0);
  const daysInMonth = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0)).getUTCDate();
  const reportedDays = new Set(monthly.map((report) => report.reportDate.slice(0, 10))).size;
  const productivity = source.length ? Math.round((utilization / source.length) * 10) / 10 : 0;
  const peakMonthlyOccupancy = monthly.reduce((max, report) => Math.max(max, report.totals.occupiedBeds), 0);

  const tendencias = source
    .slice()
    .sort((a, b) => new Date(a.reportDate).getTime() - new Date(b.reportDate).getTime())
    .map((report) => ({
      label: new Date(report.reportDate).toLocaleDateString("es-BO", { day: "2-digit", month: "short" }),
      ocupadas: report.totals.occupiedBeds,
      libres: report.totals.availableBeds,
      altas: report.totals.dischargesMorning,
      utilizacion: report.totals.utilizationRate
    }));

  const latest = source.at(-1);

  return {
    totalDiario: daily.reduce((sum, report) => sum + report.totals.occupiedBeds, 0),
    totalMensual: monthly.reduce((sum, report) => sum + report.totals.occupiedBeds, 0),
    totalAnual: annual.reduce((sum, report) => sum + report.totals.occupiedBeds, 0),
    diasReportadosMes: reportedDays,
    cierreMensualListo: reportedDays >= daysInMonth,
    promedioOcupacion: source.length ? Math.round(occupied / source.length) : 0,
    promedioAltas: source.length ? Math.round((discharges / source.length) * 10) / 10 : 0,
    productividad: productivity,
    picoOcupacionMes: peakMonthlyOccupancy,
    decisionMensual:
      monthly.length === 0
        ? "Sin datos mensuales guardados para generar recomendaciones."
        : productivity >= 85
          ? "Alta presion operativa: evaluar refuerzo de camas, personal y altas tempranas."
          : productivity >= 65
            ? "Operacion estable: mantener seguimiento diario y revisar servicios con mayor demanda."
            : "Baja ocupacion relativa: oportunidad para redistribuir recursos y optimizar disponibilidad.",
    reportes: source.length,
    tendencias,
    distribucion: latest
      ? [
          { name: "Ginecologia", value: latest.calculations.c6 },
          { name: "ARO", value: latest.calculations.c8 },
          { name: "Puerperio", value: latest.calculations.c11 },
          { name: "Neonatologia", value: latest.calculations.c16 },
          { name: "UTI", value: latest.calculations.e21 }
        ]
      : [],
    heatmap: tendencias.map((point) => ({ day: point.label, value: point.utilizacion }))
  };
};
