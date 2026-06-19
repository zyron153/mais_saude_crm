import Link from "next/link";
import { FileSearch, Clock, CheckCircle, Upload, FlaskConical, Plus, ChevronRight } from "lucide-react";

type Exam = {
  id: string;
  ref: string;
  patient: string;
  type: string;
  category: "lab" | "image" | "ecg" | "other";
  requestedAt: string;
  requestedBy: string;
  status: "pending" | "in_lab" | "completed" | "delivered";
  urgent: boolean;
};

const EXAMS: Exam[] = [
  { id: "e1",  ref: "EX-2406-001", patient: "Maria da Graça",  type: "Hemograma Completo",          category: "lab",   requestedAt: "2026-06-18", requestedBy: "Dra. Fátima Costa",  status: "in_lab",   urgent: true  },
  { id: "e2",  ref: "EX-2406-002", patient: "João Monteiro",   type: "Raio-X Tórax",                category: "image", requestedAt: "2026-06-18", requestedBy: "Dr. Nuno Barros",    status: "completed",urgent: false },
  { id: "e3",  ref: "EX-2406-003", patient: "Ana Lopes",       type: "Glicemia em Jejum",           category: "lab",   requestedAt: "2026-06-17", requestedBy: "Dra. Fátima Costa",  status: "delivered",urgent: false },
  { id: "e4",  ref: "EX-2406-004", patient: "Carlos Évora",    type: "ECG 12 Derivações",            category: "ecg",   requestedAt: "2026-06-17", requestedBy: "Dr. Nuno Barros",    status: "pending",  urgent: true  },
  { id: "e5",  ref: "EX-2406-005", patient: "Luísa Fonseca",   type: "Ecografia Abdominal",          category: "image", requestedAt: "2026-06-16", requestedBy: "Dra. Fátima Costa",  status: "pending",  urgent: false },
  { id: "e6",  ref: "EX-2406-006", patient: "Pedro Tavares",   type: "PSA Total",                   category: "lab",   requestedAt: "2026-06-16", requestedBy: "Dr. Miguel Varela",  status: "in_lab",   urgent: false },
  { id: "e7",  ref: "EX-2406-007", patient: "Rosa Brito",      type: "Mamografia Digital",           category: "image", requestedAt: "2026-06-15", requestedBy: "Dra. Fátima Costa",  status: "completed",urgent: false },
  { id: "e8",  ref: "EX-2406-008", patient: "António Soares",  type: "Perfil Lipídico",             category: "lab",   requestedAt: "2026-06-15", requestedBy: "Dr. Miguel Varela",  status: "delivered",urgent: false },
  { id: "e9",  ref: "EX-2406-009", patient: "Carla Mendes",    type: "Hemoglobina Glicada (HbA1c)", category: "lab",   requestedAt: "2026-06-14", requestedBy: "Dra. Fátima Costa",  status: "delivered",urgent: false },
  { id: "e10", ref: "EX-2406-010", patient: "Eduardo Lima",    type: "Ecocardiograma",              category: "ecg",   requestedAt: "2026-06-14", requestedBy: "Dr. Nuno Barros",    status: "in_lab",   urgent: true  },
];

const STATUS_STYLE: Record<string, string> = {
  pending:   "bg-dim-100 text-dim-600",
  in_lab:    "bg-amber-50 text-amber-700 ring-1 ring-amber-200/80",
  completed: "bg-brand-50 text-brand-700 ring-1 ring-brand-200/80",
  delivered: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80",
};

const STATUS_LABEL: Record<string, string> = {
  pending:   "Pendente",
  in_lab:    "Em Laboratório",
  completed: "Pronto",
  delivered: "Entregue",
};

const STATUS_ICON: Record<string, typeof Clock> = {
  pending:   Clock,
  in_lab:    FlaskConical,
  completed: Upload,
  delivered: CheckCircle,
};

const CATEGORY_STYLE: Record<string, string> = {
  lab:   "bg-violet-50 text-violet-700",
  image: "bg-blue-50 text-blue-700",
  ecg:   "bg-rose-50 text-rose-700",
  other: "bg-dim-100 text-dim-500",
};

const CATEGORY_LABEL: Record<string, string> = {
  lab:   "Análise",
  image: "Imagem",
  ecg:   "Cardio",
  other: "Outro",
};

const pending   = EXAMS.filter((e) => e.status === "pending").length;
const in_lab    = EXAMS.filter((e) => e.status === "in_lab").length;
const completed = EXAMS.filter((e) => e.status === "completed").length;
const urgent    = EXAMS.filter((e) => e.urgent).length;

