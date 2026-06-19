import { Home, Clock, CheckCircle, XCircle, MapPin, User, Plus, ChevronRight, AlertTriangle } from "lucide-react";

type Visit = {
  id: string;
  ref: string;
  patient: string;
  address: string;
  zone: string;
  type: "routine" | "post_op" | "follow_up" | "urgent";
  assignedTo: string;
  assignedInitials: string;
  assignedColor: string;
  scheduledAt: string;
  duration: number;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  priority: "normal" | "high";
};

const VISITS: Visit[] = [
  { id: "v1",  ref: "VD-2406-001", patient: "Rosa Mendes",      address: "Rua da Achada, n.º 12",       zone: "São Vicente",  type: "routine",   assignedTo: "Enf. Sofia Lima",   assignedInitials: "SL", assignedColor: "bg-emerald-700", scheduledAt: "2026-06-19T09:00", duration: 45, status: "completed",  priority: "normal" },
  { id: "v2",  ref: "VD-2406-002", patient: "Manuel Faria",     address: "Bairro de Achada Grande, 5",  zone: "Praia",        type: "post_op",   assignedTo: "Enf. Carlos Neves", assignedInitials: "CN", assignedColor: "bg-teal-700",    scheduledAt: "2026-06-19T10:30", duration: 60, status: "completed",  priority: "high"   },
  { id: "v3",  ref: "VD-2406-003", patient: "Filomena Costa",   address: "Achada Santo António, 18",    zone: "Praia",        type: "follow_up", assignedTo: "Enf. Sofia Lima",   assignedInitials: "SL", assignedColor: "bg-emerald-700", scheduledAt: "2026-06-19T13:00", duration: 30, status: "in_progress",priority: "normal" },
  { id: "v4",  ref: "VD-2406-004", patient: "João Barbosa",     address: "Plateau, Rua de Lisboa, 3",   zone: "Praia",        type: "urgent",    assignedTo: "Dr. Nuno Barros",   assignedInitials: "NB", assignedColor: "bg-violet-700",  scheduledAt: "2026-06-19T14:00", duration: 45, status: "scheduled",  priority: "high"   },
  { id: "v5",  ref: "VD-2406-005", patient: "Graça Monteiro",   address: "Vila Nova, Rua dos Flores",   zone: "São Filipe",   type: "routine",   assignedTo: "Enf. Carlos Neves", assignedInitials: "CN", assignedColor: "bg-teal-700",    scheduledAt: "2026-06-19T15:30", duration: 30, status: "scheduled",  priority: "normal" },
  { id: "v6",  ref: "VD-2406-006", patient: "António Neves",    address: "Mindelo Centro, n.º 44",      zone: "São Vicente",  type: "follow_up", assignedTo: "Enf. Sofia Lima",   assignedInitials: "SL", assignedColor: "bg-emerald-700", scheduledAt: "2026-06-18T10:00", duration: 30, status: "completed",  priority: "normal" },
  { id: "v7",  ref: "VD-2406-007", patient: "Maria Vera Cruz",  address: "Palmarejo, Bloco C, Apt. 4",  zone: "Praia",        type: "post_op",   assignedTo: "Dr. Nuno Barros",   assignedInitials: "NB", assignedColor: "bg-violet-700",  scheduledAt: "2026-06-18T14:00", duration: 60, status: "completed",  priority: "high"   },
  { id: "v8",  ref: "VD-2406-008", patient: "César Lima",       address: "Tira Chapéu, Rua Central",    zone: "Praia",        type: "routine",   assignedTo: "Enf. Carlos Neves", assignedInitials: "CN", assignedColor: "bg-teal-700",    scheduledAt: "2026-06-18T16:00", duration: 30, status: "cancelled",  priority: "normal" },
  { id: "v9",  ref: "VD-2406-009", patient: "Isabel Rodrigues", address: "Espargos, Rua da Paz, 7",     zone: "Sal",          type: "urgent",    assignedTo: "Enf. Sofia Lima",   assignedInitials: "SL", assignedColor: "bg-emerald-700", scheduledAt: "2026-06-17T09:30", duration: 45, status: "completed",  priority: "high"   },
  { id: "v10", ref: "VD-2406-010", patient: "Paulo Ferreira",   address: "Cidade da Praia, Zona Alta",  zone: "Praia",        type: "follow_up", assignedTo: "Dr. Nuno Barros",   assignedInitials: "NB", assignedColor: "bg-violet-700",  scheduledAt: "2026-06-17T11:00", duration: 30, status: "completed",  priority: "normal" },
];

