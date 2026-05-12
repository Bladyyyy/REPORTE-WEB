import type { ReportCalculations, ReportInputs, ReportTotals } from "@/lib/types";

export const CENSUS_BEDS = {
  b6: 24,
  b8: 24,
  b11: 27,
  b16: 29,
  b21: 5,
  e16: 8,
  e17: 6,
  e18: 15
} as const;

export const defaultInputs: ReportInputs = {
  f6: 0,
  f7: 0,
  f8: 0,
  f9: 0,
  f10: 0,
  f11: 0,
  f12: 0,
  f16: 0,
  f17: 0,
  f18: 0,
  d21: 0,
  d22: 0,
  d23: 0,
  d25: 0,
  d26: 0,
  i6: 0,
  j6: 0,
  i8: 0,
  j8: 0,
  i11: 0,
  j11: 0,
  i16: 0,
  j16: 0,
  i17: 0,
  j17: 0,
  i18: 0,
  j18: 0,
  i21: 0,
  j21: 0
};

export const toNumber = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export const sanitizeInputs = (inputs: Partial<ReportInputs>): ReportInputs => {
  const next = { ...defaultInputs, ...inputs };
  return Object.fromEntries(
    Object.entries(next).map(([key, value]) => [key, toNumber(value)])
  ) as ReportInputs;
};

export const todayISO = () => {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 10);
};

export const calculateReport = (
  rawInputs: Partial<ReportInputs>,
  date = todayISO()
): { inputs: ReportInputs; calculations: ReportCalculations; totals: ReportTotals } => {
  const inputs = sanitizeInputs(rawInputs);

  const calculations: ReportCalculations = {
    c6: inputs.f6 + inputs.f7,
    c8: inputs.f8 + inputs.f9 + inputs.f10,
    c11: inputs.f11 + inputs.f12,
    c16: inputs.f16 + inputs.f17 + inputs.f18,
    h6: CENSUS_BEDS.b6 - (inputs.f6 + inputs.f7),
    h8: CENSUS_BEDS.b8 - (inputs.f8 + inputs.f9 + inputs.f10),
    h11: CENSUS_BEDS.b11 - (inputs.f11 + inputs.f12),
    h16: CENSUS_BEDS.e16 - inputs.f16,
    h17: CENSUS_BEDS.e17 - inputs.f17,
    h18: CENSUS_BEDS.e18 - inputs.f18,
    e21: inputs.d22,
    h21: CENSUS_BEDS.b21 - inputs.d22,
    c3: date
  };

  const occupiedBeds =
    calculations.c6 + calculations.c8 + calculations.c11 + calculations.c16 + calculations.e21;
  const availableBeds =
    calculations.h6 +
    calculations.h8 +
    calculations.h11 +
    calculations.h16 +
    calculations.h17 +
    calculations.h18 +
    calculations.h21;
  const dischargesMorning =
    inputs.i6 + inputs.i8 + inputs.i11 + inputs.i16 + inputs.i17 + inputs.i18 + inputs.i21;
  const dischargesAfternoon =
    inputs.j6 + inputs.j8 + inputs.j11 + inputs.j16 + inputs.j17 + inputs.j18 + inputs.j21;
  const censusBeds = CENSUS_BEDS.b6 + CENSUS_BEDS.b8 + CENSUS_BEDS.b11 + CENSUS_BEDS.b16 + CENSUS_BEDS.b21;

  const totals: ReportTotals = {
    occupiedBeds,
    availableBeds,
    dischargesMorning,
    dischargesAfternoon,
    censusBeds,
    utilizationRate: censusBeds > 0 ? Math.round((occupiedBeds / censusBeds) * 1000) / 10 : 0,
    neonatalDemand: calculations.c16,
    emergencyCovid: inputs.d21 + inputs.d22 + inputs.d23 + inputs.d25 + inputs.d26
  };

  return { inputs, calculations, totals };
};

export const serviceRows = [
  {
    group: "Ginecologia Piso 1",
    bedLabel: "24",
    services: [
      { label: "Ginecologia", input: "f6", disM: "i6", disT: "j6" },
      { label: "Obstetricia", input: "f7" }
    ],
    occupied: "c6",
    free: "h6"
  },
  {
    group: "Obstetricia ARO Piso 3",
    bedLabel: "24",
    services: [
      { label: "ARO", input: "f8", disM: "i8", disT: "j8" },
      { label: "Obstetricia", input: "f9" },
      { label: "Ginecologia", input: "f10" }
    ],
    occupied: "c8",
    free: "h8"
  },
  {
    group: "Obstetricia-Puerperio Piso 4",
    bedLabel: "27",
    services: [
      { label: "COVID-19 (+)", input: "f11", disM: "i11", disT: "j11" },
      { label: "COVID-19 (-)", input: "f12" }
    ],
    occupied: "c11",
    free: "h11"
  }
] as const;

export const neonatalRows = [
  { label: "Crecimiento desarrollo", capacity: 8, input: "f16", free: "h16", disM: "i16", disT: "j16" },
  { label: "Cuidados Intermedios", capacity: 6, input: "f17", free: "h17", disM: "i17", disT: "j17" },
  { label: "UCIN", capacity: 15, input: "f18", free: "h18", disM: "i18", disT: "j18" }
] as const;
