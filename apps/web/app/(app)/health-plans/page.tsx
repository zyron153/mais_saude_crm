"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Shield, Users, TrendingUp, AlertTriangle, Plus, ChevronRight } from "lucide-react";
import { Modal } from "@/components/ui/modal";

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

type ApiProduct = {
  id: string;
  name: string;
  monthlyFee: number;
  active: boolean;
  company: { id: string; name: string } | null;
  coverageRules: { type?: string; coverage?: number } | null;
};

function toUiPlan(p: ApiProduct): Plan {
  const rules = p.coverageRules;
  return {
    id: p.id,
    name: p.name,
    insurer: p.company?.name ?? "—",
    type: (rules?.type ?? "particular") as Plan["type"],
    subscribers: 0,
    coverage: rules?.coverage ?? 0,
    renewalDate: "",
    monthlyValue: Number(p.monthlyFee),
    status: p.active ? "active" : "expired",
  };
}

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

const inputCls = "w-full border border-dim-200 rounded-[10px] px-3.5 py-2.5 text-[13px] text-dim-900 placeholder:text-dim-400 bg-white focus:outline-none focus:border-brand-500 focus:shadow-[0_0_0_3px_rgba(19,163,163,.12)] transition-all shadow-[0_1px_2px_rgba(0,0,0,.05)] hover:border-dim-300 font-sans";

const CARD = "bg-white rounded-[16px] border border-dim-200 shadow-[0_1px_4px_rgba(0,0,0,.08),0_0_0_1px_rgba(0,0,0,.03)] overflow-hidden";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[12px] font-semibold text-dim-700">{label}</label>
      {children}
    </div>
  );
}

