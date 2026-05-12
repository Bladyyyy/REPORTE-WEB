import type { ReportUser } from "@/lib/types";

export const DEGREE_OPTIONS = ["Lic.", "Tec.", "Dr.", "Dra.", "Enf.", "Aux.", "MSc.", "PhD"] as const;

export const formatReportUser = (user: Pick<ReportUser, "firstName" | "lastName" | "role" | "degree">) => {
  const fullName = `${user.degree} ${user.firstName} ${user.lastName}`.replace(/\s+/g, " ").trim();
  return [fullName, user.role.trim()].filter(Boolean).join(" | ");
};
