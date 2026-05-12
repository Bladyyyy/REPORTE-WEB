"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";
import ExcelJS from "exceljs";
import { Activity, BedDouble, HeartPulse, UsersRound } from "lucide-react";
import { gsap } from "gsap";
import { AnalyticsDashboard } from "@/components/analytics-dashboard";
import { Header } from "@/components/header";
import { KpiCard } from "@/components/kpi-card";
import { ReportForm } from "@/components/report-form";
import { ReportsHistory } from "@/components/reports-history";
import { buildAnalytics, type AnalyticsSummary } from "@/lib/analytics";
import type { StoredReport } from "@/lib/types";
import { useReportStore } from "@/store/report-store";

type View = "dashboard" | "reports" | "analytics";

const downloadBlob = (blob: Blob, filename: string) => {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
};

const LETTER_MM = { width: 216, height: 279 };
const LETTER_CANVAS = { width: 2160, height: 2790 };

const nextFrame = () => new Promise((resolve) => requestAnimationFrame(resolve));

const fitCanvasToLetter = (source: HTMLCanvasElement) => {
  const output = document.createElement("canvas");
  output.width = LETTER_CANVAS.width;
  output.height = LETTER_CANVAS.height;
  const context = output.getContext("2d");
  if (!context) return source;

  context.fillStyle = "#f8fbfc";
  context.fillRect(0, 0, output.width, output.height);

  const padding = 96;
  const ratio = Math.min((output.width - padding * 2) / source.width, (output.height - padding * 2) / source.height);
  const width = source.width * ratio;
  const height = source.height * ratio;
  context.drawImage(source, (output.width - width) / 2, (output.height - height) / 2, width, height);

  return output;
};

