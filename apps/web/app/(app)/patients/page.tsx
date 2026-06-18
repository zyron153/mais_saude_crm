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
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-100 rounded-xl" />
          <div className="w-36 h-3.5 bg-slate-100 rounded-lg" />
        </div>
      </td>
      <td className="px-6 py-4"><div className="w-28 h-3 bg-slate-100 rounded-lg" /></td>
      <td className="px-6 py-4"><div className="w-40 h-3 bg-slate-100 rounded-lg" /></td>
      <td className="px-6 py-4"><div className="w-14 h-5 bg-slate-100 rounded-full" /></td>
      <td className="px-6 py-4"><div className="w-16 h-3 bg-slate-100 rounded-lg ml-auto" /></td>
    </tr>
  );
}

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading, error } = useQuery({
    queryKey: ["patients", search, page],
    queryFn: () => fetchPatients(search, page),
    placeholderData: (prev) => prev,
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pacientes</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {data ? `${data.total} pacientes registados` : "A carregar…"}
          </p>
        </div>
        <Link
          href="/patients/new"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Novo Paciente
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Pesquisar por nome, telefone ou NIF…"
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm transition-shadow"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {error ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <p className="text-sm font-medium text-slate-700">Erro ao carregar pacientes</p>
            <p className="text-xs text-slate-400 mt-1">Verifique a ligação ao servidor</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-slate-50/60 border-b border-slate-200">
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Telefone</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Plano</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ação</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading
                    ? Array.from({ length: 8 }).map((_, i) => <SkeletonRow key={i} />)
                    : data?.data.length === 0
                    ? (
                      <tr>
                        <td colSpan={5} className="py-16 text-center">
                          <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-3">
                            <User className="w-6 h-6 text-slate-400" />
                          </div>
                          <p className="text-sm font-medium text-slate-600">Nenhum paciente encontrado</p>
                          {search && (
                            <p className="text-xs text-slate-400 mt-1">
                              Tente pesquisar com outros termos
                            </p>
                          )}
                        </td>
                      </tr>
                    )
                    : data?.data.map((patient) => (
                      <tr key={patient.id} className="hover:bg-slate-50/70 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600 text-xs font-bold shrink-0">
                              {patient.fullName[0]?.toUpperCase()}
                            </div>
                            <span className="text-sm font-semibold text-slate-900">
                              {patient.fullName}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-600">{patient.phone}</td>
                        <td className="px-6 py-4 text-sm text-slate-600">{patient.email ?? "—"}</td>
                        <td className="px-6 py-4">
                          {patient.healthPlanId ? (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80">
                              Plano Ativo
                            </span>
                          ) : (
                            <span className="text-sm text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <Link
                            href={`/patients/${patient.id}`}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors opacity-0 group-hover:opacity-100"
                          >
                            Ver perfil
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
              <div className="px-6 py-4 border-t border-slate-200 flex items-center justify-between">
                <span className="text-sm text-slate-500">
                  {data.total} pacientes · Página <span className="font-semibold text-slate-700">{page}</span> de {data.totalPages}
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
          </>
        )}
      </div>
    </div>
  );
}
