import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import type { StoredReport } from "@/lib/types";

export const dynamic = "force-dynamic";

const mapReport = (report: NonNullable<Awaited<ReturnType<typeof prisma.report.findUnique>>>): StoredReport => ({
  id: report.id,
  folio: report.folio,
  shift: "MANANA",
  reportDate: report.reportDate.toISOString(),
  reportTime: report.reportTime,
  generatedBy: report.generatedBy,
  formData: JSON.parse(report.formData) as StoredReport["formData"],
  calculations: JSON.parse(report.calculations) as StoredReport["calculations"],
  totals: JSON.parse(report.totals) as StoredReport["totals"],
  screenshot: report.screenshot ?? undefined,
  createdAt: report.createdAt.toISOString(),
  updatedAt: report.updatedAt.toISOString()
});

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const report = await prisma.report.findUnique({ where: { id: params.id } });

  if (!report) {
    return NextResponse.json({ message: "Reporte no encontrado" }, { status: 404 });
  }

  return NextResponse.json(mapReport(report));
}
