export type Shift = "MANANA";

export type ReportInputs = {
  f6: number;
  f7: number;
  f8: number;
  f9: number;
  f10: number;
  f11: number;
  f12: number;
  f16: number;
  f17: number;
  f18: number;
  d21: number;
  d22: number;
  d23: number;
  d25: number;
  d26: number;
  i6: number;
  j6: number;
  i8: number;
  j8: number;
  i11: number;
  j11: number;
  i16: number;
  j16: number;
  i17: number;
  j17: number;
  i18: number;
  j18: number;
  i21: number;
  j21: number;
};

export type ReportCalculations = {
  c6: number;
  c8: number;
  c11: number;
  c16: number;
  h6: number;
  h8: number;
  h11: number;
  h16: number;
  h17: number;
  h18: number;
  e21: number;
  h21: number;
  c3: string;
};

export type ReportTotals = {
  occupiedBeds: number;
  availableBeds: number;
  dischargesMorning: number;
  dischargesAfternoon: number;
  censusBeds: number;
  utilizationRate: number;
  neonatalDemand: number;
  emergencyCovid: number;
};

export type ReportPayload = {
  reportDate: string;
  reportTime: string;
  shift: Shift;
  generatedBy: string;
  formData: ReportInputs;
  calculations: ReportCalculations;
  totals: ReportTotals;
  screenshot?: string;
};

export type StoredReport = ReportPayload & {
  id: string;
  folio: string;
  createdAt: string;
  updatedAt: string;
};

export type ReportUser = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  degree: string;
  createdAt: string;
  updatedAt: string;
};
