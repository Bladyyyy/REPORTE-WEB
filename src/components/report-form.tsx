"use client";

import { ClipboardCheck, Download, Pencil, Printer, Save, Sparkles, Trash2, UserCheck } from "lucide-react";
import Image from "next/image";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ActionButton } from "@/components/ui/action-button";
import { CENSUS_BEDS } from "@/lib/report-model";
import { DEGREE_OPTIONS, formatReportUser } from "@/lib/report-users";
import type { ReportCalculations, ReportInputs, ReportUser } from "@/lib/types";
import { useReportStore } from "@/store/report-store";
import { cn } from "@/lib/utils";

type ReportFormProps = {
  captureRef: React.RefObject<HTMLDivElement>;
  onCapture: () => Promise<void>;
  onSave: () => Promise<void>;
  onPdf: () => Promise<void>;
  onExcel: () => Promise<void>;
  saving: boolean;
};

type CellProps = {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

function Cell({ children, className, style }: CellProps) {
  return (
    <div className={cn("excel-cell", className)} style={style}>
      {children}
    </div>
  );
}

function HeaderCell({ children, className, style }: CellProps) {
  return (
    <Cell className={cn("excel-header", className)} style={style}>
      {children}
    </Cell>
  );
}

function FixedCell({ children, className, style }: CellProps) {
  return (
    <Cell className={cn("excel-fixed", className)} style={style}>
      {children}
    </Cell>
  );
}

function EditableCell({ field, className, style }: { field: keyof ReportInputs; className?: string; style?: React.CSSProperties }) {
  const value = useReportStore((state) => state.inputs[field]);
  const setInput = useReportStore((state) => state.setInput);

  return (
    <Cell className={cn("excel-editable", className)} style={style}>
      <input
        aria-label={field}
        type="text"
        inputMode="numeric"
        value={value}
        onChange={(event) => setInput(field, Number(event.target.value))}
      />
    </Cell>
  );
}

function FormulaCell({ field, className, style }: { field: keyof ReportCalculations; className?: string; style?: React.CSSProperties; showFormula?: boolean }) {
  const value = useReportStore((state) => state.calculations[field]);
  const isNegative = typeof value === "number" && value < 0;

  return (
    <Cell className={cn("excel-formula", isNegative && "excel-alert", className)} style={style}>
      <strong>{value}</strong>
    </Cell>
  );
}

function formatLongDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  return new Intl.DateTimeFormat("es-BO", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    year: "numeric"
  }).format(parsed);
}

