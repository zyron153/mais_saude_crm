"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { format } from "date-fns";
import Link from "next/link";
import { ArrowLeft, CalendarPlus, Clock } from "lucide-react";
import { CreateAppointmentSchema, type CreateAppointmentDto, type TimeSlot } from "@cms/types";

async function fetchAvailability(serviceId: string, staffId: string, date: string): Promise<TimeSlot[]> {
  const params = new URLSearchParams({ serviceId, staffId, date });
  const res = await fetch(`/api/appointments/availability?${params}`);
  if (!res.ok) return [];
  return res.json();
}

async function createAppointment(data: CreateAppointmentDto) {
  const res = await fetch("/api/appointments", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Erro ao criar marcação");
  }
  return res.json();
}

function Field({ label, required, error, children }: {
  label: string; required?: boolean; error?: string; children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      {children}
      {error && <p className="text-xs text-red-600 mt-1.5">{error}</p>}
    </div>
  );
}

const inputCls =
  "w-full border border-slate-200 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm transition-shadow hover:border-slate-300";

export default function NewAppointmentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const prefillPatientId = searchParams.get("patientId") ?? "";

  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selectedStaff, setSelectedStaff] = useState("");
  const [selectedService, setSelectedService] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");

  const { data: slots } = useQuery({
    queryKey: ["availability", selectedService, selectedStaff, selectedDate],
    queryFn: () => fetchAvailability(selectedService, selectedStaff, selectedDate),
    enabled: !!(selectedService && selectedStaff && selectedDate),
  });

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<CreateAppointmentDto>({
    resolver: zodResolver(CreateAppointmentSchema),
    defaultValues: { patientId: prefillPatientId, source: "web" },
  });

  const mutation = useMutation({
    mutationFn: createAppointment,
    onSuccess: () => router.push("/appointments"),
  });

  const availableSlots = slots?.filter((s) => s.available) ?? [];

  return (
    <div className="max-w-xl space-y-6">
      <Link
        href="/appointments"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Marcações
      </Link>

      <div className="flex items-center gap-4">
        <div className="w-11 h-11 bg-brand-50 rounded-2xl flex items-center justify-center">
          <CalendarPlus className="w-5 h-5 text-brand-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nova Marcação</h1>
          <p className="text-sm text-slate-500">Agende uma nova consulta</p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit((data) => mutation.mutate(data))}
        className="bg-white rounded-2xl border border-slate-200 shadow-sm"
      >
        <div className="px-6 py-5 border-b border-slate-200">
          <h2 className="text-sm font-semibold text-slate-700">Dados da Consulta</h2>
        </div>

        <div className="px-6 py-5 space-y-4">
          <Field label="ID do Paciente" required error={errors.patientId?.message}>
            <input
              {...register("patientId")}
              placeholder="UUID do paciente"
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="ID do Médico" required>
              <input
                {...register("staffId")}
                placeholder="UUID"
                onChange={(e) => { register("staffId").onChange(e); setSelectedStaff(e.target.value); }}
                className={inputCls}
              />
            </Field>
            <Field label="ID do Serviço" required>
              <input
                {...register("serviceId")}
                placeholder="UUID"
                onChange={(e) => { register("serviceId").onChange(e); setSelectedService(e.target.value); }}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Data" required>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className={inputCls}
            />
          </Field>

          {availableSlots.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Horário Disponível <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-4 gap-2">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlot === slot.start;
                  return (
                    <button
                      key={slot.start}
                      type="button"
                      onClick={() => {
                        setSelectedSlot(slot.start);
                        setValue("scheduledAt", slot.start, { shouldValidate: true });
                      }}
                      className={`flex items-center justify-center gap-1.5 border rounded-xl py-2 text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-brand-600 border-brand-600 text-white shadow-sm"
                          : "border-slate-200 text-slate-700 hover:bg-brand-50 hover:border-brand-300 hover:text-brand-700"
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      {format(new Date(slot.start), "HH:mm")}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <Field label="Notas">
            <textarea
              {...register("notes")}
              rows={2}
              placeholder="Observações adicionais…"
              className={inputCls}
            />
          </Field>
        </div>

        <div className="px-6 py-5 border-t border-slate-200 bg-slate-50/50 rounded-b-2xl space-y-4">
          {mutation.error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-700">{(mutation.error as Error).message}</p>
            </div>
          )}
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm disabled:opacity-60 transition-all shadow-sm hover:shadow cursor-pointer"
            >
              {mutation.isPending ? "A guardar…" : "Confirmar Marcação"}
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
