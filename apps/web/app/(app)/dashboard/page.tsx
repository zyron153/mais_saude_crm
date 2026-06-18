import Link from "next/link";
import { Plus, ChevronLeft, ChevronRight } from "lucide-react";

/* ─── Static mock data ─────────────────────────────────────────── */

const STATS = [
  {
    label: "Consultas Hoje", value: "24", delta: "+3 vs. ontem", deltaUp: true,
    iconBg: "bg-brand-50",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <rect x="1" y="2" width="14" height="12" rx="2" stroke="#0D8080" strokeWidth="1.4" fill="none"/>
        <path d="M5 1V3M11 1V3" stroke="#0D8080" strokeWidth="1.4" strokeLinecap="round"/>
        <path d="M1 6H15" stroke="#0D8080" strokeWidth="1.4"/>
      </svg>
    ),
  },
  {
    label: "Reservas Online", value: "67%", delta: "Meta: 70%", deltaUp: true,
    iconBg: "bg-blue-50",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="#2563EB" strokeWidth="1.4" fill="none"/>
        <path d="M5.5 8L7.5 10L11 6" stroke="#2563EB" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Sem-Apresentação", value: "8%", delta: "Melhor que 12% meta", deltaUp: true,
    iconBg: "bg-red-50",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="6.5" stroke="#DC2626" strokeWidth="1.4" fill="none"/>
        <path d="M5.5 5.5L10.5 10.5M10.5 5.5L5.5 10.5" stroke="#DC2626" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "Receita Mensal", value: "482k", valueSub: "CVE", delta: "+18% vs. jun/25", deltaUp: true,
    iconBg: "bg-emerald-50",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 2V14M5 4H9.5C10.6 4 11.5 4.9 11.5 6C11.5 7.1 10.6 8 9.5 8H5M5 8H10C11.1 8 12 8.9 12 10C12 11.1 11.1 12 10 12H5" stroke="#059669" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    ),
  },
  {
    label: "WhatsApp Pendentes", value: "7", delta: "Resp. médio 4 min", deltaUp: false,
    iconBg: "bg-amber-50",
    icon: (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 1.5C4.4 1.5 1.5 4.1 1.5 7.3C1.5 8.7 2.1 10 3.1 11L2 14.5L5.8 13.4C6.5 13.6 7.2 13.8 8 13.8C11.6 13.8 14.5 11.2 14.5 8C14.5 4.8 11.6 1.5 8 1.5Z" stroke="#D97706" strokeWidth="1.4" fill="none"/>
      </svg>
    ),
  },
];

const TIMELINE = [
  { time: "08:00", dur: "30 min", name: "Maria da Silva",   init: "MS", service: "Cardiologia · ECG + Consulta",       dr: "Dr. Fonseca",  lineState: "done",    card: "green", avatar: "green", pills: [{ label: "Concluída",        cls: "bg-emerald-100 text-emerald-700" }] },
  { time: "08:30", dur: "45 min", name: "João Pereira",     init: "JP", service: "Pediatria · Consulta de Rotina",     dr: "Dra. Santos",  lineState: "done",    card: "green", avatar: "green", pills: [{ label: "Concluída",        cls: "bg-emerald-100 text-emerald-700" }] },
  { time: "09:15", dur: "30 min", name: "Ana Correia",      init: "AC", service: "Ginecologia · Ecografia Pélvica",    dr: "Dra. Mendes",  lineState: "active",  card: "teal",  avatar: "teal",  pills: [{ label: "Em Consulta",      cls: "bg-brand-100 text-brand-800"   }] },
  { time: "10:00", dur: "30 min", name: "Carlos Rodrigues", init: "CR", service: "Odontologia · Tratamento de Cárie",  dr: "Dr. Almeida",  lineState: "warn",    card: "amber", avatar: "amber", pills: [{ label: "Aguardar",         cls: "bg-amber-100 text-amber-700"   }] },
  { time: "10:30", dur: "30 min", name: "Fernanda Lima",    init: "FL", service: "Oftalmologia · Consulta de Rotina",  dr: "Dr. Costa",    lineState: "default", card: "teal",  avatar: "teal",  pills: [{ label: "Confirmada", cls: "bg-brand-100 text-brand-800" }, { label: "Online", cls: "bg-blue-100 text-blue-600" }] },
  { time: "11:00", dur: "60 min", name: "Paulo Monteiro",   init: "?",  service: "Cardiologia · Holter 24h",           dr: "Dr. Fonseca",  lineState: "cancel",  card: "red",   avatar: "gray",  pills: [{ label: "Sem-Apresentação", cls: "bg-gray-100 text-gray-600"     }] },
  { time: "14:00", dur: "30 min", name: "Isabel Sousa",     init: "IS", service: "Plano Familiar · Pediatria",         dr: "Dra. Santos",  lineState: "default", card: "gray",  avatar: "teal",  pills: [{ label: "Confirmada",       cls: "bg-brand-100 text-brand-800"   }] },
  { time: "15:30", dur: "45 min", name: "Ricardo Neves",    init: "RN", service: "Ecografia Abdominal",                dr: "Dra. Mendes",  lineState: "default", card: "teal",  avatar: "teal",  pills: [{ label: "Confirmada",       cls: "bg-brand-100 text-brand-800"   }] },
];