export default function HealthPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [newOpen, setNewOpen] = useState(false);

  const { data: apiProducts, isLoading } = useQuery<ApiProduct[]>({
    queryKey: ["health-plan-products"],
    queryFn: () => fetch("/api/health-plans/products?activeOnly=false").then((r) => r.json()),
  });

  useEffect(() => {
    if (apiProducts) setPlans(apiProducts.map(toUiPlan));
  }, [apiProducts]);
  const [managingPlan, setManagingPlan] = useState<Plan | null>(null);
  const [form, setForm] = useState({
    name: "", insurer: "", type: "familiar", coverage: "80", renewalDate: "", monthlyValue: "",
  });

  function set(k: string, v: string) { setForm(f => ({ ...f, [k]: v })); }

  function addPlan() {
    if (!form.name.trim() || !form.insurer.trim() || !form.renewalDate) return;
    const n = plans.length + 1;
    setPlans(ps => [{
      id: `p${n}`,
      name: form.name.trim(),
      insurer: form.insurer.trim(),
      type: form.type as Plan["type"],
      subscribers: 0,
      coverage: Number(form.coverage) || 80,
      renewalDate: form.renewalDate,
      monthlyValue: Number(form.monthlyValue) || 0,
      status: "active",
    }, ...ps]);
    setForm({ name: "", insurer: "", type: "familiar", coverage: "80", renewalDate: "", monthlyValue: "" });
    setNewOpen(false);
  }

  function renewPlan(id: string) {
    setPlans(ps => ps.map(p => p.id === id ? { ...p, status: "active" } : p));
    setManagingPlan(mp => mp && mp.id === id ? { ...mp, status: "active" } : mp);
  }

  const totalSubscribers = plans.reduce((s, p) => s + p.subscribers, 0);
  const totalRevenue     = plans.filter(p => p.status !== "expired").reduce((s, p) => s + p.monthlyValue, 0);
  const expiring         = plans.filter((p) => p.status === "expiring").length;
  const active           = plans.filter((p) => p.status === "active").length;

  return (
    <>
      <div className="flex flex-col gap-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-[22px] font-bold text-dim-900">Planos de Saúde</h1>
            <p className="text-[13px] text-dim-500 mt-0.5">Gestão de planos e seguradoras</p>
          </div>
          <button
            onClick={() => setNewOpen(true)}
            className="flex items-center gap-1.5 bg-brand-700 hover:bg-brand-800 text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,.08)] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Novo Plano
          </button>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { icon: Shield,        label: "Planos Ativos",  value: active,                                          sub: `de ${plans.length} total`,          cls: "text-brand-600",   bg: "bg-brand-50"   },
            { icon: Users,         label: "Subscritores",   value: totalSubscribers,                                sub: "pacientes cobertos",                 cls: "text-violet-600",  bg: "bg-violet-50"  },
            { icon: TrendingUp,    label: "Receita Mensal", value: `${totalRevenue.toLocaleString("pt-CV")} CVE`,   sub: "planos ativos + renovar",            cls: "text-emerald-600", bg: "bg-emerald-50" },
            { icon: AlertTriangle, label: "A Renovar",      value: expiring,                                        sub: "nos próximos 60 dias",               cls: "text-amber-600",   bg: "bg-amber-50"   },
          ].map((s) => (
            <div key={s.label} className={CARD}>
              <div className="px-5 py-5">
                <div className={`w-9 h-9 ${s.bg} rounded-[10px] flex items-center justify-center mb-3`}>
                  <s.icon className={s.cls} style={{ width: 18, height: 18 }} />
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
            const typePlans = plans.filter((p) => p.type === type);
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
                      style={{ width: `${totalSubscribers > 0 ? (typeSubs / totalSubscribers) * 100 : 0}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-dim-400 mt-1 font-mono">
                    {totalSubscribers > 0 ? Math.round((typeSubs / totalSubscribers) * 100) : 0}% do total
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
            <span className="font-mono text-[11px] text-dim-400">{plans.length} planos</span>
          </div>

          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Plano", "Seguradora", "Tipo", "Subscritores", "Cobertura", "Renovação", "Valor/mês", "Estado", ""].map((h) => (
                  <th key={h} className="text-left text-[10px] font-bold uppercase tracking-[0.07em] text-dim-400 px-5 py-2.5 border-b border-dim-100 bg-dim-50">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading && plans.length === 0 && (
                <tr><td colSpan={9} className="px-5 py-8 text-center text-[13px] text-dim-400">A carregar planos...</td></tr>
              )}
              {plans.map((plan) => (
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
                    {plan.renewalDate ? new Date(plan.renewalDate).toLocaleDateString("pt-CV", { day: "2-digit", month: "short", year: "numeric" }) : "—"}
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
                    <button
                      onClick={() => setManagingPlan(plan)}
                      className="flex items-center gap-0.5 text-[11px] font-semibold text-brand-600 hover:text-brand-700 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Gerir <ChevronRight className="w-3 h-3" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Plan Modal */}
      <Modal open={newOpen} onClose={() => setNewOpen(false)} title="Novo Plano de Saúde" size="md">
        <div className="px-6 py-5 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Nome do Plano *">
              <input value={form.name} onChange={e => set("name", e.target.value)} placeholder="Ex: Plano Familiar Ouro" className={inputCls} />
            </Field>
          </div>
          <Field label="Seguradora *">
            <input value={form.insurer} onChange={e => set("insurer", e.target.value)} placeholder="IMPAR, BCA Saúde…" className={inputCls} />
          </Field>
          <Field label="Tipo">
            <select value={form.type} onChange={e => set("type", e.target.value)} className={inputCls}>
              <option value="familiar">Familiar</option>
              <option value="corp">Corporativo</option>
              <option value="particular">Particular</option>
            </select>
          </Field>
          <Field label="Cobertura (%)">
            <input type="number" value={form.coverage} onChange={e => set("coverage", e.target.value)} min="0" max="100" className={inputCls} />
          </Field>
          <Field label="Data de Renovação *">
            <input type="date" value={form.renewalDate} onChange={e => set("renewalDate", e.target.value)} className={inputCls} />
          </Field>
          <div className="col-span-2">
            <Field label="Valor Mensal (CVE)">
              <input type="number" value={form.monthlyValue} onChange={e => set("monthlyValue", e.target.value)} placeholder="0" className={inputCls} />
            </Field>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-dim-100 flex items-center gap-3">
          <button
            onClick={addPlan}
            className="bg-brand-700 hover:bg-brand-800 text-white font-semibold px-5 py-2.5 rounded-[10px] text-[13px] transition-colors"
          >
            Guardar Plano
          </button>
          <button
            onClick={() => setNewOpen(false)}
            className="border border-dim-200 bg-white hover:bg-dim-50 text-dim-700 font-medium px-5 py-2.5 rounded-[10px] text-[13px] transition-colors"
          >
            Cancelar
          </button>
        </div>
      </Modal>

      {/* Manage Plan Modal */}
      <Modal open={!!managingPlan} onClose={() => setManagingPlan(null)} title={managingPlan?.name ?? ""} description={managingPlan ? `${managingPlan.insurer} · ${TYPE_LABEL[managingPlan.type]}` : undefined} size="md">
        {managingPlan && (
          <>
            <div className="px-6 py-5">
              <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
                {([
                  ["Estado",       STATUS_LABEL[managingPlan.status]],
                  ["Subscritores", String(managingPlan.subscribers)],
                  ["Cobertura",    `${managingPlan.coverage}%`],
                  ["Valor Mensal", `${managingPlan.monthlyValue.toLocaleString("pt-CV")} CVE`],
                  ["Renovação",    managingPlan.renewalDate ? new Date(managingPlan.renewalDate).toLocaleDateString("pt-CV", { day: "2-digit", month: "long", year: "numeric" }) : "—"],
                  ["Seguradora",   managingPlan.insurer],
                ] as [string, string][]).map(([label, value]) => (
                  <div key={label}>
                    <dt className="text-[10px] font-bold uppercase tracking-wide text-dim-400">{label}</dt>
                    <dd className="text-[13px] text-dim-900 font-medium mt-0.5">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>
            {managingPlan.status !== "active" && (
              <div className="px-6 py-4 border-t border-dim-100 flex items-center gap-3">
                <button
                  onClick={() => renewPlan(managingPlan.id)}
                  className="bg-brand-700 hover:bg-brand-800 text-white font-semibold px-5 py-2.5 rounded-[10px] text-[13px] transition-colors"
                >
                  Renovar Plano
                </button>
                <button
                  onClick={() => setManagingPlan(null)}
                  className="border border-dim-200 bg-white hover:bg-dim-50 text-dim-700 font-medium px-5 py-2.5 rounded-[10px] text-[13px] transition-colors"
                >
                  Fechar
                </button>
              </div>
            )}
          </>
        )}
      </Modal>
    </>
  );
}
