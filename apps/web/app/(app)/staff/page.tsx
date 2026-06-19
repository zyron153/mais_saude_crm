import { Users2, Stethoscope, UserCheck, Clock, Phone, Mail, ChevronRight, Plus } from "lucide-react";

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

const STAFF: StaffMember[] = [
  {
    id: "s1", name: "Dra. Fátima Costa",    role: "doctor",       specialty: "Medicina Geral e Familiar",
    phone: "+238 991 0001", email: "fatima.costa@maissaudecv.com",
    shift: { start: "08:00", end: "16:00", days: "Seg – Sex" },
    status: "on_duty", appointmentsToday: 8, initials: "FC", color: "bg-brand-700",
  },
  {
    id: "s2", name: "Dr. Nuno Barros",      role: "doctor",       specialty: "Cardiologia",
    phone: "+238 991 0002", email: "nuno.barros@maissaudecv.com",
    shift: { start: "09:00", end: "17:00", days: "Seg, Qua, Sex" },
    status: "on_duty", appointmentsToday: 5, initials: "NB", color: "bg-violet-700",
  },
  {
    id: "s3", name: "Dr. Miguel Varela",    role: "doctor",       specialty: "Endocrinologia",
    phone: "+238 991 0003", email: "miguel.varela@maissaudecv.com",
    shift: { start: "10:00", end: "18:00", days: "Ter, Qui" },
    status: "off_duty", appointmentsToday: 0, initials: "MV", color: "bg-blue-700",
  },
  {
    id: "s4", name: "Enf. Sofia Lima",      role: "nurse",
    phone: "+238 991 0004", email: "sofia.lima@maissaudecv.com",
    shift: { start: "07:00", end: "15:00", days: "Seg – Sex" },
    status: "on_duty", appointmentsToday: 12, initials: "SL", color: "bg-emerald-700",
  },
  {
    id: "s5", name: "Enf. Carlos Neves",    role: "nurse",
    phone: "+238 991 0005", email: "carlos.neves@maissaudecv.com",
    shift: { start: "15:00", end: "23:00", days: "Seg – Sex" },
    status: "off_duty", appointmentsToday: 0, initials: "CN", color: "bg-teal-700",
  },
  {
    id: "s6", name: "Ana Rocha",            role: "receptionist",
    phone: "+238 991 0006", email: "ana.rocha@maissaudecv.com",
    shift: { start: "08:00", end: "16:00", days: "Seg – Sex" },
    status: "on_duty", appointmentsToday: 24, initials: "AR", color: "bg-amber-700",
  },
  {
    id: "s7", name: "Bruno Rodrigues",      role: "receptionist",
    phone: "+238 991 0007", email: "bruno.rodrigues@maissaudecv.com",
    shift: { start: "12:00", end: "20:00", days: "Seg – Sáb" },
    status: "on_duty", appointmentsToday: 8, initials: "BR", color: "bg-orange-700",
  },
  {
    id: "s8", name: "Téc. Rui Tavares",     role: "technician",   specialty: "Radiologia",
    phone: "+238 991 0008", email: "rui.tavares@maissaudecv.com",
    shift: { start: "08:00", end: "16:00", days: "Seg – Sex" },
    status: "on_leave", appointmentsToday: 0, initials: "RT", color: "bg-rose-700",
  },
];

const ROLE_META: Record<string, { label: string; plural: string; bg: string; cls: string }> = {
  doctor:       { label: "Médico",        plural: "Médicos",        bg: "bg-brand-50",  cls: "text-brand-700"   },
  nurse:        { label: "Enfermeira/o",  plural: "Enfermagem",     bg: "bg-emerald-50",cls: "text-emerald-700" },
  receptionist: { label: "Recepcionista", plural: "Recepção",       bg: "bg-amber-50",  cls: "text-amber-700"   },
  technician:   { label: "Técnico",       plural: "Técnicos",       bg: "bg-violet-50", cls: "text-violet-700"  },
};

const STATUS_META: Record<string, { label: string; cls: string; dot: string }> = {
  on_duty:  { label: "Em Serviço", cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80", dot: "bg-emerald-500" },
  off_duty: { label: "Fora",       cls: "bg-dim-100 text-dim-500",                                  dot: "bg-dim-400"     },
  on_leave: { label: "De Férias",  cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/80",      dot: "bg-amber-400"   },
};

const onDuty   = STAFF.filter((s) => s.status === "on_duty").length;
const doctors  = STAFF.filter((s) => s.role === "doctor").length;
const nurses   = STAFF.filter((s) => s.role === "nurse").length;
const totalAppts = STAFF.filter((s) => s.status === "on_duty").reduce((sum, s) => sum + s.appointmentsToday, 0);

const CARD = "bg-white rounded-[16px] border border-dim-200 shadow-[0_1px_4px_rgba(0,0,0,.08),0_0_0_1px_rgba(0,0,0,.03)] overflow-hidden";

export default function StaffPage() {
  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-bold text-dim-900">Equipa & Turnos</h1>
          <p className="text-[13px] text-dim-500 mt-0.5">Gestão de colaboradores e horários</p>
        </div>
        <button className="flex items-center gap-1.5 bg-brand-700 hover:bg-brand-800 text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,.08)] transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Novo Colaborador
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Users2,      label: "Em Serviço",         value: onDuty,      sub: `de ${STAFF.length} total`,   bg: "bg-emerald-50", cls: "text-emerald-600" },
          { icon: Stethoscope, label: "Médicos",            value: doctors,     sub: "na equipa clínica",          bg: "bg-brand-50",   cls: "text-brand-600"   },
          { icon: UserCheck,   label: "Enfermagem",         value: nurses,      sub: "incluindo técnicos",         bg: "bg-violet-50",  cls: "text-violet-600"  },
          { icon: Clock,       label: "Consultas Hoje",     value: totalAppts,  sub: "equipa em serviço",          bg: "bg-amber-50",   cls: "text-amber-600"   },
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
          const members = STAFF.filter((s) => s.role === role);
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
                    <div
                      key={m.id}
                      title={m.name}
                      className={`w-6 h-6 rounded-full ${m.color} flex items-center justify-center text-white text-[9px] font-bold ${m.status !== "on_duty" ? "opacity-30" : ""}`}
                    >
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
          {STAFF.filter((s) => s.status === "on_duty").map((member) => {
            const roleMeta = ROLE_META[member.role];
            return (
              <div key={member.id} className={`${CARD} hover:border-brand-300 transition-colors cursor-pointer`}>
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
                      {member.specialty && (
                        <p className="text-[11px] text-dim-500 mt-0.5 truncate">{member.specialty}</p>
                      )}
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
                        <a href={`tel:${member.phone}`} className="flex items-center gap-1 text-[11px] text-dim-500 hover:text-dim-800 transition-colors">
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
          <span className="font-mono text-[11px] text-dim-400">{STAFF.length} colaboradores</span>
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
            {STAFF.map((member) => {
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
                  <td className="px-5 py-3.5 border-b border-dim-100 text-[12px] text-dim-500">
                    {member.shift.days}
                  </td>
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
                    <button className="flex items-center gap-0.5 text-[11px] font-semibold text-brand-600 hover:text-brand-700 opacity-0 group-hover:opacity-100 transition-opacity">
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
  );
}