const CAL_DAYS = [
  { d: 1,  muted: true,  appt: false, today: false },
  { d: 2,  muted: false, appt: true,  today: false },
  { d: 3,  muted: false, appt: true,  today: false },
  { d: 4,  muted: false, appt: true,  today: false },
  { d: 5,  muted: false, appt: true,  today: false },
  { d: 6,  muted: false, appt: false, today: false },
  { d: 7,  muted: false, appt: false, today: false },
  { d: 8,  muted: false, appt: false, today: false },
  { d: 9,  muted: false, appt: true,  today: false },
  { d: 10, muted: false, appt: true,  today: false },
  { d: 11, muted: false, appt: true,  today: false },
  { d: 12, muted: false, appt: true,  today: false },
  { d: 13, muted: false, appt: false, today: false },
  { d: 14, muted: false, appt: false, today: false },
  { d: 15, muted: false, appt: false, today: false },
  { d: 16, muted: false, appt: true,  today: false },
  { d: 17, muted: false, appt: true,  today: false },
  { d: 18, muted: false, appt: true,  today: true  },
  { d: 19, muted: false, appt: true,  today: false },
  { d: 20, muted: false, appt: true,  today: false },
  { d: 21, muted: false, appt: false, today: false },
  { d: 22, muted: false, appt: false, today: false },
  { d: 23, muted: false, appt: true,  today: false },
  { d: 24, muted: false, appt: true,  today: false },
  { d: 25, muted: false, appt: true,  today: false },
  { d: 26, muted: false, appt: false, today: false },
  { d: 27, muted: false, appt: false, today: false },
  { d: 28, muted: false, appt: false, today: false },
  { d: 29, muted: false, appt: false, today: false },
  { d: 30, muted: true,  appt: false, today: false },
];

const WA_ITEMS = [
  { init: "TC", name: "Tomás Carvalho",  time: "09:41", preview: "Bom dia, queria agendar uma consulta de cardiologia…", badge: 2, unread: true,  online: true,  avatarCls: "bg-brand-500/[0.15] text-brand-600"  },
  { init: "LM", name: "Lúcia Monteiro",  time: "09:22", preview: "Os resultados do ECG já estão disponíveis?",            badge: 1, unread: true,  online: false, avatarCls: "bg-amber-500/10 text-amber-600"       },
  { init: "PF", name: "Pedro Fernandes", time: "08:55", preview: "Confirmo a consulta das 14h de hoje, obrigado!",        badge: 1, unread: true,  online: true,  avatarCls: "bg-blue-500/10 text-blue-600"         },
  { init: "RL", name: "Rosa Lopes",      time: "08:12", preview: "Que documentos preciso trazer para o plano familiar?",  badge: 0, unread: false, online: false, avatarCls: "bg-dim-100 text-dim-500"              },
  { init: "DN", name: "Daniel Neves",    time: "07:45", preview: "Bom dia, preciso remarcar a consulta de ginecologia",   badge: 0, unread: false, online: false, avatarCls: "bg-dim-100 text-dim-500"              },
];

