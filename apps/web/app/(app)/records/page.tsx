import { ClipboardList, FileText, Pill, Stethoscope, StickyNote, Plus, ChevronRight } from "lucide-react";

type Record = {
  id: string;
  ref: string;
  patient: string;
  type: "consultation" | "prescription" | "procedure" | "note";
  title: string;
  doctor: string;
  date: string;
  status: "signed" | "draft" | "pending_review";
};

const RECORDS: Record[] = [
  { id: "r1",  ref: "RC-2406-001", patient: "Maria da Graça",  type: "consultation",  title: "Consulta de Medicina Geral",          doctor: "Dra. Fátima Costa",  date: "2026-06-18", status: "signed"         },
  { id: "r2",  ref: "RC-2406-002", patient: "João Monteiro",   type: "prescription",  title: "Prescrição de Antibióticos",          doctor: "Dr. Nuno Barros",    date: "2026-06-18", status: "signed"         },
  { id: "r3",  ref: "RC-2406-003", patient: "Ana Lopes",       type: "procedure",     title: "Penso e Curativo — Ferida no Braço",  doctor: "Dra. Fátima Costa",  date: "2026-06-17", status: "signed"         },
  { id: "r4",  ref: "RC-2406-004", patient: "Carlos Évora",    type: "consultation",  title: "Seguimento Cardíaco",                 doctor: "Dr. Nuno Barros",    date: "2026-06-17", status: "pending_review" },
  { id: "r5",  ref: "RC-2406-005", patient: "Luísa Fonseca",   type: "note",          title: "Nota: Alergias conhecidas a penicilina", doctor: "Dra. Fátima Costa", date: "2026-06-16", status: "signed"        },
  { id: "r6",  ref: "RC-2406-006", patient: "Pedro Tavares",   type: "prescription",  title: "Anti-hipertensivos — Renovação",      doctor: "Dr. Miguel Varela",  date: "2026-06-16", status: "signed"         },
  { id: "r7",  ref: "RC-2406-007", patient: "Rosa Brito",      type: "consultation",  title: "Consulta Ginecológica",               doctor: "Dra. Fátima Costa",  date: "2026-06-15", status: "draft"          },
  { id: "r8",  ref: "RC-2406-008", patient: "António Soares",  type: "procedure",     title: "Administração de Vacina Tétano",      doctor: "Enf. Sofia Lima",    date: "2026-06-15", status: "signed"         },
  { id: "r9",  ref: "RC-2406-009", patient: "Carla Mendes",    type: "consultation",  title: "Diabetes — Controlo Trimestral",      doctor: "Dr. Miguel Varela",  date: "2026-06-14", status: "signed"         },
  { id: "r10", ref: "RC-2406-010", patient: "Eduardo Lima",    type: "note",          title: "Nota pós-consulta de Cardiologia",    doctor: "Dr. Nuno Barros",    date: "2026-06-14", status: "pending_review" },
  { id: "r11", ref: "RC-2406-011", patient: "Isabel Morais",   type: "prescription",  title: "Ansiolíticos — Primeira Prescrição",  doctor: "Dra. Fátima Costa",  date: "2026-06-13", status: "signed"         },
  { id: "r12", ref: "RC-2406-012", patient: "Manuel Costa",    type: "consultation",  title: "Triagem Inicial — Novo Paciente",     doctor: "Dr. Miguel Varela",  date: "2026-06-12", status: "signed"         },
];

const TYPE_META: Record<string, { label: string; icon: typeof FileText; bg: string; color: string }> = {
  consultation: { label: "Consulta",     icon: Stethoscope, bg: "bg-brand-50",  color: "text-brand-600"   },
  prescription: { label: "Prescrição",   icon: Pill,        bg: "bg-violet-50", color: "text-violet-600"  },
  procedure:    { label: "Procedimento", icon: FileText,    bg: "bg-amber-50",  color: "text-amber-600"   },
  note:         { label: "Nota Clínica", icon: StickyNote,  bg: "bg-dim-100",   color: "text-dim-500"     },
};

