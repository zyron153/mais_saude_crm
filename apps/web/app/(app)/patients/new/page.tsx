"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { CreatePatientSchema, type CreatePatientDto } from "@cms/types";

async function createPatient(data: CreatePatientDto) {
  const res = await fetch("/api/patients", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Erro ao criar paciente");
  }
  return res.json();
}

function Field({ label, required, error, children }: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow shadow-sm hover:border-slate-300";

export default function NewPatientPage() {
  const router = useRouter();

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreatePatientDto>({
    resolver: zodResolver(CreatePatientSchema),
    defaultValues: { consentGiven: false, gender: "other" },
  });

  const mutation = useMutation({
    mutationFn: createPatient,
    onSuccess: (data) => router.push(`/patients/${data.id}`),
  });

  return (
    <div className="max-w-2xl space-y-6">
      {/* Back link */}
      <Link
        href="/patients"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Pacientes
      </Link>

      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="w-11 h-11 bg-brand-50 rounded-2xl flex items-center justify-center">
          <UserPlus className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Novo Paciente</h1>
          <p className="text-sm text-slate-500">Preencha os dados do paciente</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm"
      >
        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-700">Informação Pessoal</h2>
        </div>

        <div className="px-6 py-5 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Nome Completo" required error={errors.fullName?.message}>
              <input {...register("fullName")} placeholder="Ex: Maria da Silva" className={inputCls} />
            </Field>
          </div>

          <Field label="Data de Nascimento" required error={errors.dateOfBirth?.message}>
            <input type="date" {...register("dateOfBirth")} className={inputCls} />
          </Field>

          <Field label="Género" required>
            <select {...register("gender")} className={inputCls}>
              <option value="male">Masculino</option>
              <option value="female">Feminino</option>
              <option value="other">Outro</option>
            </select>
          </Field>

          <Field label="Telefone" required error={errors.phone?.message}>
            <input
              {...register("phone")}
              placeholder="+2389912345"
              className={inputCls}
            />
          </Field>

          <Field label="NIF">
            <input {...register("nif")} placeholder="123456789" className={inputCls} />
          </Field>

          <div className="col-span-2">
            <Field label="Email">
              <input type="email" {...register("email")} placeholder="paciente@email.com" className={inputCls} />
            </Field>
          </div>

          <div className="col-span-2">
            <Field label="Morada">
              <textarea
                {...register("address")}
                rows={2}
                placeholder="Rua, Bairro, Cidade"
                className={inputCls}
              />
            </Field>
          </div>
        </div>

        <div className="px-6 py-5 border-t border-slate-200 bg-slate-50/50 rounded-b-2xl space-y-4">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="checkbox"
              id="consent"
              {...register("consentGiven")}
              className="mt-0.5 w-4 h-4 rounded border-slate-300 accent-brand-600 cursor-pointer"
            />
            <span className="text-sm text-slate-700 leading-relaxed">
              O paciente deu consentimento para recolha e tratamento de dados pessoais.{" "}
              <span className="text-red-500">*</span>
            </span>
          </label>
          {errors.consentGiven && (
            <p className="text-xs text-red-600">{errors.consentGiven.message}</p>
          )}

          {mutation.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{(mutation.error as Error).message}</p>
            </div>
          )}

          <div className="flex items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={isSubmitting || mutation.isPending}
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm disabled:opacity-60 transition-all shadow-sm hover:shadow cursor-pointer"
            >
              {mutation.isPending ? "A guardar…" : "Guardar Paciente"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium px-5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer"
            >
              Cancelar
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