const PATIENTS = [
  { init: "MS", name: "Maria da Silva",   id: "PAT-00241", date: "18 Jun 2026", service: "Cardiologia",        plan: { label: "Familiar",    cls: "bg-blue-100 text-blue-700"    }, status: { label: "Concluída",        cls: "bg-emerald-100 text-emerald-700" }, avatarCls: "bg-brand-100 text-brand-800"  },
  { init: "JP", name: "João Pereira",     id: "PAT-00189", date: "18 Jun 2026", service: "Pediatria",          plan: { label: "Corporativo", cls: "bg-violet-100 text-violet-700" }, status: { label: "Concluída",        cls: "bg-emerald-100 text-emerald-700" }, avatarCls: "bg-emerald-100 text-emerald-700" },
  { init: "AC", name: "Ana Correia",      id: "PAT-00302", date: "18 Jun 2026", service: "Ginecologia",        plan: { label: "Particular",  cls: "bg-dim-100 text-dim-600"      }, status: { label: "Em Consulta",      cls: "bg-brand-100 text-brand-800"    }, avatarCls: "bg-brand-100 text-brand-800"  },
  { init: "FL", name: "Fernanda Lima",    id: "PAT-00156", date: "15 Jun 2026", service: "Oftalmologia",       plan: { label: "Familiar",    cls: "bg-blue-100 text-blue-700"    }, status: { label: "Confirmada",       cls: "bg-brand-100 text-brand-800"    }, avatarCls: "bg-blue-100 text-blue-600"    },
  { init: "PM", name: "Paulo Monteiro",   id: "PAT-00078", date: "18 Jun 2026", service: "Cardiologia · Holter", plan: { label: "Particular", cls: "bg-dim-100 text-dim-600"     }, status: { label: "Sem-Apresentação", cls: "bg-dim-100 text-dim-600"        }, avatarCls: "bg-amber-100 text-amber-700"  },
];

const BILLING = [
  { name: "Maria da Silva",  service: "Cardiologia + ECG", amount: "5.200 CVE",  amountCls: "text-emerald-700", status: { label: "Pago",     cls: "bg-emerald-100 text-emerald-700" } },
  { name: "João Pereira",    service: "Pediatria",         amount: "2.500 CVE",  amountCls: "text-emerald-700", status: { label: "Pago",     cls: "bg-emerald-100 text-emerald-700" } },
  { name: "Carlos Rodrigues",service: "Odontologia",       amount: "3.800 CVE",  amountCls: "text-amber-700",   status: { label: "Pendente", cls: "bg-amber-100 text-amber-700"     } },
  { name: "Empresa Nova Vida",service: "Plano Corp. Jul",  amount: "48.000 CVE", amountCls: "text-red-700",     status: { label: "Em Atraso",cls: "bg-red-100 text-red-600"         } },
  { name: "Fernanda Lima",   service: "Oftalmologia",      amount: "2.800 CVE",  amountCls: "text-emerald-700", status: { label: "Pago",     cls: "bg-emerald-100 text-emerald-700" } },
];

const BARS = [
  { label: "Card.", pct: 75, cls: "bg-brand-500" },
  { label: "Ped.",  pct: 55, cls: "bg-brand-400" },
  { label: "Gin.",  pct: 60, cls: "bg-brand-500" },
  { label: "Oft.",  pct: 40, cls: "bg-brand-300" },
  { label: "Dent.", pct: 85, cls: "bg-brand-600" },
  { label: "Eco.",  pct: 70, cls: "bg-brand-500" },
  { label: "Dom.",  pct: 30, cls: "bg-brand-200" },
];

const HOME_VISITS = [
  { name: "António Barros", addr: "Av. Cidade de Lisboa, Praia",  status: "Em Rota",  statusCls: "text-emerald-600", iconBg: "bg-brand-50",   iconColor: "#0D8080" },
  { name: "Elvira Tavares", addr: "Palmarejo Grande, Bloco C",    status: "Agendada", statusCls: "text-amber-600",   iconBg: "bg-amber-50",   iconColor: "#D97706" },
  { name: "Hélder Brito",   addr: "Várzea, Praia Norte",         status: "Pendente", statusCls: "text-dim-400",     iconBg: "bg-dim-100",    iconColor: "#8E8EA8" },
];

/* ─── Helpers ──────────────────────────────────────────────────── */

const CARD = "bg-white rounded-[16px] border border-dim-200 shadow-[0_1px_4px_rgba(0,0,0,.08),0_0_0_1px_rgba(0,0,0,.03)] overflow-hidden";

