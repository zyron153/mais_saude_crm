"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Users2, Stethoscope, UserCheck, Clock, Phone, Mail, ChevronRight, Plus, X } from "lucide-react";
import { Modal } from "../../../components/ui/modal";
import { useMessage } from "../../../components/ui/message-handler";

type StaffMember = {
  id: string;
  name: string;
  role: "doctor" | "nurse" | "receptionist" | "technician";
  specialty?: string;
  phone: string;
  email: string;
  shift: { start: string; end: string; days: string };
  status: "on_duty" | "off_duty" | "on_leave";
  appointmentsToday: number;
  initials: string;
  color: string;
};

type ApiStaff = {
  id: string;
  fullName: string;
  email: string;
  role: string;
  phone: string | null;
  specialtyCode: string | null;
  availability: { dayOfWeek: number; startTime: string; endTime: string }[];
};

const DOW_NAMES: Record<number, string> = { 0: "Dom", 1: "Seg", 2: "Ter", 3: "Qua", 4: "Qui", 5: "Sex", 6: "Sáb" };

const DB_ROLE_MAP: Record<string, StaffMember["role"]> = {
  doctor: "doctor", nurse: "nurse", receptionist: "receptionist", lab_tech: "technician",
  admin: "receptionist", corporate_hr: "receptionist",
};

function toUiMember(s: ApiStaff, idx: number): StaffMember {
  const todayDow = new Date().getDay();
  const todayAvail = s.availability.filter((a) => a.dayOfWeek === todayDow);
  const allDays = [...new Set(s.availability.map((a) => a.dayOfWeek))].sort().map((d) => DOW_NAMES[d]).join(", ");
  return {
    id: s.id,
    name: s.fullName,
    role: DB_ROLE_MAP[s.role] ?? "receptionist",
    specialty: s.specialtyCode ?? undefined,
    phone: s.phone ?? "—",
    email: s.email,
    shift: {
      start: todayAvail[0]?.startTime ?? "—",
      end:   todayAvail[0]?.endTime   ?? "—",
      days:  allDays || "—",
    },
    status: todayAvail.length > 0 ? "on_duty" : "off_duty",
    appointmentsToday: 0,
    initials: makeInitials(s.fullName),
    color: COLORS[idx % COLORS.length],
  };
}

const ROLE_META: Record<string, { label: string; plural: string; bg: string; cls: string }> = {
  doctor:       { label: "Médico",        plural: "Médicos",    bg: "bg-brand-50",   cls: "text-brand-700"   },
  nurse:        { label: "Enfermeira/o",  plural: "Enfermagem", bg: "bg-emerald-50", cls: "text-emerald-700" },
  receptionist: { label: "Recepcionista", plural: "Recepção",   bg: "bg-amber-50",   cls: "text-amber-700"   },
  technician:   { label: "Técnico",       plural: "Técnicos",   bg: "bg-violet-50",  cls: "text-violet-700"  },
};