const STATUS_META: Record<string, { label: string; cls: string }> = {
  signed:         { label: "Assinado",   cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80" },
  draft:          { label: "Rascunho",   cls: "bg-dim-100 text-dim-500"                                   },
  pending_review: { label: "Em Revisão", cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/80"       },
};

const TYPE_FILTERS = [
  { key: "all",          label: "Todos"          },
  { key: "consultation", label: "Consultas"      },
  { key: "prescription", label: "Prescrições"    },
  { key: "procedure",    label: "Procedimentos"  },
  { key: "note",         label: "Notas"          },
];

const signed         = RECORDS.filter((r) => r.status === "signed").length;
const draft          = RECORDS.filter((r) => r.status === "draft").length;
const pending_review = RECORDS.filter((r) => r.status === "pending_review").length;

const CARD = "bg-white rounded-[16px] border border-dim-200 shadow-[0_1px_4px_rgba(0,0,0,.08),0_0_0_1px_rgba(0,0,0,.03)] overflow-hidden";

export default function RecordsPage() {
  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-bold text-dim-900">Registos Clínicos</h1>
          <p className="text-[13px] text-dim-500 mt-0.5">Consultas, prescrições e notas clínicas</p>
        </div>
        <button className="flex items-center gap-1.5 bg-brand-700 hover:bg-brand-800 text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,.08)] transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Novo Registo
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: ClipboardList, label: "Total Registos",   value: RECORDS.length, sub: "este mês",          bg: "bg-dim-100",    cls: "text-dim-600"     },
          { icon: FileText,      label: "Assinados",        value: signed,         sub: "registos válidos",  bg: "bg-emerald-50", cls: "text-emerald-600" },
          { icon: StickyNote,    label: "Rascunhos",        value: draft,          sub: "por completar",     bg: "bg-dim-100",    cls: "text-dim-400"     },
          { icon: ClipboardList, label: "Em Revisão",       value: pending_review, sub: "aguardam assinatura", bg: "bg-amber-50", cls: "text-amber-600"   },
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

      {/* Type overview mini cards */}
      <div className="grid grid-cols-4 gap-3">
        {(["consultation", "prescription", "procedure", "note"] as const).map((type) => {
          const count = RECORDS.filter((r) => r.type === type).length;
          const meta  = TYPE_META[type];
          const Icon  = meta.icon;
          return (
            <div key={type} className={`${CARD} cursor-pointer hover:border-brand-300 transition-colors`}>
              <div className="px-4 py-4 flex items-center gap-3">
                <div className={`w-8 h-8 rounded-[10px] ${meta.bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`${meta.color}`} style={{ width: 16, height: 16 }} />
                </div>
                <div>
                  <p className="font-mono font-bold text-[18px] text-dim-900 leading-none">{count}</p>
                  <p className="text-[11px] text-dim-500 mt-0.5">{meta.label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Records table */}
      <div className={CARD}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-dim-100">
          <h2 className="font-display text-[14px] font-semibold text-dim-900">Todos os Registos</h2>
          <div className="flex items-center gap-1.5">
            {TYPE_FILTERS.map((f) => (
              <span
                key={f.key}
                className="px-2.5 py-1 rounded-[8px] text-[11px] font-medium border border-dim-200 bg-white text-dim-500 cursor-pointer hover:text-dim-800 hover:border-dim-300 transition-colors"
              >
                {f.label}
              </span>
            ))}
          </div>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Referência", "Paciente", "Tipo", "Título", "Médico", "Data", "Estado", ""].map((h) => (
                <th
                  key={h}
                  className="text-left text-[10px] font-bold uppercase tracking-[0.07em] text-dim-400 px-5 py-2.5 border-b border-dim-100 bg-dim-50"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {RECORDS.map((rec) => {
              const typeMeta   = TYPE_META[rec.type];
              const statusMeta = STATUS_META[rec.status];
              const Icon       = typeMeta.icon;
              return (
                <tr key={rec.id} className="hover:bg-dim-50 transition-colors group">
                  <td className="px-5 py-3.5 border-b border-dim-100 font-mono text-[11px] font-semibold text-dim-600">
                    {rec.ref}
                  </td>
                  <td className="px-5 py-3.5 border-b border-dim-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-800 font-semibold text-[10px] flex items-center justify-center shrink-0">
                        {rec.patient[0]}
                      </div>
                      <span className="text-[13px] font-medium text-dim-900">{rec.patient}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 border-b border-dim-100">
                    <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold ${typeMeta.bg} ${typeMeta.color}`}>
                      <Icon style={{ width: 10, height: 10 }} />
                      {typeMeta.label}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 border-b border-dim-100 text-[12px] text-dim-700 font-medium max-w-[240px] truncate">
                    {rec.title}
                  </td>
                  <td className="px-5 py-3.5 border-b border-dim-100 text-[12px] text-dim-500">{rec.doctor}</td>
                  <td className="px-5 py-3.5 border-b border-dim-100 font-mono text-[11px] text-dim-500">
                    {new Date(rec.date).toLocaleDateString("pt-CV", { day: "2-digit", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-5 py-3.5 border-b border-dim-100">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${statusMeta.cls}`}>
                      {statusMeta.label}
                    </span>
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
