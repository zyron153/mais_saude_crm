import Link from "next/link";
import { Shield, Users, TrendingUp, AlertTriangle, Plus, ChevronRight } from "lucide-react";

type Plan = {
  id: string;
  name: string;
  insurer: string;
  type: "familiar" | "corp" | "particular";
  subscribers: number;
  coverage: number;
  renewalDate: string;
  monthlyValue: number;
  status: "active" | "expiring" | "expired";
};

const PLANS: Plan[] = [
  { id: "p1", name: "Plano Familiar Ouro",    insurer: "IMPAR",      type: "familiar",   subscribers: 48,  coverage: 85, renewalDate: "2026-12-31", monthlyValue: 4800,  status: "active"   },
  { id: "p2", name: "Corporativo Saúde Total", insurer: "BCA Saúde",  type: "corp",       subscribers: 120, coverage: 90, renewalDate: "2026-08-15", monthlyValue: 18000, status: "active"   },
  { id: "p3", name: "Plano Individual Plus",   insurer: "IMPAR",      type: "particular", subscribers: 22,  coverage: 70, renewalDate: "2026-07-01", monthlyValue: 1200,  status: "expiring" },
  { id: "p4", name: "Familiar Prata",          insurer: "Garantia",   type: "familiar",   subscribers: 35,  coverage: 75, renewalDate: "2026-11-30", monthlyValue: 3200,  status: "active"   },
  { id: "p5", name: "Empresarial Premium",     insurer: "BCA Saúde",  type: "corp",       subscribers: 80,  coverage: 95, renewalDate: "2026-07-20", monthlyValue: 14400, status: "expiring" },
  { id: "p6", name: "Particular Básico",       insurer: "Garantia",   type: "particular", subscribers: 15,  coverage: 60, renewalDate: "2026-05-31", monthlyValue: 800,   status: "expired"  },
  { id: "p7", name: "Plano Familiar Bronze",   insurer: "IMPAR",      type: "familiar",   subscribers: 28,  coverage: 65, renewalDate: "2027-01-31", monthlyValue: 2400,  status: "active"   },
  { id: "p8", name: "Corporativo Essencial",   insurer: "Garantia",   type: "corp",       subscribers: 45,  coverage: 80, renewalDate: "2026-09-30", monthlyValue: 9000,  status: "active"   },
];

const TYPE_STYLE: Record<string, string> = {
  familiar:   "bg-brand-50 text-brand-700",
  corp:       "bg-violet-50 text-violet-700",
  particular: "bg-dim-100 text-dim-600",
};

const TYPE_LABEL: Record<string, string> = {
  familiar:   "Familiar",
  corp:       "Corporativo",
  particular: "Particular",
};

const STATUS_STYLE: Record<string, string> = {
  active:   "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80",
  expiring: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/80",
  expired:  "bg-red-50 text-red-600 ring-1 ring-red-200/80",
};

const STATUS_LABEL: Record<string, string> = {
  active:   "Ativo",
  expiring: "A Renovar",
  expired:  "Expirado",
};

const totalSubscribers = PLANS.reduce((s, p) => s + p.subscribers, 0);
const totalRevenue     = PLANS.filter(p => p.status !== "expired").reduce((s, p) => s + p.monthlyValue, 0);
const expiring         = PLANS.filter((p) => p.status === "expiring").length;
const active           = PLANS.filter((p) => p.status === "active").length;

const CARD = "bg-white rounded-[16px] border border-dim-200 shadow-[0_1px_4px_rgba(0,0,0,.08),0_0_0_1px_rgba(0,0,0,.03)] overflow-hidden";

