"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import { Plus, Receipt, ChevronLeft, ChevronRight } from "lucide-react";
import type { Invoice, PaginatedResponse } from "@cms/types";

async function fetchInvoices(page: number, status?: string) {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (status) params.set("status", status);
  const res = await fetch(`/api/invoices?${params}`);
  if (!res.ok) throw new Error("Erro ao carregar faturas");
  return res.json() as Promise<PaginatedResponse<Invoice & { patient: { fullName: string } }>>;
}

const STATUS_META: Record<string, { label: string; cls: string }> = {
  draft:          { label: "Rascunho",      cls: "bg-slate-100 text-slate-600 ring-1 ring-slate-200/80" },
  issued:         { label: "Emitida",       cls: "bg-blue-50 text-blue-700 ring-1 ring-blue-200/80" },
  partially_paid: { label: "Pag. Parcial",  cls: "bg-amber-50 text-amber-700 ring-1 ring-amber-200/80" },
  paid:           { label: "Paga",          cls: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80" },
  overdue:        { label: "Vencida",       cls: "bg-red-50 text-red-700 ring-1 ring-red-200/80" },
  cancelled:      { label: "Cancelada",     cls: "bg-slate-100 text-slate-400 ring-1 ring-slate-200/80" },
};

const FILTERS = [
  { key: "",               label: "Todas" },
  { key: "issued",         label: "Emitidas" },
  { key: "partially_paid", label: "Parcial" },
  { key: "paid",           label: "Pagas" },
  { key: "overdue",        label: "Vencidas" },
];

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      {[100, 140, 80, 80, 80, 60, 50].map((w, i) => (
        <td key={i} className={`px-6 py-4 ${i > 2 ? "text-right" : ""}`}>
          <div className={`h-3.5 bg-slate-100 rounded-lg inline-block`} style={{ width: w }} />
        </td>
      ))}
    </tr>
  );
}

export default function BillingPage() {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["invoices", page, statusFilter],
    queryFn: () => fetchInvoices(page, statusFilter || undefined),
    placeholderData: (prev) => prev,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Faturação</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {data ? `${data.total} faturas` : "A carregar…"}
          </p>
        </div>
        <Link
          href="/billing/new"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nova Fatura
        </Link>
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            onClick={() => { setStatusFilter(f.key); setPage(1); }}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
              statusFilter === f.key
                ? "bg-brand-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 hover:border-slate-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50/60 border-b border-slate-200">
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nº Fatura</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Paciente</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Data</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Em Dívida</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading
                ? Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
                : data?.data.length === 0
                ? (
                  <tr>
                    <td colSpan={7} className="py-16 text-center">
                      <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Receipt className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-medium text-slate-600">Nenhuma fatura encontrada</p>
                    </td>
                  </tr>
                )
                : data?.data.map((inv) => {
                  const amountDue = Number(inv.total) - Number(inv.amountPaid);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-6 py-4 font-mono text-sm font-semibold text-slate-900">
                        {inv.invoiceNumber}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 text-xs font-bold shrink-0">
                            {inv.patient.fullName[0]?.toUpperCase()}
                          </div>
                          <span className="text-sm text-slate-900">{inv.patient.fullName}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-500">
                        {inv.issuedAt ? format(new Date(inv.issuedAt), "d MMM yyyy", { locale: pt }) : "—"}
                      </td>
                      <td className="px-6 py-4 text-right text-sm font-semibold text-slate-900 tabular-nums">
                        {Number(inv.total).toLocaleString("pt-CV")} CVE
                      </td>
                      <td className={`px-6 py-4 text-right text-sm tabular-nums font-medium ${amountDue > 0 ? "text-red-600" : "text-slate-400"}`}>
                        {amountDue.toLocaleString("pt-CV")} CVE
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${STATUS_META[inv.status]?.cls ?? "bg-slate-100 text-slate-600"}`}>
                          {STATUS_META[inv.status]?.label ?? inv.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/billing/${inv.id}`}
                          className="text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          Detalhes
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
          <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-sm text-slate-500">
              {data.total} faturas · Página <span className="font-semibold text-slate-700">{page}</span> de {data.totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === data.totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="p-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
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