const STATUS_META: Record<string, { label: string; cls: string; dot: string }> = {
  on_duty:  { label: "Em Serviço", cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80", dot: "bg-emerald-500" },
  off_duty: { label: "Fora",       cls: "bg-dim-100 text-dim-500",                                   dot: "bg-dim-400"     },
  on_leave: { label: "De Férias",  cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/80",       dot: "bg-amber-400"   },
};

const COLORS = ["bg-brand-700","bg-violet-700","bg-blue-700","bg-emerald-700","bg-teal-700","bg-amber-700","bg-orange-700","bg-rose-700","bg-pink-700","bg-indigo-700"];

function makeInitials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

const inputCls =
  "w-full border border-dim-200 rounded-[10px] px-3.5 py-2.5 text-[13px] text-dim-900 placeholder:text-dim-400 bg-white focus:outline-none focus:border-brand-500 focus:shadow-[0_0_0_3px_rgba(19,163,163,.12)] transition-all shadow-[0_1px_2px_rgba(0,0,0,.05)] hover:border-dim-300";

function FieldRow({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-dim-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-[11px] text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}

const BLANK_FORM = { name: "", role: "doctor" as StaffMember["role"], specialty: "", phone: "", email: "", shiftStart: "08:00", shiftEnd: "16:00", shiftDays: "Seg – Sex" };

function StaffForm({ initialValues, onSave, onCancel, submitLabel }: {
  initialValues?: typeof BLANK_FORM;
  onSave: (v: typeof BLANK_FORM) => void;
  onCancel: () => void;
  submitLabel: string;
}) {
  const [form, setForm] = useState(initialValues ?? BLANK_FORM);
  const [errs, setErrs] = useState<Record<string, string>>({});

  function set(k: keyof typeof BLANK_FORM, v: string) {
    setForm((prev) => ({ ...prev, [k]: v }));
    setErrs((prev) => ({ ...prev, [k]: "" }));
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const e2: Record<string, string> = {};
    if (!form.name.trim()) e2.name = "Nome é obrigatório";
    if (!form.phone.trim()) e2.phone = "Telefone é obrigatório";
    if (!form.email.trim()) e2.email = "Email é obrigatório";
    if (!form.shiftDays.trim()) e2.shiftDays = "Dias são obrigatórios";
    if (Object.keys(e2).length) { setErrs(e2); return; }
    onSave(form);
  }

  return (
    <form onSubmit={submit}>
      <div className="px-6 py-5 grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <FieldRow label="Nome Completo" required error={errs.name}>
            <input value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Ex: Dra. Maria Silva" className={inputCls} />
          </FieldRow>
        </div>

        <FieldRow label="Função" required>
          <select value={form.role} onChange={(e) => set("role", e.target.value as StaffMember["role"])} className={inputCls}>
            <option value="doctor">Médico/a</option>
            <option value="nurse">Enfermeiro/a</option>
            <option value="receptionist">Recepcionista</option>
            <option value="technician">Técnico/a</option>
          </select>
        </FieldRow>

        <FieldRow label="Especialidade">
          <input value={form.specialty} onChange={(e) => set("specialty", e.target.value)} placeholder="Ex: Cardiologia" className={inputCls} />
        </FieldRow>

        <FieldRow label="Telefone" required error={errs.phone}>
          <input value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="+238 991 0000" className={inputCls} />
        </FieldRow>

        <FieldRow label="Email" required error={errs.email}>
          <input type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="nome@maissaudecv.com" className={inputCls} />
        </FieldRow>

        <FieldRow label="Início do Turno">
          <input type="time" value={form.shiftStart} onChange={(e) => set("shiftStart", e.target.value)} className={inputCls} />
        </FieldRow>

        <FieldRow label="Fim do Turno">
          <input type="time" value={form.shiftEnd} onChange={(e) => set("shiftEnd", e.target.value)} className={inputCls} />
        </FieldRow>

        <div className="col-span-2">
          <FieldRow label="Dias de Trabalho" required error={errs.shiftDays}>
            <input value={form.shiftDays} onChange={(e) => set("shiftDays", e.target.value)} placeholder="Ex: Seg – Sex" className={inputCls} />
          </FieldRow>
        </div>
      </div>

      <div className="px-6 py-4 border-t border-dim-100 bg-dim-50/60 flex items-center gap-3">
        <button type="submit" className="bg-brand-700 hover:bg-brand-800 text-white font-semibold px-5 py-2.5 rounded-[10px] text-[13px] transition-colors shadow-[0_1px_2px_rgba(0,0,0,.08)]">
          {submitLabel}
        </button>
        <button type="button" onClick={onCancel} className="border border-dim-200 bg-white hover:bg-dim-50 text-dim-700 font-medium px-5 py-2.5 rounded-[10px] text-[13px] transition-colors">
          Cancelar
        </button>
      </div>
    </form>
  );
}

const CARD = "bg-white rounded-[16px] border border-dim-200 shadow-[0_1px_4px_rgba(0,0,0,.08),0_0_0_1px_rgba(0,0,0,.03)] overflow-hidden";

export default function StaffPage() {
  const { addMessage } = useMessage();
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [newOpen, setNewOpen] = useState(false);

  const { data: apiStaff, isLoading } = useQuery<ApiStaff[]>({
    queryKey: ["bff-staff"],
    queryFn: () => fetch("/api/bff/staff").then((r) => r.json()),
  });

  useEffect(() => {
    if (apiStaff) setStaff(apiStaff.map(toUiMember));
  }, [apiStaff]);
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null);

  const onDuty      = staff.filter((s) => s.status === "on_duty").length;
  const doctors     = staff.filter((s) => s.role === "doctor").length;
  const nurses      = staff.filter((s) => s.role === "nurse").length;
  const totalAppts  = staff.filter((s) => s.status === "on_duty").reduce((sum, s) => sum + s.appointmentsToday, 0);

  function addStaff(form: typeof BLANK_FORM) {
    const color = COLORS[staff.length % COLORS.length];
    const newMember: StaffMember = {
      id: `s${Date.now()}`,
      name: form.name,
      role: form.role,
      specialty: form.specialty || undefined,
      phone: form.phone,
      email: form.email,
      shift: { start: form.shiftStart, end: form.shiftEnd, days: form.shiftDays },
      status: "off_duty",
      appointmentsToday: 0,
      initials: makeInitials(form.name),
      color,
    };
    setStaff((prev) => [...prev, newMember]);
    setNewOpen(false);
    addMessage("Success", "Colaborador adicionado com sucesso!");
  }

  function saveEdit(form: typeof BLANK_FORM) {
    if (!editingStaff) return;
    setStaff((prev) => prev.map((s) =>
      s.id === editingStaff.id
        ? { ...s, name: form.name, role: form.role, specialty: form.specialty || undefined, phone: form.phone, email: form.email, shift: { start: form.shiftStart, end: form.shiftEnd, days: form.shiftDays }, initials: makeInitials(form.name) }
        : s
    ));
    setEditingStaff(null);
    addMessage("Success", "Alterações guardadas com sucesso!");
  }

  function toFormValues(m: StaffMember): typeof BLANK_FORM {
    return { name: m.name, role: m.role, specialty: m.specialty ?? "", phone: m.phone, email: m.email, shiftStart: m.shift.start, shiftEnd: m.shift.end, shiftDays: m.shift.days };
  }

  return (
    <>
      <div className="flex flex-col gap-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-[22px] font-bold text-dim-900">Equipa & Turnos</h1>
            <p className="text-[13px] text-dim-500 mt-0.5">Gestão de colaboradores e horários</p>
          </div>
          <button
            onClick={() => setNewOpen(true)}
            className="flex items-center gap-1.5 bg-brand-700 hover:bg-brand-800 text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,.08)] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Colaborador
          </button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: Users2,      label: "Em Serviço",     value: onDuty,     sub: `de ${staff.length} total`, bg: "bg-emerald-50", cls: "text-emerald-600" },
            { icon: Stethoscope, label: "Médicos",         value: doctors,    sub: "na equipa clínica",        bg: "bg-brand-50",   cls: "text-brand-600"   },
            { icon: UserCheck,   label: "Enfermagem",      value: nurses,     sub: "incluindo técnicos",       bg: "bg-violet-50",  cls: "text-violet-600"  },
            { icon: Clock,       label: "Consultas Hoje",  value: totalAppts, sub: "equipa em serviço",        bg: "bg-amber-50",   cls: "text-amber-600"   },
          ].map((s) => (
            <div key={s.label} className={CARD}>
              <div className="px-5 py-5">
                <div className={`w-9 h-9 ${s.bg} rounded-[10px] flex items-center justify-center mb-3`}>
                  <s.icon className={s.cls} style={{ width: 18, height: 18 }} />
                </div>
                <p className="font-display font-bold text-[28px] text-dim-900 leading-none">{s.value}</p>
                <p className="text-[12px] font-semibold text-dim-700 mt-1">{s.label}</p>
                <p className="text-[11px] text-dim-400 mt-0.5">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Role overview */}
        <div className="grid grid-cols-4 gap-3">
          {(["doctor", "nurse", "receptionist", "technician"] as const).map((role) => {
            const members = staff.filter((s) => s.role === role);
            const active  = members.filter((s) => s.status === "on_duty").length;
            const meta    = ROLE_META[role];
            return (
              <div key={role} className={CARD}>
                <div className="px-4 py-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${meta.bg} ${meta.cls}`}>
                      {meta.plural}
                    </span>
                    <span className="font-mono text-[11px] text-dim-400">{members.length} total</span>
                  </div>
                  <p className="font-display font-bold text-[26px] text-dim-900 leading-none">{active}</p>
                  <p className="text-[11px] text-dim-500 mt-0.5">em serviço agora</p>
                  <div className="mt-3 flex gap-1">
                    {members.map((m) => (
                      <div key={m.id} title={m.name} className={`w-6 h-6 rounded-full ${m.color} flex items-center justify-center text-white text-[9px] font-bold ${m.status !== "on_duty" ? "opacity-30" : ""}`}>
                        {m.initials[0]}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Staff cards — on duty */}
        <div>
          <h2 className="font-display text-[14px] font-semibold text-dim-800 mb-3">Em Serviço Hoje</h2>
          <div className="grid grid-cols-3 gap-4">
            {staff.filter((s) => s.status === "on_duty").map((member) => {
              const roleMeta = ROLE_META[member.role];
              return (
                <div
                  key={member.id}
                  onClick={() => setEditingStaff(member)}
                  className={`${CARD} hover:border-brand-300 transition-colors cursor-pointer`}
                >
                  <div className="px-5 py-5">
                    <div className="flex items-start gap-3.5">
                      <div className={`w-11 h-11 rounded-full ${member.color} flex items-center justify-center text-white font-bold text-[13px] shrink-0`}>
                        {member.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-[14px] font-semibold text-dim-900 truncate">{member.name}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 ${roleMeta.bg} ${roleMeta.cls}`}>
                            {roleMeta.label}
                          </span>
                        </div>
                        {member.specialty && <p className="text-[11px] text-dim-500 mt-0.5 truncate">{member.specialty}</p>}
                        <div className="flex items-center gap-3 mt-3">
                          <div className="flex items-center gap-1 text-[11px] text-dim-500">
                            <Clock className="w-3 h-3 text-dim-400" />
                            <span className="font-mono">{member.shift.start} – {member.shift.end}</span>
                          </div>
                          {member.appointmentsToday > 0 && (
                            <div className="flex items-center gap-1 text-[11px] text-brand-600 font-semibold">
                              <span className="font-mono">{member.appointmentsToday}</span>
                              <span className="text-dim-400 font-normal">consultas</span>
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-2">
                          <a href={`tel:${member.phone}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-1 text-[11px] text-dim-500 hover:text-dim-800 transition-colors">
                            <Phone className="w-3 h-3" /> {member.phone}
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Full staff table */}
        <div className={CARD}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-dim-100">
            <h2 className="font-display text-[14px] font-semibold text-dim-900">Toda a Equipa</h2>
            <span className="font-mono text-[11px] text-dim-400">{staff.length} colaboradores</span>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Colaborador", "Função", "Horário", "Dias", "Contacto", "Consultas Hoje", "Estado", ""].map((h) => (
                  <th key={h} className="text-left text-[10px] font-bold uppercase tracking-[0.07em] text-dim-400 px-5 py-2.5 border-b border-dim-100 bg-dim-50">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && staff.length === 0 && (
                <tr><td colSpan={8} className="px-5 py-8 text-center text-[13px] text-dim-400">A carregar colaboradores...</td></tr>
              )}
              {staff.map((member) => {
                const roleMeta   = ROLE_META[member.role];
                const statusMeta = STATUS_META[member.status];
                return (
                  <tr key={member.id} className="hover:bg-dim-50 transition-colors group">
                    <td className="px-5 py-3.5 border-b border-dim-100">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${member.color} flex items-center justify-center text-white font-bold text-[11px] shrink-0`}>
                          {member.initials}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-dim-900">{member.name}</p>
                          {member.specialty && <p className="text-[11px] text-dim-400">{member.specialty}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 border-b border-dim-100">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${roleMeta.bg} ${roleMeta.cls}`}>
                        {roleMeta.label}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 border-b border-dim-100 font-mono text-[11px] text-dim-700">
                      {member.shift.start} – {member.shift.end}
                    </td>
                    <td className="px-5 py-3.5 border-b border-dim-100 text-[12px] text-dim-500">{member.shift.days}</td>
                    <td className="px-5 py-3.5 border-b border-dim-100">
                      <div className="flex flex-col gap-0.5">
                        <a href={`tel:${member.phone}`} className="flex items-center gap-1 text-[11px] text-dim-600 hover:text-brand-600 transition-colors">
                          <Phone className="w-3 h-3" /> {member.phone}
                        </a>
                        <a href={`mailto:${member.email}`} className="flex items-center gap-1 text-[11px] text-dim-400 hover:text-brand-600 transition-colors truncate max-w-[160px]">
                          <Mail className="w-3 h-3 shrink-0" /> {member.email}
                        </a>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 border-b border-dim-100">
                      {member.appointmentsToday > 0 ? (
                        <span className="font-mono text-[13px] font-bold text-dim-900">{member.appointmentsToday}</span>
                      ) : (
                        <span className="text-[12px] text-dim-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 border-b border-dim-100">
                      <div className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusMeta.cls}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                        {statusMeta.label}
                      </div>
                    </td>
                    <td className="px-5 py-3.5 border-b border-dim-100">
                      <button
                        onClick={() => setEditingStaff(member)}
                        className="flex items-center gap-0.5 text-[11px] font-semibold text-brand-600 hover:text-brand-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Editar <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* New staff modal */}
      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="Novo Colaborador" description="Adicione um novo membro à equipa" size="lg">
        <StaffForm onSave={addStaff} onCancel={() => setNewOpen(false)} submitLabel="Adicionar Colaborador" />
      </Modal>

      {/* Edit staff modal */}
      <Modal
        open={!!editingStaff}
        onClose={() => setEditingStaff(null)}
        title="Editar Colaborador"
        description={editingStaff?.name}
        size="lg"
      >
        {editingStaff && (
          <StaffForm
            initialValues={toFormValues(editingStaff)}
            onSave={saveEdit}
            onCancel={() => setEditingStaff(null)}
            submitLabel="Guardar Alterações"
          />
        )}
      </Modal>
    </>
  );
}
