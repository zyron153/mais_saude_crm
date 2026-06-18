"use client";

import { useQuery } from "@tanstack/react-query";
import { format, differenceInYears } from "date-fns";
import { pt } from "date-fns/locale";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  MessageSquare,
  Receipt,
  StickyNote,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  Plus,
} from "lucide-react";
import type { Patient, TimelineEvent } from "@cms/types";

async function fetchPatient(id: string): Promise<Patient> {
  const res = await fetch(`/api/patients/${id}`);
  if (!res.ok) throw new Error("Paciente não encontrado");
  return res.json();
}

async function fetchTimeline(id: string): Promise<TimelineEvent[]> {
  const res = await fetch(`/api/patients/${id}/timeline`);
  if (!res.ok) throw new Error("Erro ao carregar timeline");
  return res.json();
}

const EVENT_MAP: Record<string, { icon: typeof CalendarDays; bg: string; color: string }> = {
  appointment:   { icon: CalendarDays,    bg: "bg-brand-50",   color: "text-brand-600"   },
  communication: { icon: MessageSquare,   bg: "bg-violet-50",  color: "text-violet-600"  },
  invoice:       { icon: Receipt,          bg: "bg-amber-50",   color: "text-amber-600"   },
  note:          { icon: StickyNote,       bg: "bg-slate-100",  color: "text-slate-500"   },
};

export default function PatientProfilePage({ params }: { params: { id: string } }) {
  const { data: patient, isLoading } = useQuery({
    queryKey: ["patient", params.id],
    queryFn: () => fetchPatient(params.id),
  });
  const { data: timeline } = useQuery({
    queryKey: ["patient-timeline", params.id],
    queryFn: () => fetchTimeline(params.id),
  });

  if (isLoading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="w-24 h-4 bg-slate-100 rounded-lg" />
        <div className="grid grid-cols-3 gap-6">
          <div className="col-span-1 bg-white rounded-2xl border border-slate-200 h-72" />
          <div className="col-span-2 bg-white rounded-2xl border border-slate-200 h-72" />
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm font-medium text-red-600">Paciente não encontrado.</p>
      </div>
    );
  }

  const age = differenceInYears(new Date(), new Date(patient.dateOfBirth));
  const genderLabels: Record<string, string> = { male: "Masculino", female: "Feminino", other: "Outro" };

  return (
    <div className="space-y-6">
      <Link
        href="/patients"
        className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" /> Pacientes
      </Link>

      <div className="grid grid-cols-3 gap-6 items-start">
        {/* Profile card */}
        <div className="col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {/* Avatar header */}
            <div className="bg-gradient-to-br from-brand-50 to-brand-100 px-6 py-8 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-600 flex items-center justify-center text-white text-2xl font-bold mx-auto shadow-sm">
                {patient.fullName[0]?.toUpperCase()}
              </div>
              <h2 className="mt-3 font-bold text-slate-900 text-lg leading-tight">{patient.fullName}</h2>
              <p className="text-sm text-slate-500 mt-0.5">{age} anos · {genderLabels[patient.gender] ?? patient.gender}</p>
            </div>

            {/* Details */}
            <div className="px-5 py-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-700">{patient.phone}</span>
              </div>
              {patient.email && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-700 truncate">{patient.email}</span>
                </div>
              )}
              {patient.address && (
                <div className="flex items-center gap-3 text-sm">
                  <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-700">{patient.address}</span>
                </div>
              )}
              {patient.nif && (
                <div className="flex items-center gap-3 text-sm">
                  <CreditCard className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="text-slate-700">NIF: {patient.nif}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <CalendarDays className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-slate-700">
                  {format(new Date(patient.dateOfBirth), "d 'de' MMMM yyyy", { locale: pt })}
                </span>
              </div>
            </div>

            {/* Action */}
            <div className="px-5 pb-5">
              <Link
                href={`/appointments/new?patientId=${patient.id}`}
                className="flex items-center justify-center gap-2 w-full bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Marcar Consulta
              </Link>
            </div>
          </div>
        </div>

        {/* Timeline */}
        <div className="col-span-2 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200">
            <h3 className="font-semibold text-slate-900">Histórico</h3>
          </div>

          <div className="px-6 py-5">
            {!timeline || timeline.length === 0 ? (
              <div className="py-10 text-center">
                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                  <CalendarDays className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm text-slate-500">Sem histórico disponível</p>
              </div>
            ) : (
              <div className="space-y-1">
                {timeline.map((event, index) => {
                  const map = EVENT_MAP[event.type] ?? EVENT_MAP.note;
                  const Icon = map.icon;
                  const isLast = index === timeline.length - 1;
                  return (
                    <div key={event.id} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className={`p-2.5 rounded-xl ${map.bg} shrink-0`}>
                          <Icon className={`w-4 h-4 ${map.color}`} />
                        </div>
                        {!isLast && <div className="w-px flex-1 bg-slate-100 mt-1 mb-1 min-h-[1.5rem]" />}
                      </div>
                      <div className={`pb-4 ${isLast ? "" : ""}`}>
                        <p className="text-sm font-semibold text-slate-900 leading-tight">{event.title}</p>
                        {event.description && (
                          <p className="text-xs text-slate-500 mt-0.5">{event.description}</p>
                        )}
                        <p className="text-xs text-slate-400 mt-1">
                          {format(new Date(event.date), "d MMM yyyy, HH:mm", { locale: pt })}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
