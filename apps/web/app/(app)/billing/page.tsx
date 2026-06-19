"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Plus, Receipt, ChevronLeft, ChevronRight, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react";
import type { Invoice, PaginatedResponse } from "@cms/types";

async function fetchInvoices(page: number, status?: string) {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (status) params.set("status", status);
  const res = await fetch(`/api/invoices?${params}`);
  if (!res.ok) throw new Error("Erro ao carregar faturas");
  return res.json() as Promise<PaginatedResponse<Invoice & { patient: { fullName: string } }>>;
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  draft:          { label: "Rascunho",     cls: "bg-dim-100 text-dim-500"                               },
  issued:         { label: "Emitida",      cls: "bg-brand-50 text-brand-700 ring-1 ring-brand-200/80"   },
  partially_paid: { label: "Pag. Parcial", cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/80"   },
  paid:           { label: "Paga",         cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80" },
  overdue:        { label: "Vencida",      cls: "bg-red-50 text-red-600 ring-1 ring-red-200/80"         },
  cancelled:      { label: "Cancelada",    cls: "bg-dim-100 text-dim-400"                               },
};

const FILTERS = [
  { key: "",               label: "Todas"    },
  { key: "issued",         label: "Emitidas" },
  { key: "partially_paid", label: "Parcial"  },
  { key: "paid",           label: "Pagas"    },
  { key: "overdue",        label: "Vencidas" },
];

const CARD = "bg-white rounded-[16px] border border-dim-200 shadow-[0_1px_4px_rgba(0,0,0,.08),0_0_0_1px_rgba(0,0,0,.03)] overflow-hidden";

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[100, 140, 80, 80, 80, 70, 50].map((w, i) => (
        <td key={i} className="px-5 py-3.5 border-b border-dim-100">
          <div className="h-3 bg-dim-100 rounded inline-block" style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

export default function BillingPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["invoices", page, statusFilter],
    queryFn: () => fetchInvoices(page, statusFilter || undefined),
    placeholderData: (prev) => prev,
  });

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-bold text-dim-900">Faturação</h1>
          <p className="text-[13px] text-dim-500 mt-0.5">
            {isLoading ? "A carregar…" : error ? "Erro ao carregar faturas" : `${data?.total ?? 0} faturas`}
          </p>
        </div>
        <Link
          href="/billing/new"
          className="flex items-center gap-1.5 bg-brand-700 hover:bg-brand-800 text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,.08)] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Nova Fatura
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Receipt,      label: "Total Faturas",    value: data?.total ?? "—",       sub: "este mês",          bg: "bg-dim-100",     cls: "text-dim-600"     },
          { icon: Clock,        label: "Emitidas",         value: "—",                      sub: "aguardam pagamento", bg: "bg-brand-50",    cls: "text-brand-600"   },
          { icon: TrendingUp,   label: "Receita Cobrada",  value: "—",                      sub: "CVE recebidos",      bg: "bg-emerald-50",  cls: "text-emerald-600" },
          { icon: AlertCircle,  label: "Vencidas",         value: "—",                      sub: "requerem atenção",   bg: "bg-red-50",      cls: "text-red-500"     },
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

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => { setStatusFilter(f.key); setPage(1); }}
            className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors cursor-pointer ${
              statusFilter === f.key
                ? "bg-brand-700 text-white shadow-[0_1px_2px_rgba(0,0,0,.08)]"
                : "border border-dim-200 bg-white text-dim-600 hover:border-brand-400 hover:text-brand-700"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className={CARD}>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                {["Nº Fatura", "Paciente", "Data", "Total", "Em Dívida", "Estado", ""].map((h) => (
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
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                : error
                ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="w-12 h-12 bg-red-50 rounded-[16px] flex items-center justify-center mx-auto mb-3">
                        <AlertCircle className="w-6 h-6 text-red-500" />
                      </div>
                      <p className="text-[13px] font-medium text-dim-700">Erro ao carregar faturas</p>
                    </td>
                  </tr>
                )
                : data?.data.length === 0
                ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="w-12 h-12 bg-dim-100 rounded-[16px] flex items-center justify-center mx-auto mb-3">
                        <Receipt className="w-6 h-6 text-dim-400" />
                      </div>
                      <p className="text-[13px] font-medium text-dim-600">Nenhuma fatura encontrada</p>
                    </td>
                  </tr>
                )
                : data?.data.map((inv) => {
                  const amountDue = Number(inv.total) - Number(inv.amountPaid);
                  return (
                    <tr key={inv.id} className="hover:bg-dim-50 transition-colors group">
                      <td className="px-5 py-3.5 border-b border-dim-100 font-mono text-[12px] font-semibold text-dim-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-5 py-3.5 border-b border-dim-100">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-800 text-[10px] font-semibold flex items-center justify-center shrink-0">
                            {inv.patient.fullName[0]?.toUpperCase()}
                          </div>
                          <span className="text-[13px] font-medium text-dim-900">{inv.patient.fullName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 border-b border-dim-100 font-mono text-[11px] text-dim-500">
                        {inv.issuedAt ? format(new Date(inv.issuedAt), "d MMM yyyy", { locale: pt }) : "—"}
                      </td>
                      <td className="px-5 py-3.5 border-b border-dim-100 font-mono text-[13px] font-semibold text-dim-900 tabular-nums">
                        {Number(inv.total).toLocaleString("pt-CV")}
                        <span className="text-[10px] font-normal text-dim-400 ml-1">CVE</span>
                      </td>
                      <td className={`px-5 py-3.5 border-b border-dim-100 font-mono text-[12px] tabular-nums font-medium ${amountDue > 0 ? "text-red-600" : "text-dim-400"}`}>
                        {amountDue.toLocaleString("pt-CV")}
                        <span className="text-[10px] ml-1 opacity-60">CVE</span>
                      </td>
                      <td className="px-5 py-3.5 border-b border-dim-100">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_META[inv.status]?.cls ?? "bg-dim-100 text-dim-600"}`}>
                          {STATUS_META[inv.status]?.label ?? inv.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 border-b border-dim-100">
                        <Link
                          href={`/billing/${inv.id}`}
                          className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          Detalhes →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>

        {data && data.totalPages > 1 && (
          <div className="px-5 py-3.5 border-t border-dim-100 flex items-center justify-between">
            <span className="text-[12px] text-dim-500">
              {data.total} faturas · Página <span className="font-semibold text-dim-700">{page}</span> de {data.totalPages}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-dim-200 text-dim-600 hover:bg-dim-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="w-8 h-8 flex items-center justify-center rounded-md border border-dim-200 text-dim-600 hover:bg-dim-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