export function ReportForm({ captureRef, onCapture, onSave, onPdf, onExcel, saving }: ReportFormProps) {
  const reportDate = useReportStore((state) => state.reportDate);
  const reportTime = useReportStore((state) => state.reportTime);
  const generatedBy = useReportStore((state) => state.generatedBy);
  const setGeneratedBy = useReportStore((state) => state.setGeneratedBy);
  const totals = useReportStore((state) => state.totals);
  const [users, setUsers] = useState<ReportUser[]>([]);
  const [isUserPanelOpen, setIsUserPanelOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({ firstName: "", lastName: "", role: "", degree: "Lic." });

  const refreshUsers = async () => {
    const response = await fetch("/api/users", { cache: "no-store" });
    setUsers((await response.json()) as ReportUser[]);
  };

  useEffect(() => {
    void refreshUsers();
  }, []);

  const resetUserForm = () => {
    setEditingId(null);
    setUserForm({ firstName: "", lastName: "", role: "", degree: "Lic." });
  };

  const selectUser = (user: ReportUser) => {
    setGeneratedBy(formatReportUser(user));
    setIsUserPanelOpen(false);
  };

  const editUser = (user: ReportUser) => {
    setEditingId(user.id);
    setUserForm({
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      degree: user.degree
    });
  };

  const saveUser = async () => {
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/users/${editingId}` : "/api/users";
    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userForm)
    });

    if (!response.ok) return;
    const saved = (await response.json()) as ReportUser;
    await refreshUsers();
    setGeneratedBy(formatReportUser(saved));
    resetUserForm();
  };

  const deleteUser = async (user: ReportUser) => {
    await fetch(`/api/users/${user.id}`, { method: "DELETE" });
    if (generatedBy === formatReportUser(user)) {
      setGeneratedBy("");
    }
    await refreshUsers();
  };

  return (
    <section className="grid gap-6">
      <motion.div
        ref={captureRef}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="excel-shell"
      >
        <div className="excel-grid" role="table" aria-label="Censo de camas Hospital de la Mujer">
          <Cell className="excel-logo-cell no-border" style={{ gridColumn: "1 / 2", gridRow: "1 / 5" }}>
            <Image src="/assets/img/hospital-mujer-original.jpeg" alt="Hospital de la Mujer" width={150} height={150} className="excel-logo-main" />
          </Cell>
          <Cell className="excel-main-title no-border" style={{ gridColumn: "2 / 7", gridRow: "1 / 2" }}>
            HOSPITAL DE LA MUJER
          </Cell>
          <HeaderCell style={{ gridColumn: "2 / 3", gridRow: "2 / 4" }}>FECHA</HeaderCell>
          <Cell className="excel-formula excel-date-value" style={{ gridColumn: "3 / 6", gridRow: "2 / 4" }}>
            <strong>{formatLongDate(reportDate)}</strong>
          </Cell>
          <HeaderCell style={{ gridColumn: "8 / 9", gridRow: "2 / 4" }}>HORA:</HeaderCell>
          <Cell className="excel-header excel-time-value" style={{ gridColumn: "9 / 11", gridRow: "2 / 4" }}>
            <span>HORA ACTUAL</span>
            <strong>{reportTime}</strong>
          </Cell>

          <HeaderCell style={{ gridColumn: "2 / 3", gridRow: "5 / 6" }}>NUMERO DE<br />CAMAS<br />CENSABLES</HeaderCell>
          <HeaderCell style={{ gridColumn: "3 / 4", gridRow: "5 / 6" }}>CAMAS<br />OCUPADAS</HeaderCell>
          <HeaderCell style={{ gridColumn: "4 / 6", gridRow: "5 / 6" }}>SERVICIO</HeaderCell>
          <HeaderCell style={{ gridColumn: "6 / 7", gridRow: "5 / 6" }}>INTERNADAS</HeaderCell>
          <HeaderCell style={{ gridColumn: "8 / 9", gridRow: "5 / 6" }}>CAMAS LIBRES</HeaderCell>
          <HeaderCell style={{ gridColumn: "9 / 11", gridRow: "4 / 5" }}>ALTAS</HeaderCell>
          <HeaderCell style={{ gridColumn: "9 / 10", gridRow: "5 / 6" }}>M</HeaderCell>
          <HeaderCell style={{ gridColumn: "10 / 11", gridRow: "5 / 6" }}>T</HeaderCell>

          <HeaderCell style={{ gridColumn: "1 / 2", gridRow: "6 / 8" }}>Ginecologia<br />PISO 1</HeaderCell>
          <FixedCell style={{ gridColumn: "2 / 3", gridRow: "6 / 8" }}>{CENSUS_BEDS.b6}</FixedCell>
          <FormulaCell field="c6" style={{ gridColumn: "3 / 4", gridRow: "6 / 8" }} />
          <HeaderCell style={{ gridColumn: "4 / 6", gridRow: "6 / 7" }}>Ginecologia</HeaderCell>
          <EditableCell field="f6" style={{ gridColumn: "6 / 7", gridRow: "6 / 7" }} />
          <FormulaCell field="h6" style={{ gridColumn: "8 / 9", gridRow: "6 / 8" }} />
          <EditableCell field="i6" style={{ gridColumn: "9 / 10", gridRow: "6 / 8" }} />
          <EditableCell field="j6" style={{ gridColumn: "10 / 11", gridRow: "6 / 8" }} />
          <HeaderCell style={{ gridColumn: "4 / 6", gridRow: "7 / 8" }}>Obstetricia</HeaderCell>
          <EditableCell field="f7" style={{ gridColumn: "6 / 7", gridRow: "7 / 8" }} />

          <HeaderCell style={{ gridColumn: "1 / 2", gridRow: "8 / 11" }}>Obstetricia ARO<br />PISO 3</HeaderCell>
          <FixedCell style={{ gridColumn: "2 / 3", gridRow: "8 / 11" }}>{CENSUS_BEDS.b8}</FixedCell>
          <FormulaCell field="c8" style={{ gridColumn: "3 / 4", gridRow: "8 / 11" }} />
          <HeaderCell style={{ gridColumn: "4 / 6", gridRow: "8 / 9" }}>ARO</HeaderCell>
          <EditableCell field="f8" style={{ gridColumn: "6 / 7", gridRow: "8 / 9" }} />
          <FormulaCell field="h8" style={{ gridColumn: "8 / 9", gridRow: "8 / 11" }} />
          <EditableCell field="i8" style={{ gridColumn: "9 / 10", gridRow: "8 / 11" }} />
          <EditableCell field="j8" style={{ gridColumn: "10 / 11", gridRow: "8 / 11" }} />
          <HeaderCell style={{ gridColumn: "4 / 6", gridRow: "9 / 10" }}>Obstetricia</HeaderCell>
          <EditableCell field="f9" style={{ gridColumn: "6 / 7", gridRow: "9 / 10" }} />
          <HeaderCell style={{ gridColumn: "4 / 6", gridRow: "10 / 11" }}>Ginecologia</HeaderCell>
          <EditableCell field="f10" style={{ gridColumn: "6 / 7", gridRow: "10 / 11" }} />

          <HeaderCell style={{ gridColumn: "1 / 2", gridRow: "11 / 13" }}>Obstetricia-Puerperio<br />PISO 4</HeaderCell>
          <FixedCell style={{ gridColumn: "2 / 3", gridRow: "11 / 13" }}>{CENSUS_BEDS.b11}</FixedCell>
          <FormulaCell field="c11" style={{ gridColumn: "3 / 4", gridRow: "11 / 13" }} />
          <HeaderCell style={{ gridColumn: "4 / 6", gridRow: "11 / 12" }}>COVID-19 (+)</HeaderCell>
          <EditableCell field="f11" style={{ gridColumn: "6 / 7", gridRow: "11 / 12" }} />
          <FormulaCell field="h11" style={{ gridColumn: "8 / 9", gridRow: "11 / 13" }} />
          <EditableCell field="i11" style={{ gridColumn: "9 / 10", gridRow: "11 / 13" }} />
          <EditableCell field="j11" style={{ gridColumn: "10 / 11", gridRow: "11 / 13" }} />
          <HeaderCell style={{ gridColumn: "4 / 6", gridRow: "12 / 13" }}>COVID-19 (-)</HeaderCell>
          <EditableCell field="f12" style={{ gridColumn: "6 / 7", gridRow: "12 / 13" }} />

          <HeaderCell style={{ gridColumn: "1 / 2", gridRow: "15 / 19" }}>Neonatologia<br />PISO 2</HeaderCell>
          <HeaderCell style={{ gridColumn: "2 / 3", gridRow: "15 / 16" }}>NUMERO DE<br />CAMAS<br />CENSABLES</HeaderCell>
          <HeaderCell style={{ gridColumn: "3 / 4", gridRow: "15 / 16" }}>CAMAS<br />OCUPADAS</HeaderCell>
          <HeaderCell style={{ gridColumn: "4 / 5", gridRow: "15 / 16" }}>SERVICIO</HeaderCell>
          <HeaderCell style={{ gridColumn: "5 / 6", gridRow: "15 / 16" }}>CAMA</HeaderCell>
          <HeaderCell style={{ gridColumn: "6 / 7", gridRow: "15 / 16" }}>INTERNADAS</HeaderCell>
          <HeaderCell style={{ gridColumn: "8 / 9", gridRow: "15 / 16" }}>CAMAS LIBRES</HeaderCell>
          <HeaderCell style={{ gridColumn: "9 / 11", gridRow: "14 / 15" }}>ALTAS</HeaderCell>
          <HeaderCell style={{ gridColumn: "9 / 10", gridRow: "15 / 16" }}>M</HeaderCell>
          <HeaderCell style={{ gridColumn: "10 / 11", gridRow: "15 / 16" }}>T</HeaderCell>
          <FixedCell style={{ gridColumn: "2 / 3", gridRow: "16 / 19" }}>{CENSUS_BEDS.b16}</FixedCell>
          <FormulaCell field="c16" style={{ gridColumn: "3 / 4", gridRow: "16 / 19" }} />
          <HeaderCell style={{ gridColumn: "4 / 5", gridRow: "16 / 17" }}>Crecimiento<br />desarrollo</HeaderCell>
          <FixedCell style={{ gridColumn: "5 / 6", gridRow: "16 / 17" }}>{CENSUS_BEDS.e16}</FixedCell>
          <EditableCell field="f16" style={{ gridColumn: "6 / 7", gridRow: "16 / 17" }} />
          <FormulaCell field="h16" style={{ gridColumn: "8 / 9", gridRow: "16 / 17" }} />
          <EditableCell field="i16" style={{ gridColumn: "9 / 10", gridRow: "16 / 17" }} />
          <EditableCell field="j16" style={{ gridColumn: "10 / 11", gridRow: "16 / 17" }} />
          <HeaderCell style={{ gridColumn: "4 / 5", gridRow: "17 / 18" }}>Cuidados<br />Intermedios</HeaderCell>
          <FixedCell style={{ gridColumn: "5 / 6", gridRow: "17 / 18" }}>{CENSUS_BEDS.e17}</FixedCell>
          <EditableCell field="f17" style={{ gridColumn: "6 / 7", gridRow: "17 / 18" }} />
          <FormulaCell field="h17" style={{ gridColumn: "8 / 9", gridRow: "17 / 18" }} />
          <EditableCell field="i17" style={{ gridColumn: "9 / 10", gridRow: "17 / 18" }} />
          <EditableCell field="j17" style={{ gridColumn: "10 / 11", gridRow: "17 / 18" }} />
          <HeaderCell style={{ gridColumn: "4 / 5", gridRow: "18 / 19" }}>UCIN</HeaderCell>
          <FixedCell style={{ gridColumn: "5 / 6", gridRow: "18 / 19" }}>{CENSUS_BEDS.e18}</FixedCell>
          <EditableCell field="f18" style={{ gridColumn: "6 / 7", gridRow: "18 / 19" }} />
          <FormulaCell field="h18" style={{ gridColumn: "8 / 9", gridRow: "18 / 19" }} />
          <EditableCell field="i18" style={{ gridColumn: "9 / 10", gridRow: "18 / 19" }} />
          <EditableCell field="j18" style={{ gridColumn: "10 / 11", gridRow: "18 / 19" }} />

          <HeaderCell style={{ gridColumn: "1 / 2", gridRow: "20 / 23" }}>UTI Adultos</HeaderCell>
          <HeaderCell style={{ gridColumn: "2 / 3", gridRow: "20 / 21" }}>NUMERO DE<br />CAMAS<br />CENSABLES</HeaderCell>
          <HeaderCell style={{ gridColumn: "3 / 4", gridRow: "20 / 21" }}>COVID-19</HeaderCell>
          <HeaderCell style={{ gridColumn: "4 / 5", gridRow: "20 / 21" }}>INTERNADAS</HeaderCell>
          <HeaderCell style={{ gridColumn: "5 / 7", gridRow: "20 / 21" }}>CAMAS OCUPADAS</HeaderCell>
          <HeaderCell style={{ gridColumn: "8 / 9", gridRow: "20 / 21" }}>CAMAS<br />DISPONIBLES</HeaderCell>
          <HeaderCell style={{ gridColumn: "9 / 10", gridRow: "20 / 21" }}>M</HeaderCell>
          <HeaderCell style={{ gridColumn: "10 / 11", gridRow: "20 / 21" }}>T</HeaderCell>
          <FixedCell style={{ gridColumn: "2 / 3", gridRow: "21 / 23" }}>{CENSUS_BEDS.b21}</FixedCell>
          <HeaderCell style={{ gridColumn: "3 / 4", gridRow: "21 / 22" }}>COVID POSITIVO (+)</HeaderCell>
          <EditableCell field="d21" style={{ gridColumn: "4 / 5", gridRow: "21 / 22" }} />
          <FormulaCell field="e21" style={{ gridColumn: "5 / 7", gridRow: "21 / 23" }} />
          <FormulaCell field="h21" style={{ gridColumn: "8 / 9", gridRow: "21 / 23" }} />
          <EditableCell field="i21" style={{ gridColumn: "9 / 10", gridRow: "21 / 23" }} />
          <EditableCell field="j21" style={{ gridColumn: "10 / 11", gridRow: "21 / 23" }} />
          <HeaderCell style={{ gridColumn: "3 / 4", gridRow: "22 / 23" }}>COVID NEGATIVO (-)</HeaderCell>
          <EditableCell field="d22" style={{ gridColumn: "4 / 5", gridRow: "22 / 23" }} />

          <HeaderCell style={{ gridColumn: "3 / 4", gridRow: "25 / 26" }}>COVID POSITIVO(+)</HeaderCell>
          <EditableCell field="d25" style={{ gridColumn: "4 / 5", gridRow: "25 / 26" }} />
          <HeaderCell style={{ gridColumn: "3 / 4", gridRow: "26 / 27" }}>COVID NEGATIVO (-)</HeaderCell>
          <EditableCell field="d26" style={{ gridColumn: "4 / 5", gridRow: "26 / 27" }} />
          <Cell className="excel-user-cell" style={{ gridColumn: "6 / 11", gridRow: "25 / 27" }}>
            <strong>{generatedBy.trim()}</strong>
          </Cell>
        </div>
      </motion.div>

      <aside className="no-capture no-print grid gap-4 lg:grid-cols-[1.15fr_1fr_1fr_1fr]">
        <div className="glass rounded-3xl p-5">
          <div className="mb-5 flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-300/10 p-3 text-cyan-200">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/60">Acciones</p>
              <h3 className="font-semibold text-white">Reporte limpio</h3>
            </div>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <ActionButton onClick={onSave} disabled={saving} icon={<Save size={17} />}>
              {saving ? "Guardando" : "Guardar Reporte"}
            </ActionButton>
            <ActionButton tone="ghost" onClick={onCapture} icon={<ClipboardCheck size={17} />}>
              Captura
            </ActionButton>
            <ActionButton tone="ghost" onClick={onPdf} icon={<Printer size={17} />}>
              Exportar PDF
            </ActionButton>
            <ActionButton tone="ghost" onClick={onExcel} icon={<Download size={17} />}>
              Exportar Excel
            </ActionButton>
          </div>
        </div>
        <div className="glass rounded-3xl p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/60">Usuario del reporte</p>
          <div className="mt-4 grid gap-3">
            <div className="signature-preview">
              {generatedBy || "Nombre del servidor publico"}
            </div>
            <ActionButton tone="ghost" onClick={() => setIsUserPanelOpen((value) => !value)} icon={<UserCheck size={17} />}>
              {isUserPanelOpen ? "Cerrar usuarios" : "Anadir usuario para reporte"}
            </ActionButton>
          </div>
        </div>
        <div className="glass rounded-3xl p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/60">Leyenda del Excel</p>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="flex items-center justify-between gap-3"><span className="legend-swatch bg-[#fff200]" />Campos amarillos editables</div>
            <div className="flex items-center justify-between gap-3"><span className="legend-swatch bg-[#a9d18e]" />Campos verdes automaticos</div>
            <div className="flex items-center justify-between gap-3"><span className="legend-swatch bg-[#00b0f0]" />Campos azules fijos</div>
          </div>
        </div>
        <div className="glass rounded-3xl p-5">
          <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/60">Resumen operativo</p>
          <div className="mt-4 space-y-3 text-sm text-slate-300">
            <div className="flex justify-between"><span>Camas ocupadas</span><strong className="text-white">{totals.occupiedBeds}</strong></div>
            <div className="flex justify-between"><span>Camas libres</span><strong className="text-white">{totals.availableBeds}</strong></div>
            <div className="flex justify-between"><span>Utilizacion</span><strong className="text-white">{totals.utilizationRate}%</strong></div>
            <div className="flex justify-between"><span>Altas manana</span><strong className="text-white">{totals.dischargesMorning}</strong></div>
          </div>
        </div>
      </aside>

      {isUserPanelOpen ? (
        <section className="no-capture no-print glass rounded-3xl p-5">
          <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-cyan-100/60">Gestion de usuarios</p>
              <h3 className="text-xl font-semibold text-white">Servidor publico que genera el reporte</h3>
            </div>
            <ActionButton tone="ghost" onClick={resetUserForm}>Nuevo usuario</ActionButton>
          </div>

          <div className="grid gap-3 lg:grid-cols-[1fr_1fr_.75fr_1fr_auto]">
            <input className="user-panel-input" value={userForm.firstName} onChange={(event) => setUserForm((form) => ({ ...form, firstName: event.target.value }))} placeholder="Nombres" />
            <input className="user-panel-input" value={userForm.lastName} onChange={(event) => setUserForm((form) => ({ ...form, lastName: event.target.value }))} placeholder="Apellidos" />
            <select className="user-panel-input" value={userForm.degree} onChange={(event) => setUserForm((form) => ({ ...form, degree: event.target.value }))}>
              {DEGREE_OPTIONS.map((degree) => (
                <option key={degree} value={degree}>{degree}</option>
              ))}
            </select>
            <input className="user-panel-input" value={userForm.role} onChange={(event) => setUserForm((form) => ({ ...form, role: event.target.value }))} placeholder="Asignacion o cargo" />
            <ActionButton onClick={saveUser} icon={<Save size={17} />}>{editingId ? "Actualizar" : "Guardar"}</ActionButton>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {users.map((user) => (
              <div key={user.id} className="user-crud-card">
                <button type="button" onClick={() => selectUser(user)} className="min-w-0 flex-1 text-left">
                  <strong>{user.degree} {user.firstName} {user.lastName}</strong>
                  <span>{user.role}</span>
                </button>
                <button type="button" aria-label="Editar usuario" onClick={() => editUser(user)}><Pencil size={16} /></button>
                <button type="button" aria-label="Eliminar usuario" onClick={() => deleteUser(user)}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </section>
  );
}