export default function HealthPlansPage() {
  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-bold text-dim-900">Planos de Saúde</h1>
          <p className="text-[13px] text-dim-500 mt-0.5">Gestão de planos e seguradoras</p>
        </div>
        <button className="flex items-center gap-1.5 bg-brand-700 hover:bg-brand-800 text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,.08)] transition-colors">
          <Plus className="w-3.5 h-3.5" />
          Novo Plano
        </button>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Shield,        label: "Planos Ativos",     value: active,                          sub: `de ${PLANS.length} total`,           cls: "text-brand-600", bg: "bg-brand-50"   },
          { icon: Users,         label: "Subscritores",      value: totalSubscribers,                sub: "pacientes cobertos",                  cls: "text-violet-600", bg: "bg-violet-50"  },
          { icon: TrendingUp,    label: "Receita Mensal",    value: `${totalRevenue.toLocaleString("pt-CV")} CVE`, sub: "planos ativos + renovar",cls: "text-emerald-600", bg: "bg-emerald-50" },
          { icon: AlertTriangle, label: "A Renovar",         value: expiring,                        sub: "nos próximos 60 dias",                cls: "text-amber-600", bg: "bg-amber-50"   },
        ].map((s) => (
          <div key={s.label} className={CARD}>
            <div className="px-5 py-5">
              <div className={`w-9 h-9 ${s.bg} rounded-[10px] flex items-center justify-center mb-3`}>
                <s.icon className={`w-4.5 h-4.5 ${s.cls}`} style={{ width: 18, height: 18 }} />
              </div>
              <p className="font-display font-bold text-[22px] text-dim-900 leading-none">{s.value}</p>
              <p className="text-[12px] font-semibold text-dim-700 mt-1">{s.label}</p>
              <p className="text-[11px] text-dim-400 mt-0.5">{s.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Plans by type overview */}
      <div className="grid grid-cols-3 gap-4">
        {(["familiar", "corp", "particular"] as const).map((type) => {
          const typePlans = PLANS.filter((p) => p.type === type);
          const typeSubs  = typePlans.reduce((s, p) => s + p.subscribers, 0);
          return (
            <div key={type} className={CARD}>
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full ${TYPE_STYLE[type]}`}>
                    {TYPE_LABEL[type]}
                  </span>
                  <span className="font-mono text-[11px] text-dim-400">{typePlans.length} planos</span>
                </div>
                <p className="font-display font-bold text-[28px] text-dim-900 leading-none">{typeSubs}</p>
                <p className="text-[12px] text-dim-500 mt-0.5">subscritores ativos</p>
                <div className="mt-3 h-1.5 bg-dim-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${(typeSubs / totalSubscribers) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-dim-400 mt-1 font-mono">
                  {Math.round((typeSubs / totalSubscribers) * 100)}% do total
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Plans table */}
      <div className={CARD}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-dim-100">
          <h2 className="font-display text-[14px] font-semibold text-dim-900">Todos os Planos</h2>
          <span className="font-mono text-[11px] text-dim-400">{PLANS.length} planos</span>
        </div>

        <table className="w-full border-collapse">
          <thead>
            <tr>
              {["Plano", "Seguradora", "Tipo", "Subscritores", "Cobertura", "Renovação", "Valor/mês", "Estado", ""].map((h) => (
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
            {PLANS.map((plan) => (
              <tr key={plan.id} className="hover:bg-dim-50 transition-colors group">
                <td className="px-5 py-3.5 border-b border-dim-100">
                  <span className="text-[13px] font-semibold text-dim-900">{plan.name}</span>
                </td>
                <td className="px-5 py-3.5 border-b border-dim-100 text-[12px] text-dim-600">{plan.insurer}</td>
                <td className="px-5 py-3.5 border-b border-dim-100">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${TYPE_STYLE[plan.type]}`}>
                    {TYPE_LABEL[plan.type]}
                  </span>
                </td>
                <td className="px-5 py-3.5 border-b border-dim-100">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[13px] font-semibold text-dim-900">{plan.subscribers}</span>
                    <div className="w-16 h-1 bg-dim-100 rounded-full overflow-hidden">
                      <div className="h-full bg-brand-400 rounded-full" style={{ width: `${(plan.subscribers / 120) * 100}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5 border-b border-dim-100">
                  <div className="flex items-center gap-1.5">
                    <div className="w-16 h-1 bg-dim-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full ${plan.coverage >= 85 ? "bg-emerald-400" : plan.coverage >= 70 ? "bg-brand-400" : "bg-amber-400"}`}
                        style={{ width: `${plan.coverage}%` }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-dim-600">{plan.coverage}%</span>
                  </div>
                </td>
                <td className="px-5 py-3.5 border-b border-dim-100 font-mono text-[11px] text-dim-600">
                  {new Date(plan.renewalDate).toLocaleDateString("pt-CV", { day: "2-digit", month: "short", year: "numeric" })}
                </td>
                <td className="px-5 py-3.5 border-b border-dim-100 font-mono text-[12px] font-semibold text-dim-900">
                  {plan.monthlyValue.toLocaleString("pt-CV")} <span className="text-[10px] font-normal text-dim-400">CVE</span>
                </td>
                <td className="px-5 py-3.5 border-b border-dim-100">
                  <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_STYLE[plan.status]}`}>
                    {STATUS_LABEL[plan.status]}
                  </span>
                </td>
                <td className="px-5 py-3.5 border-b border-dim-100">
                  <button className="flex items-center gap-0.5 text-[11px] font-semibold text-brand-600 hover:text-brand-700 opacity-0 group-hover:opacity-100 transition-opacity">
                    Gerir <ChevronRight className="w-3 h-3" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
