import { NextResponse } from "next/server";
import { buildAnalytics } from "@/lib/analytics";
import { prisma } from "@/lib/prisma";
import type { StoredReport } from "@/lib/types";



export async function GET() {
  const reports = await prisma.report.findMany({
    where: { shift: "MANANA" },
    orderBy: { reportDate: "asc" }
  });

  const stored = reports.map(
    (report): StoredReport => ({
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
    })
  );

  return NextResponse.json(buildAnalytics(stored));
}
