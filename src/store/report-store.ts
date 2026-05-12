"use client";

import { create } from "zustand";
import { calculateReport, defaultInputs, todayISO } from "@/lib/report-model";
import type { ReportCalculations, ReportInputs, ReportTotals, StoredReport } from "@/lib/types";

type ReportState = {
  reportDate: string;
  reportTime: string;
  generatedBy: string;
  inputs: ReportInputs;
  calculations: ReportCalculations;
  totals: ReportTotals;
  reports: StoredReport[];
  activeReport?: StoredReport;
  setInput: (key: keyof ReportInputs, value: number) => void;
  setGeneratedBy: (name: string) => void;
  setReportTime: (time: string) => void;
  setReportDate: (date: string) => void;
  loadReport: (report: StoredReport) => void;
  setReports: (reports: StoredReport[]) => void;
  reset: () => void;
};

const initialDate = todayISO();
const initial = calculateReport(defaultInputs, initialDate);

export const useReportStore = create<ReportState>((set, get) => ({
  reportDate: initialDate,
  reportTime: "07:00:00",
  generatedBy: "",
  inputs: initial.inputs,
  calculations: initial.calculations,
  totals: initial.totals,
  reports: [],
  setInput: (key, value) => {
    const reportDate = get().reportDate;
    const inputs = { ...get().inputs, [key]: value };
    const calculated = calculateReport(inputs, reportDate);
    set({ inputs: calculated.inputs, calculations: calculated.calculations, totals: calculated.totals });
  },
  setGeneratedBy: (name) => set({ generatedBy: name }),
  setReportTime: (time) => set({ reportTime: time }),
  setReportDate: (date) => {
    const calculated = calculateReport(get().inputs, date);
    set({ reportDate: date, calculations: calculated.calculations, totals: calculated.totals });
  },
  loadReport: (report) => {
    set({
      activeReport: report,
      reportDate: report.reportDate.slice(0, 10),
      reportTime: report.reportTime,
      generatedBy: report.generatedBy,
      inputs: report.formData,
      calculations: report.calculations,
      totals: report.totals
    });
  },
  setReports: (reports) => set({ reports }),
  reset: () => {
    const date = todayISO();
    const calculated = calculateReport(defaultInputs, date);
    set({
      activeReport: undefined,
      reportDate: date,
      reportTime: "07:00:00",
      generatedBy: "",
      inputs: calculated.inputs,
      calculations: calculated.calculations,
      totals: calculated.totals
    });
  }
}));
