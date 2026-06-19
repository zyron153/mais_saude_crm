"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { Search, Plus, User, ChevronLeft, ChevronRight, AlertCircle } from "lucide-react";
import type { Patient, PaginatedResponse } from "@cms/types";

async function fetchPatients(q: string, page: number) {
  const params = new URLSearchParams({ page: String(page), limit: "20" });
  if (q) params.set("q", q);
  const res = await fetch(`/api/patients?${params}`);
  if (!res.ok) throw new Error("Erro ao carregar pacientes");
  return res.json() as Promise<PaginatedResponse<Patient>>;
}

function SkeletonRow() {
  return (
    <tr className="animate-pulse">
      <td className="px-5 py-3.5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-dim-100 rounded-full shrink-0" />
          <div className="w-36 h-3 bg-dim-100 rounded" />
        </div>
      </td>
      <td className="px-5 py-3.5"><div className="w-28 h-3 bg-dim-100 rounded" /></td>
      <td className="px-5 py-3.5"><div className="w-40 h-3 bg-dim-100 rounded" /></td>
      <td className="px-5 py-3.5"><div className="w-16 h-5 bg-dim-100 rounded-full" /></td>
      <td className="px-5 py-3.5"><div className="w-14 h-3 bg-dim-100 rounded ml-auto" /></td>
    </tr>
  );
}

const PLAN_FILTERS = [
  { key: "all",  label: "Todos"      },
  { key: "plan", label: "Com Plano"  },
  { key: "none", label: "Particular" },
];

const CARD = "bg-white rounded-[16px] border border-dim-200 shadow-[0_1px_4px_rgba(0,0,0,.08),0_0_0_1px_rgba(0,0,0,.03)] overflow-hidden";

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [planFilter, setPlanFilter] = useState("all");

  const { data, isLoading, error } = useQuery({
    queryKey: ["patients", search, page],
    queryFn: () => fetchPatients(search, page),
    placeholderData: (prev) => prev,
  });

  const filtered = data?.data.filter((p) => {
    if (planFilter === "plan") return !!p.healthPlanId;
    if (planFilter === "none") return !p.healthPlanId;
    return true;
  }) ?? [];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-bold text-dim-900">Pacientes</h1>
          <p className="text-[13px] text-dim-500 mt-0.5">
            {isLoading ? "A carregar…" : error ? "Erro ao carregar pacientes" : `${data?.total ?? 0} pacientes registados`}
          </p>
        </div>
        <Link
          href="/patients/new"
          className="flex items-center gap-1.5 bg-brand-700 hover:bg-brand-800 text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,.08)] transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          Novo Paciente
        </Link>
      </div>

      {/* Search + filter row */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-dim-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Pesquisar por nome, telefone ou NIF…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 py-2 bg-white border border-dim-200 rounded-[10px] text-[13px] text-dim-900 placeholder:text-dim-400 focus:outline-none focus:border-brand-500 focus:shadow-[0_0_0_3px_rgba(19,163,163,.12)] shadow-[0_1px_2px_rgba(0,0,0,.05)] transition-all"
          />
        </div>

        <div className="flex items-center gap-1.5">
          {PLAN_FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setPlanFilter(f.key)}
              className={`px-3 py-1.5 rounded-[8px] text-[12px] font-medium transition-colors ${
                planFilter === f.key
                  ? "bg-brand-700 text-white shadow-[0_1px_2px_rgba(0,0,0,.08)]"
                  : "bg-white border border-dim-200 text-dim-600 hover:border-brand-400 hover:text-brand-700"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className={CARD}>
        {error ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-[16px] flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-[13px] font-medium text-dim-700">Erro ao carregar pacientes</p>
            <p className="text-[12px] text-dim-400 mt-1">Verifique a ligação ao servidor</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    {["Nome", "Telefone", "Email", "Plano", ""].map((h) => (
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
                    ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                    : filtered.length === 0
                    ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center">
                          <div className="w-12 h-12 bg-dim-100 rounded-[16px] flex items-center justify-center mx-auto mb-3">
                            <User className="w-6 h-6 text-dim-400" />
                          </div>
                          <p className="text-[13px] font-medium text-dim-600">Nenhum paciente encontrado</p>
                          {search && (
                            <p className="text-[12px] text-dim-400 mt-1">Tente pesquisar com outros termos</p>
                          )}
                        </td>
                      </tr>
                    )
                    : filtered.map((patient) => (
                      <tr key={patient.id} className="hover:bg-dim-50 transition-colors group">
                        <td className="px-5 py-3.5 border-b border-dim-100">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-800 font-semibold text-[11px] flex items-center justify-center shrink-0">
                              {patient.fullName[0]?.toUpperCase()}
                            </div>
                            <span className="text-[13px] font-semibold text-dim-900">{patient.fullName}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 border-b border-dim-100 font-mono text-[12px] text-dim-600">{patient.phone}</td>
                        <td className="px-5 py-3.5 border-b border-dim-100 text-[12px] text-dim-500">{patient.email ?? "—"}</td>
                        <td className="px-5 py-3.5 border-b border-dim-100">
                          {patient.healthPlanId ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80">
                              Plano Ativo
                            </span>
                          ) : (
                            <span className="text-[12px] text-dim-400">Particular</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 border-b border-dim-100 text-right">
                          <Link
                            href={`/patients/${patient.id}`}
                            className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            Ver perfil →
                          </Link>
                        </td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.totalPages > 1 && (
              <div className="px-5 py-3.5 border-t border-dim-100 flex items-center justify-between">
                <span className="text-[12px] text-dim-500">
                  {data.total} pacientes · Página <span className="font-semibold text-dim-700">{page}</span> de {data.totalPages}
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
          </>
        )}
      </div>
    </div>
  );
}
