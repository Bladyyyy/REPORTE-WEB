import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateReport, todayISO } from "@/lib/report-model";
import type { ReportPayload, StoredReport } from "@/lib/types";



const toStoredReport = (report: {
  id: string;
  folio: string;
  shift: string;
  reportDate: Date;
  reportTime: string;
  generatedBy: string;
  formData: unknown;
  calculations: unknown;
  totals: unknown;
  screenshot: string | null;
  createdAt: Date;
  updatedAt: Date;
}): StoredReport => ({
  id: report.id,
  folio: report.folio,
  shift: "MANANA",
  reportDate: report.reportDate.toISOString(),
  reportTime: report.reportTime,
  generatedBy: report.generatedBy,
  formData: JSON.parse(String(report.formData)) as StoredReport["formData"],
  calculations: JSON.parse(String(report.calculations)) as StoredReport["calculations"],
  totals: JSON.parse(String(report.totals)) as StoredReport["totals"],
  screenshot: report.screenshot ?? undefined,
  createdAt: report.createdAt.toISOString(),
  updatedAt: report.updatedAt.toISOString()
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get("q")?.trim().toLowerCase() ?? "";
  const date = searchParams.get("date");

  const reports = await prisma.report.findMany({
    where: {
      shift: "MANANA"
    },
    orderBy: {
      reportDate: "desc"
    }
  });

  const filtered = reports.filter((report) => {
    const matchesDate = date ? report.reportDate.toISOString().slice(0, 10) === date : true;
    const matchesText = q
      ? report.folio.toLowerCase().includes(q) ||
        report.generatedBy.toLowerCase().includes(q) ||
        report.reportDate.toISOString().includes(q)
      : true;
    return matchesDate && matchesText;
  });

  return NextResponse.json(filtered.map(toStoredReport));
}

export async function POST(request: Request) {
  const body = (await request.json()) as Partial<ReportPayload>;
  const date = body.reportDate ?? todayISO();
  const calculated = calculateReport(body.formData ?? {}, date);
  const reportTime = body.reportTime ?? new Date().toLocaleTimeString("es-BO", { hour12: false });
  const reportDate = new Date(`${date}T07:00:00.000Z`);
  const folio = `HM-${date.replaceAll("-", "")}-${Date.now().toString(36).toUpperCase()}`;

  const report = await prisma.report.create({
    data: {
      folio,
      shift: "MANANA",
      reportDate,
      reportTime,
      generatedBy: body.generatedBy?.trim() ?? "",
      formData: JSON.stringify(calculated.inputs),
      calculations: JSON.stringify(calculated.calculations),
      totals: JSON.stringify(calculated.totals),
      screenshot: body.screenshot
    }
  });

  return NextResponse.json(toStoredReport(report), { status: 201 });
}