const TYPE_META: Record<string, { label: string; bg: string; cls: string }> = {
  routine:   { label: "Rotina",           bg: "bg-dim-100",    cls: "text-dim-600"    },
  post_op:   { label: "Pós-Operatório",   bg: "bg-violet-50",  cls: "text-violet-700" },
  follow_up: { label: "Seguimento",       bg: "bg-brand-50",   cls: "text-brand-700"  },
  urgent:    { label: "Urgente",          bg: "bg-red-50",     cls: "text-red-600"    },
};

const STATUS_META: Record<string, { label: string; cls: string; dot: string }> = {
  scheduled:   { label: "Agendada",    cls: "bg-brand-50 text-brand-700 ring-1 ring-brand-200/80",   dot: "bg-brand-500"   },
  in_progress: { label: "Em Curso",    cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/80",   dot: "bg-amber-500 animate-pulse" },
  completed:   { label: "Concluída",   cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80", dot: "bg-emerald-500" },
  cancelled:   { label: "Cancelada",   cls: "bg-dim-100 text-dim-400",                               dot: "bg-dim-300"     },
};

const todayRef   = "2026-06-19";
const todayVisits = VISITS.filter((v) => v.scheduledAt.startsWith(todayRef));
const scheduled   = todayVisits.filter((v) => v.status === "scheduled").length;
const inProgress  = todayVisits.filter((v) => v.status === "in_progress").length;
const completed   = todayVisits.filter((v) => v.status === "completed").length;

const CARD = "bg-white rounded-[16px] border border-dim-200 shadow-[0_1px_4px_rgba(0,0,0,.08),0_0_0_1px_rgba(0,0,0,.03)] overflow-hidden";

export default function VisitsPage() {
  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-bold text-dim-900">Visitas Domiciliárias</h1>
          <p className="text-[13px] text-dim-500 mt-0.5">Gestão de visitas e cuidados ao domicílio</p>
        </div>
        <button className="flex items-center gap-1.5 bg-brand-700 hover:bg-brand-800 text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,.08)] transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Nova Visita
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Home,        label: "Visitas Hoje",    value: todayVisits.length, sub: "total agendadas",    bg: "bg-dim-100",    cls: "text-dim-600"     },
          { icon: Clock,       label: "Agendadas",       value: scheduled,          sub: "a realizar hoje",    bg: "bg-brand-50",   cls: "text-brand-600"   },
          { icon: AlertTriangle, label: "Em Curso",      value: inProgress,         sub: "deslocação activa",  bg: "bg-amber-50",   cls: "text-amber-600"   },
          { icon: CheckCircle, label: "Concluídas",      value: completed,          sub: "realizadas hoje",    bg: "bg-emerald-50", cls: "text-emerald-600" },
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

      {/* Today's visits — active cards */}
      {todayVisits.filter((v) => v.status !== "completed").length > 0 && (
        <div>
          <h2 className="font-display text-[14px] font-semibold text-dim-800 mb-3">Hoje em Curso</h2>
          <div className="grid grid-cols-3 gap-4">
            {todayVisits.filter((v) => v.status !== "completed").map((v) => {
              const statusMeta = STATUS_META[v.status];
              const typeMeta   = TYPE_META[v.type];
              const time = v.scheduledAt.split("T")[1];
              return (
                <div key={v.id} className={`${CARD} ${v.priority === "high" ? "border-red-200" : ""}`}>
                  <div className="px-4 py-4">
                    {v.priority === "high" && (
                      <div className="flex items-center gap-1.5 mb-3 text-[10px] font-bold text-red-600">
                        <AlertTriangle style={{ width: 10, height: 10 }} />
                        PRIORIDADE ALTA
                      </div>
                    )}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <p className="text-[14px] font-semibold text-dim-900">{v.patient}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <MapPin style={{ width: 10, height: 10 }} className="text-dim-400" />
                          <span className="text-[11px] text-dim-500">{v.zone}</span>
                        </div>
                      </div>
                      <div className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusMeta.cls}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                        {statusMeta.label}
                      </div>
                    </div>
                    <p className="text-[11px] text-dim-500 mb-3">{v.address}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-6 h-6 rounded-full ${v.assignedColor} flex items-center justify-center text-white text-[9px] font-bold`}>
                          {v.assignedInitials}
                        </div>
                        <span className="text-[11px] text-dim-600">{v.assignedTo}</span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] font-mono text-dim-700">
                        <Clock style={{ width: 10, height: 10 }} className="text-dim-400" />
                        {time} · {v.duration}min
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-dim-100 flex items-center justify-between">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeMeta.bg} ${typeMeta.cls}`}>
                        {typeMeta.label}
                      </span>
                      <span className="font-mono text-[10px] text-dim-400">{v.ref}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* All visits table */}
      <div className={CARD}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-dim-100">
          <h2 className="font-display text-[14px] font-semibold text-dim-900">Todas as Visitas</h2>
          <span className="font-mono text-[11px] text-dim-400">{VISITS.length} registos</span>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Ref.", "Paciente", "Tipo", "Zona", "Hora", "Profissional", "Duração", "Estado", ""].map((h) => (
                <th key={h} className="text-left text-[10px] font-bold uppercase tracking-[0.07em] text-dim-400 px-5 py-2.5 border-b border-dim-100 bg-dim-50">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {VISITS.map((v) => {
              const typeMeta   = TYPE_META[v.type];
              const statusMeta = STATUS_META[v.status];
              const [datePart, timePart] = v.scheduledAt.split("T");
              const dateObj = new Date(datePart);
              const dateStr = dateObj.toLocaleDateString("pt-CV", { day: "2-digit", month: "short" });
              return (
                <tr key={v.id} className="hover:bg-dim-50 transition-colors group">
                  <td className="px-5 py-3.5 border-b border-dim-100">
                    <div className="flex items-center gap-1.5">
                      {v.priority === "high" && <AlertTriangle style={{ width: 10, height: 10 }} className="text-red-500 shrink-0" />}
                      <span className="font-mono text-[11px] font-semibold text-dim-600">{v.ref}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 border-b border-dim-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-800 font-semibold text-[10px] flex items-center justify-center shrink-0">
                        {v.patient[0]}
                      </div>
                      <span className="text-[13px] font-medium text-dim-900">{v.patient}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 border-b border-dim-100">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${typeMeta.bg} ${typeMeta.cls}`}>
                      {typeMeta.label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 border-b border-dim-100">
                    <div className="flex items-center gap-1 text-[12px] text-dim-600">
                      <MapPin style={{ width: 10, height: 10 }} className="text-dim-400 shrink-0" />
                      {v.zone}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 border-b border-dim-100 font-mono text-[11px] text-dim-600">
                    {dateStr} · {timePart}
                  </td>
                  <td className="px-5 py-3.5 border-b border-dim-100">
                    <div className="flex items-center gap-2">
                      <div className={`w-6 h-6 rounded-full ${v.assignedColor} flex items-center justify-center text-white text-[9px] font-bold shrink-0`}>
                        {v.assignedInitials}
                      </div>
                      <span className="text-[12px] text-dim-700">{v.assignedTo}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 border-b border-dim-100 font-mono text-[11px] text-dim-600">
                    {v.duration} min
                  </td>
                  <td className="px-5 py-3.5 border-b border-dim-100">
                    <div className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusMeta.cls}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${statusMeta.dot}`} />
                      {statusMeta.label}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 border-b border-dim-100">
                    <button className="flex items-center gap-0.5 text-[11px] font-semibold text-brand-600 hover:text-brand-700 opacity-0 group-hover:opacity-100 transition-opacity">
                      Ver <ChevronRight className="w-3 h-3" />
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