export default function Home() {
  const [view, setView] = useState<View>("dashboard");
  const [saving, setSaving] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsSummary>();
  const captureRef = useRef<HTMLDivElement>(null);
  const dashboardRef = useRef<HTMLDivElement>(null);

  const { reportDate, reportTime, generatedBy, inputs, calculations, totals, reports, setReports, setReportTime } = useReportStore();

  const analyticsWithCurrentDraft = useMemo(() => {
    const currentDraft: StoredReport = {
      id: "current-draft",
      folio: `BORRADOR-${reportDate}`,
      shift: "MANANA",
      generatedBy,
      reportDate: `${reportDate}T07:00:00.000Z`,
      reportTime,
      formData: inputs,
      calculations,
      totals,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    const reportsWithoutCurrentDate = reports.filter((report) => report.reportDate.slice(0, 10) !== reportDate);
    return buildAnalytics([...reportsWithoutCurrentDate, currentDraft], new Date(`${reportDate}T12:00:00.000Z`));
  }, [calculations, inputs, reportDate, reportTime, reports, totals]);

  const refreshReports = async () => {
    const response = await fetch("/api/reports", { cache: "no-store" });
    const data = (await response.json()) as StoredReport[];
    setReports(data);
  };

  const refreshAnalytics = async () => {
    const response = await fetch("/api/analytics", { cache: "no-store" });
    setAnalytics((await response.json()) as AnalyticsSummary);
  };

  useEffect(() => {
    void refreshReports();
    void refreshAnalytics();
    gsap.fromTo(".ambient-metric", { opacity: 0, y: 20 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.8, ease: "power3.out" });
  }, []);

  useEffect(() => {
    const updateTime = () => {
      setReportTime(new Date().toLocaleTimeString("es-BO", { hour12: false }));
    };
    updateTime();
    const timer = window.setInterval(updateTime, 1000);
    return () => window.clearInterval(timer);
  }, [setReportTime]);

  const makeCanvas = async (target: HTMLElement, normalizeReport = false) => {
    const shell = target.classList.contains("excel-shell") ? target : null;
    const previousStyles = shell
      ? {
          overflowX: shell.style.overflowX,
          overflowY: shell.style.overflowY,
          width: shell.style.width,
          maxWidth: shell.style.maxWidth
        }
      : undefined;

    if (normalizeReport && shell) {
      const grid = shell.querySelector<HTMLElement>(".excel-grid");
      shell.style.overflowX = "visible";
      shell.style.overflowY = "visible";
      shell.style.maxWidth = "none";
      shell.style.width = `${grid?.scrollWidth ?? shell.scrollWidth}px`;
      await nextFrame();
    }

    const width = normalizeReport ? Math.max(target.scrollWidth, target.getBoundingClientRect().width) : target.scrollWidth;
    const height = normalizeReport ? Math.max(target.scrollHeight, target.getBoundingClientRect().height) : target.scrollHeight;

    const canvas = await html2canvas(target, {
      scale: 2,
      backgroundColor: "#f8fbfc",
      useCORS: true,
      width,
      height,
      windowWidth: width,
      windowHeight: height,
      scrollX: 0,
      scrollY: 0,
      onclone: (doc) => {
        doc.body.classList.add("capture-mode");
      }
    });

    if (shell && previousStyles) {
      shell.style.overflowX = previousStyles.overflowX;
      shell.style.overflowY = previousStyles.overflowY;
      shell.style.width = previousStyles.width;
      shell.style.maxWidth = previousStyles.maxWidth;
    }

    return canvas;
  };

  const captureReport = async () => {
    if (!captureRef.current) return;
    const canvas = fitCanvasToLetter(await makeCanvas(captureRef.current, true));
    const image = canvas.toDataURL("image/png");
    downloadBlob(await (await fetch(image)).blob(), `hospital-mujer-reporte-${reportDate}.png`);
  };

  const saveReport = async () => {
    setSaving(true);
    try {
      const screenshot = captureRef.current ? fitCanvasToLetter(await makeCanvas(captureRef.current, true)).toDataURL("image/png") : undefined;
      const response = await fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reportDate,
          reportTime,
          shift: "MANANA",
          generatedBy,
          formData: inputs,
          calculations,
          totals,
          screenshot
        })
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar el reporte");
      }

      await refreshReports();
      await refreshAnalytics();
      setView("reports");
    } finally {
      setSaving(false);
    }
  };

  const exportCurrentPdf = async () => {
    if (!captureRef.current) return;
    const canvas = fitCanvasToLetter(await makeCanvas(captureRef.current, true));
    const imgData = canvas.toDataURL("image/png");
    const pdf = new jsPDF("p", "mm", [LETTER_MM.width, LETTER_MM.height]);
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const width = canvas.width * ratio;
    const height = canvas.height * ratio;
    pdf.setFillColor(248, 251, 252);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
    pdf.addImage(imgData, "PNG", (pageWidth - width) / 2, (pageHeight - height) / 2, width, height);
    pdf.save(`hospital-mujer-reporte-${reportDate}.pdf`);
  };

  const exportDashboardPdf = async () => {
    if (!dashboardRef.current) return;
    const canvas = await makeCanvas(dashboardRef.current);
    const pdf = new jsPDF("l", "mm", "a4");
    const imgData = canvas.toDataURL("image/png");
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    pdf.setFillColor(248, 251, 252);
    pdf.rect(0, 0, pageWidth, pageHeight, "F");
    pdf.addImage(imgData, "PNG", (pageWidth - canvas.width * ratio) / 2, 4, canvas.width * ratio, canvas.height * ratio);
    pdf.save(`indicadores-hospital-mujer-${reportDate}.pdf`);
  };

  const downloadDashboardImage = async () => {
    if (!dashboardRef.current) return;
    const canvas = await makeCanvas(dashboardRef.current);
    downloadBlob(await (await fetch(canvas.toDataURL("image/png"))).blob(), `graficos-hospital-mujer-${reportDate}.png`);
  };

  const exportReportsExcel = async (sourceReports: StoredReport[]) => {
    const workbook = new ExcelJS.Workbook();
    workbook.creator = "Hospital de la Mujer";
    const sheet = workbook.addWorksheet("Reportes Manana");
    sheet.columns = [
      { header: "Folio", key: "folio", width: 24 },
      { header: "Fecha", key: "fecha", width: 16 },
      { header: "Hora", key: "hora", width: 12 },
      { header: "Usuario", key: "usuario", width: 28 },
      { header: "Ocupadas", key: "ocupadas", width: 14 },
      { header: "Libres", key: "libres", width: 14 },
      { header: "Utilizacion", key: "utilizacion", width: 14 },
      { header: "Altas M", key: "altasM", width: 12 },
      { header: "Neonatologia", key: "neonatal", width: 16 },
      { header: "Emergencias COVID", key: "covid", width: 18 }
    ];

    sourceReports.forEach((report) => {
      sheet.addRow({
        folio: report.folio,
        fecha: report.reportDate.slice(0, 10),
        hora: report.reportTime,
        usuario: report.generatedBy,
        ocupadas: report.totals.occupiedBeds,
        libres: report.totals.availableBeds,
        utilizacion: report.totals.utilizationRate,
        altasM: report.totals.dischargesMorning,
        neonatal: report.totals.neonatalDemand,
        covid: report.totals.emergencyCovid
      });
    });

    sheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    sheet.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF0B6EE8" } };
    sheet.views = [{ state: "frozen", ySplit: 1 }];
    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), `reportes-hospital-mujer-${reportDate}.xlsx`);
  };

  const exportCurrentExcel = async () => {
    const current: StoredReport = {
      id: "preview",
      folio: `HM-PREVIEW-${reportDate}`,
      shift: "MANANA",
      generatedBy,
      reportDate,
      reportTime,
      formData: inputs,
      calculations,
      totals,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await exportReportsExcel([current]);
  };

  return (
    <main className="min-h-screen">
      <Header view={view} setView={setView} />

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <section className="mb-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <div className="ambient-metric">
            <KpiCard label="Ocupacion" value={totals.occupiedBeds} detail="Total calculado en tiempo real" icon={<BedDouble size={22} />} />
          </div>
          <div className="ambient-metric">
            <KpiCard label="Libres" value={totals.availableBeds} detail="Capacidad disponible consolidada" icon={<Activity size={22} />} />
          </div>
          <div className="ambient-metric">
            <KpiCard label="Utilizacion" value={`${totals.utilizationRate}%`} detail="Indicador operativo del turno" icon={<HeartPulse size={22} />} />
          </div>
          <div className="ambient-metric">
            <KpiCard label="Reportes" value={reports.length} detail="Registros guardados turno manana" icon={<UsersRound size={22} />} />
          </div>
        </section>

        {view === "dashboard" ? (
          <ReportForm
            captureRef={captureRef}
            onCapture={captureReport}
            onSave={saveReport}
            onPdf={exportCurrentPdf}
            onExcel={exportCurrentExcel}
            saving={saving}
          />
        ) : null}

        {view === "reports" ? <ReportsHistory reports={reports} onExcelAll={exportReportsExcel} /> : null}

        {view === "analytics" ? (
          <AnalyticsDashboard
            analytics={analyticsWithCurrentDraft ?? analytics}
            dashboardRef={dashboardRef}
            onPdf={exportDashboardPdf}
            onChartDownload={downloadDashboardImage}
          />
        ) : null}
      </div>
    </main>
  );
}