const LINE_CLS: Record<string, string> = {
  done:    "bg-dim-200",
  active:  "bg-brand-400",
  warn:    "bg-dim-200",
  cancel:  "bg-dim-200",
  default: "bg-dim-200",
};
const DOT_CLS: Record<string, string> = {
  done:    "bg-emerald-500",
  active:  "bg-brand-400",
  warn:    "bg-amber-500",
  cancel:  "bg-red-400",
  default: "bg-dim-300",
};
const CARD_CLS: Record<string, string> = {
  green: "bg-emerald-50/50",
  teal:  "bg-brand-50",
  amber: "bg-amber-50",
  red:   "bg-red-50",
  gray:  "bg-dim-50",
};
const AVATAR_CLS: Record<string, string> = {
  teal:  "bg-brand-200 text-brand-800",
  green: "bg-emerald-100 text-emerald-700",
  amber: "bg-amber-100 text-amber-700",
  gray:  "bg-dim-100 text-dim-500",
};

/* ─── Page ─────────────────────────────────────────────────────── */

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-5">

      {/* ── KPI Stats ── */}
      <div className="grid grid-cols-5 gap-3.5">
        {STATS.map((s) => (
          <div key={s.label} className={`${CARD} p-[18px] flex flex-col gap-2.5 hover:shadow-[0_4px_12px_rgba(0,0,0,.08),0_0_0_1px_rgba(0,0,0,.04)] transition-shadow`}>
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.06em] text-dim-500">{s.label}</span>
              <div className={`w-8 h-8 ${s.iconBg} rounded-md flex items-center justify-center`}>{s.icon}</div>
            </div>
            <div className="font-display text-[26px] font-bold text-dim-900 leading-none">
              {s.value}
              {"valueSub" in s && s.valueSub && (
                <sub className="text-[13px] font-normal text-dim-500 ml-0.5 align-baseline">{s.valueSub}</sub>
              )}
            </div>
            <div className={`flex items-center gap-1 text-[11px] font-semibold ${s.deltaUp ? "text-emerald-500" : "text-red-500"}`}>
              {s.deltaUp
                ? <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 8V2M2 5L5 2L8 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
                : <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 2V8M2 5L5 8L8 5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
              }
              {s.delta}
            </div>
          </div>
        ))}
      </div>

      {/* ── Main Grid ── */}
      <div className="grid gap-5" style={{ gridTemplateColumns: "1fr 340px" }}>

        {/* Appointment Timeline */}
        <div className={CARD}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-dim-100">
            <div className="font-display text-[14px] font-semibold text-dim-900 flex items-center gap-2">
              <div className="w-[26px] h-[26px] bg-brand-50 rounded-md flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1.5" width="12" height="11" rx="1.5" stroke="#0D8080" strokeWidth="1.3" fill="none"/><path d="M4 0.5V2.5M10 0.5V2.5M1 5H13" stroke="#0D8080" strokeWidth="1.3" strokeLinecap="round"/></svg>
              </div>
              Agenda de Hoje — Quinta, 18 Jun
            </div>
            <div className="flex items-center gap-2">
              <button className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-dim-100 text-dim-600 hover:bg-dim-200 transition-colors">Semana</button>
              <Link href="/appointments/new" className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-brand-700 text-white hover:bg-brand-800 transition-colors">
                <Plus className="w-2.5 h-2.5" />
                Nova Consulta
              </Link>
            </div>
          </div>

          <div className="px-5 pb-4">
            {TIMELINE.map((slot) => (
              <div key={slot.time} className="flex items-stretch gap-3 py-2 border-b border-dim-100 last:border-b-0">
                {/* Time */}
                <div className="w-[46px] shrink-0 pt-0.5">
                  <strong className="font-mono text-[11px] font-medium text-dim-600 block">{slot.time}</strong>
                  <span className="font-mono text-[10px] text-dim-400">{slot.dur}</span>
                </div>

                {/* Connector line */}
                <div className={`w-0.5 ${LINE_CLS[slot.lineState]} rounded-sm shrink-0 relative`}>
                  <span className={`absolute top-1 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full ${DOT_CLS[slot.lineState]} border-2 border-white`} />
                </div>

                {/* Card */}
                <div className={`flex-1 ${CARD_CLS[slot.card]} rounded-[10px] px-3 py-2.5 flex items-center gap-2.5 border border-transparent hover:border-dim-200 hover:shadow-[0_1px_2px_rgba(0,0,0,.05)] transition-all`}>
                  <div className={`w-8 h-8 rounded-full ${AVATAR_CLS[slot.avatar]} font-semibold text-[12px] flex items-center justify-center shrink-0`}>
                    {slot.init}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-[13px] text-dim-900 truncate">{slot.name}</div>
                    <div className="text-[11px] text-dim-500 mt-0.5">{slot.service}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-mono text-[10px] text-dim-500">{slot.dr}</span>
                    {slot.pills.map((p) => (
                      <span key={p.label} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.cls}`}>{p.label}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right panel */}
        <div className="flex flex-col gap-4">

          {/* Mini Calendar */}
          <div className={CARD}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-dim-100">
              <div className="font-display text-[14px] font-semibold text-dim-900 flex items-center gap-2">
                <div className="w-[26px] h-[26px] bg-blue-50 rounded-md flex items-center justify-center">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><rect x=".5" y="1.5" width="12" height="10" rx="1.5" stroke="#2563EB" strokeWidth="1.2" fill="none"/><path d="M3 0V2M10 0V2M.5 4.5H12.5" stroke="#2563EB" strokeWidth="1.2" strokeLinecap="round"/></svg>
                </div>
                Junho 2026
              </div>
              <div className="flex gap-1">
                <button className="w-6 h-6 rounded flex items-center justify-center text-dim-400 hover:bg-dim-100 transition-colors"><ChevronLeft className="w-3 h-3" /></button>
                <button className="w-6 h-6 rounded flex items-center justify-center text-dim-400 hover:bg-dim-100 transition-colors"><ChevronRight className="w-3 h-3" /></button>
              </div>
            </div>
            <div className="px-5 py-4">
              <div className="grid grid-cols-7 gap-0.5">
                {["D","S","T","Q","Q","S","S"].map((d, i) => (
                  <div key={i} className="text-center text-[9px] font-bold text-dim-400 tracking-[0.06em] pb-1.5">{d}</div>
                ))}
                {CAL_DAYS.map(({ d, muted, appt, today }) => (
                  <div
                    key={d}
                    className={`aspect-square flex items-center justify-center font-mono text-[11px] rounded relative cursor-pointer transition-colors ${
                      today   ? "bg-brand-700 text-white font-bold"
                      : muted ? "text-dim-300"
                      :         "text-dim-700 hover:bg-dim-100"
                    }`}
                  >
                    {d}
                    {appt && (
                      <span className={`absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full ${today ? "bg-brand-200" : "bg-brand-400"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* WhatsApp Inbox */}
          <div className={CARD}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-dim-100">
              <div className="font-display text-[14px] font-semibold text-dim-900 flex items-center gap-2">
                <div className="w-[26px] h-[26px] bg-emerald-500/10 rounded-md flex items-center justify-center">
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none"><path d="M6.5 1C3.7 1 1.5 3 1.5 5.5C1.5 6.5 1.9 7.4 2.5 8.1L1.5 11L4.7 10.1C5.2 10.3 5.8 10.4 6.5 10.4C9.3 10.4 11.5 8.4 11.5 5.9C11.5 3.4 9.3 1 6.5 1Z" stroke="#059669" strokeWidth="1.2" fill="none"/></svg>
                </div>
                Caixa WhatsApp
              </div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-[10px] text-dim-500">7 pendentes</span>
                <button className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-brand-700 text-white hover:bg-brand-800 transition-colors">Ver Todos</button>
              </div>
            </div>
            {WA_ITEMS.map((wa) => (
              <div key={wa.name} className={`flex items-start gap-2.5 px-5 py-3 border-b border-dim-100 last:border-b-0 cursor-pointer hover:bg-dim-50 transition-colors ${wa.unread ? "bg-brand-50" : ""}`}>
                <div className={`w-9 h-9 rounded-full flex items-center justify-center font-semibold text-[13px] shrink-0 relative ${wa.avatarCls}`}>
                  {wa.init}
                  {wa.online && (
                    <span className="absolute bottom-0 right-0 w-[9px] h-[9px] bg-emerald-500 border-2 border-white rounded-full" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="font-semibold text-[12px] text-dim-900">{wa.name}</span>
                    <span className="font-mono text-[10px] text-dim-400">{wa.time}</span>
                  </div>
                  <p className="text-[11px] text-dim-500 truncate">{wa.preview}</p>
                </div>
                {wa.badge > 0 && (
                  <div className="w-4 h-4 bg-brand-600 text-white font-mono text-[9px] font-bold rounded-full flex items-center justify-center shrink-0 mt-0.5">{wa.badge}</div>
                )}
              </div>
            ))}
          </div>

        </div>
      </div>

      {/* ── Recent Patients ── */}
      <div className={CARD}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-dim-100">
          <div className="font-display text-[14px] font-semibold text-dim-900 flex items-center gap-2">
            <div className="w-[26px] h-[26px] bg-dim-100 rounded-md flex items-center justify-center">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="5" r="3" stroke="#4A4A6A" strokeWidth="1.3"/><path d="M1.5 13C1.5 10.5 4 8.5 7 8.5C10 8.5 12.5 10.5 12.5 13" stroke="#4A4A6A" strokeWidth="1.3" strokeLinecap="round"/></svg>
            </div>
            Pacientes Recentes
          </div>
          <div className="flex items-center gap-2">
            <button className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-dim-100 text-dim-600 hover:bg-dim-200 transition-colors">Filtros</button>
            <Link href="/patients/new" className="flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-brand-700 text-white hover:bg-brand-800 transition-colors">
              <Plus className="w-2.5 h-2.5" />
              Novo Paciente
            </Link>
          </div>
        </div>
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Paciente", "ID", "Última Consulta", "Serviço", "Plano", "Estado"].map((h) => (
                <th key={h} className="text-left text-[10px] font-bold uppercase tracking-[0.07em] text-dim-400 px-5 py-2 border-b border-dim-100 bg-dim-50">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PATIENTS.map((p) => (
              <tr key={p.id} className="hover:bg-dim-50 transition-colors">
                <td className="px-5 py-2.5 border-b border-dim-100">
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center font-semibold text-[10px] ${p.avatarCls}`}>{p.init}</div>
                    <span className="text-[12px] text-dim-900 font-medium">{p.name}</span>
                  </div>
                </td>
                <td className="px-5 py-2.5 border-b border-dim-100 font-mono text-[10px] text-dim-400">{p.id}</td>
                <td className="px-5 py-2.5 border-b border-dim-100 font-mono text-[11px] text-dim-500">{p.date}</td>
                <td className="px-5 py-2.5 border-b border-dim-100 text-[12px] text-dim-700">{p.service}</td>
                <td className="px-5 py-2.5 border-b border-dim-100">
                  <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-[0.04em] ${p.plan.cls}`}>{p.plan.label}</span>
                </td>
                <td className="px-5 py-2.5 border-b border-dim-100">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${p.status.cls}`}>{p.status.label}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Bottom Grid ── */}
      <div className="grid grid-cols-3 gap-5">

        {/* Billing */}
        <div className={CARD}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-dim-100">
            <div className="font-display text-[14px] font-semibold text-dim-900 flex items-center gap-2">
              <div className="w-[26px] h-[26px] bg-emerald-50 rounded-md flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 1V13M4.5 3H8.5C9.3 3 10 3.7 10 4.5C10 5.3 9.3 6 8.5 6H4.5M4.5 6H9C9.8 6 10.5 6.7 10.5 7.5C10.5 8.3 9.8 9 9 9H4.5" stroke="#059669" strokeWidth="1.3" strokeLinecap="round"/></svg>
              </div>
              Faturação — Jun 2026
            </div>
            <button className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-dim-100 text-dim-600 hover:bg-dim-200 transition-colors">Ver Tudo</button>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Paciente", "Serviço", "Valor", "Estado"].map((h, i) => (
                  <th key={h} className={`text-[10px] font-bold uppercase tracking-[0.07em] text-dim-400 px-4 py-2 border-b border-dim-100 bg-dim-50 ${i === 2 ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {BILLING.map((b) => (
                <tr key={b.name} className="hover:bg-dim-50 transition-colors">
                  <td className="px-4 py-2.5 border-b border-dim-100 text-[12px] text-dim-900">{b.name}</td>
                  <td className="px-4 py-2.5 border-b border-dim-100 text-[12px] text-dim-500">{b.service}</td>
                  <td className={`px-4 py-2.5 border-b border-dim-100 font-mono text-[12px] font-semibold text-right ${b.amountCls}`}>{b.amount}</td>
                  <td className="px-4 py-2.5 border-b border-dim-100">
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${b.status.cls}`}>{b.status.label}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Revenue bar chart */}
        <div className={CARD}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-dim-100">
            <div className="font-display text-[14px] font-semibold text-dim-900 flex items-center gap-2">
              <div className="w-[26px] h-[26px] bg-brand-50 rounded-md flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1.5 11L4.5 7.5L7 9.5L10 5L12.5 7" stroke="#0D8080" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/><rect x=".5" y=".5" width="13" height="13" rx="1.5" stroke="#E8E8F0" strokeWidth="1" fill="none"/></svg>
              </div>
              Consultas por Serviço
            </div>
          </div>
          <div className="px-5 py-4">
            <div className="flex items-end gap-1.5 h-20">
              {BARS.map((b) => (
                <div key={b.label} className="flex-1 flex flex-col items-center gap-1 h-full justify-end">
                  <div className={`w-full ${b.cls} rounded-t hover:opacity-80 transition-opacity`} style={{ height: `${b.pct}%`, minHeight: 4 }} />
                  <span className="font-mono text-[9px] text-dim-400">{b.label}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="px-5 pb-4 pt-1 border-t border-dim-100">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] text-dim-500">Taxa de Ocupação</span>
              <span className="font-mono text-[12px] font-semibold text-brand-700">78%</span>
            </div>
            <div className="h-1.5 bg-dim-100 rounded-full">
              <div className="h-full bg-brand-500 rounded-full" style={{ width: "78%" }} />
            </div>
          </div>
        </div>

        {/* Home visits + donut */}
        <div className={CARD}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-dim-100">
            <div className="font-display text-[14px] font-semibold text-dim-900 flex items-center gap-2">
              <div className="w-[26px] h-[26px] bg-amber-50 rounded-md flex items-center justify-center">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M2 5.5L7 1.5L12 5.5V12.5H9V9H5V12.5H2V5.5Z" stroke="#D97706" strokeWidth="1.3" fill="none"/></svg>
              </div>
              Visitas Domiciliárias
            </div>
            <button className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-brand-700 text-white hover:bg-brand-800 transition-colors">Nova Visita</button>
          </div>

          {HOME_VISITS.map((hv) => (
            <div key={hv.name} className="flex items-center gap-2.5 px-5 py-2.5 border-b border-dim-100">
              <div className={`w-[30px] h-[30px] ${hv.iconBg} rounded-md flex items-center justify-center shrink-0`}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="5" r="2.5" stroke={hv.iconColor} strokeWidth="1.2"/>
                  <path d="M7 8C4.5 8 2.5 9.3 2.5 11" stroke={hv.iconColor} strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-[12px] text-dim-800">{hv.name}</div>
                <div className="text-[10px] text-dim-400 truncate">{hv.addr}</div>
              </div>
              <span className={`text-[10px] font-semibold ${hv.statusCls}`}>{hv.status}</span>
            </div>
          ))}

          {/* Donut — Planos Ativos */}
          <div className="border-t border-dim-100">
            <div className="px-5 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-dim-500">Planos Ativos</div>
            <div className="flex items-center gap-4 px-5 py-3">
              <svg width="72" height="72" viewBox="0 0 72 72">
                <circle cx="36" cy="36" r="26" fill="none" stroke="#E8E8F0" strokeWidth="14"/>
                <circle cx="36" cy="36" r="26" fill="none" stroke="#13A3A3" strokeWidth="14" strokeDasharray="57.2 106.1" strokeDashoffset="0" transform="rotate(-90 36 36)"/>
                <circle cx="36" cy="36" r="26" fill="none" stroke="#7C3AED" strokeWidth="14" strokeDasharray="73.5 89.8" strokeDashoffset="-57.2" transform="rotate(-90 36 36)"/>
                <circle cx="36" cy="36" r="26" fill="none" stroke="#D1D1E0" strokeWidth="14" strokeDasharray="32.7 130.6" strokeDashoffset="-130.7" transform="rotate(-90 36 36)"/>
                <text x="36" y="39" textAnchor="middle" fontFamily="var(--font-ibm-mono, monospace)" fontSize="11" fontWeight="700" fill="#2D2D44">187</text>
              </svg>
              <div className="flex-1 space-y-1.5">
                {[
                  { dot: "bg-brand-500",      label: "Familiar",     pct: "45%" },
                  { dot: "bg-violet-600",     label: "Corporativo",  pct: "35%" },
                  { dot: "bg-dim-300",        label: "Particular",   pct: "20%" },
                ].map((l) => (
                  <div key={l.label} className="flex items-center gap-1.5">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${l.dot}`} />
                    <span className="text-[11px] text-dim-700 flex-1">{l.label}</span>
                    <span className="font-mono text-[11px] font-bold text-dim-800">{l.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