const CARD = "bg-white rounded-[16px] border border-dim-200 shadow-[0_1px_4px_rgba(0,0,0,.08),0_0_0_1px_rgba(0,0,0,.03)] overflow-hidden";

export default function ExamsPage() {
  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-bold text-dim-900">Exames & Resultados</h1>
          <p className="text-[13px] text-dim-500 mt-0.5">Pedidos de exames e gestão de resultados</p>
        </div>
        <button className="flex items-center gap-1.5 bg-brand-700 hover:bg-brand-800 text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,.08)] transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Novo Pedido
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Clock,        label: "Pendentes",        value: pending,   cls: "text-dim-500",     bg: "bg-dim-100"     },
          { icon: FlaskConical, label: "Em Laboratório",   value: in_lab,    cls: "text-amber-600",   bg: "bg-amber-50"    },
          { icon: CheckCircle,  label: "Prontos",          value: completed, cls: "text-brand-600",   bg: "bg-brand-50"    },
          { icon: FileSearch,   label: "Urgentes",         value: urgent,    cls: "text-red-500",     bg: "bg-red-50"      },
        ].map((s) => (
          <div key={s.label} className={CARD}>
            <div className="px-5 py-5">
              <div className={`w-9 h-9 ${s.bg} rounded-[10px] flex items-center justify-center mb-3`}>
                <s.icon className={`${s.cls}`} style={{ width: 18, height: 18 }} />
              </div>
              <p className="font-display font-bold text-[28px] text-dim-900 leading-none">{s.value}</p>
              <p className="text-[12px] font-semibold text-dim-700 mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Exams table */}
      <div className={CARD}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-dim-100">
          <h2 className="font-display text-[14px] font-semibold text-dim-900">Pedidos de Exame</h2>
          <span className="font-mono text-[11px] text-dim-400">{EXAMS.length} pedidos</span>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Referência", "Paciente", "Exame", "Tipo", "Solicitado por", "Data", "Estado", ""].map((h) => (
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
            {EXAMS.map((exam) => {
              const StatusIcon = STATUS_ICON[exam.status];
              return (
                <tr key={exam.id} className="hover:bg-dim-50 transition-colors group">
                  <td className="px-5 py-3.5 border-b border-dim-100">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold text-dim-700">{exam.ref}</span>
                      {exam.urgent && (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-red-50 text-red-600 ring-1 ring-red-200/80 uppercase tracking-wide">
                          Urgente
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 border-b border-dim-100">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-800 font-semibold text-[10px] flex items-center justify-center shrink-0">
                        {exam.patient[0]}
                      </div>
                      <span className="text-[13px] font-medium text-dim-900">{exam.patient}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 border-b border-dim-100 text-[12px] text-dim-700 font-medium">
                    {exam.type}
                  </td>
                  <td className="px-5 py-3.5 border-b border-dim-100">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${CATEGORY_STYLE[exam.category]}`}>
                      {CATEGORY_LABEL[exam.category]}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 border-b border-dim-100 text-[12px] text-dim-500">{exam.requestedBy}</td>
                  <td className="px-5 py-3.5 border-b border-dim-100 font-mono text-[11px] text-dim-500">
                    {new Date(exam.requestedAt).toLocaleDateString("pt-CV", { day: "2-digit", month: "short" })}
                  </td>
                  <td className="px-5 py-3.5 border-b border-dim-100">
                    <div className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[exam.status]}`}>
                      <StatusIcon style={{ width: 10, height: 10 }} />
                      {STATUS_LABEL[exam.status]}
                    </div>
                  </td>
                  <td className="px-5 py-3.5 border-b border-dim-100">
                    {exam.status === "completed" ? (
                      <button className="flex items-center gap-0.5 text-[11px] font-semibold text-brand-600 hover:text-brand-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Entregar <ChevronRight className="w-3 h-3" />
                      </button>
                    ) : exam.status === "pending" ? (
                      <button className="flex items-center gap-0.5 text-[11px] font-semibold text-dim-500 hover:text-dim-700 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        Enviar <ChevronRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <button className="flex items-center gap-0.5 text-[11px] font-semibold text-dim-400 hover:text-dim-600 opacity-0 group-hover:opacity-100 transition-opacity">
                        Ver <ChevronRight className="w-3 h-3" />
                      </button>
                    )}
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
