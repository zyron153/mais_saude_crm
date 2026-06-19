"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptLocale from "@fullcalendar/core/locales/pt";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import Link from "next/link";
import { Plus, CalendarDays, List } from "lucide-react";
import { io } from "socket.io-client";

type Appointment = {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  status: string;
  patient: { fullName: string };
  service: { name: string };
  staff?: { fullName: string };
};

async function fetchAppointments(from: string, to: string) {
  const params = new URLSearchParams({ from, to });
  const res = await fetch(`/api/appointments?${params}`);
  if (!res.ok) throw new Error("Erro ao carregar marcações");
  return res.json();
}

const STATUS_COLORS: Record<string, string> = {
  pending:    "#F59E0B",
  confirmed:  "#13A3A3",
  checked_in: "#8B5CF6",
  completed:  "#10B981",
  cancelled:  "#8E8EA8",
  no_show:    "#EF4444",
};

const STATUS_LEGEND = [
  { key: "pending",    label: "Pendente",   color: "#F59E0B" },
  { key: "confirmed",  label: "Confirmada", color: "#13A3A3" },
  { key: "checked_in", label: "Presente",   color: "#8B5CF6" },
  { key: "completed",  label: "Concluída",  color: "#10B981" },
  { key: "cancelled",  label: "Cancelada",  color: "#8E8EA8" },
  { key: "no_show",    label: "Faltou",     color: "#EF4444" },
];

const STATUS_PILL: Record<string, string> = {
  pending:    "bg-amber-100 text-amber-700",
  confirmed:  "bg-brand-100 text-brand-800",
  checked_in: "bg-violet-100 text-violet-700",
  completed:  "bg-emerald-100 text-emerald-700",
  cancelled:  "bg-dim-100 text-dim-500",
  no_show:    "bg-red-100 text-red-600",
};

const CARD = "bg-white rounded-[16px] border border-dim-200 shadow-[0_1px_4px_rgba(0,0,0,.08),0_0_0_1px_rgba(0,0,0,.03)] overflow-hidden";

export default function AppointmentsPage() {
  const [view, setView] = useState<"calendar" | "list">("calendar");
  const queryClient = useQueryClient();
  const calendarRef = useRef<FullCalendar>(null);

  const { data: appointments, isLoading } = useQuery<Appointment[]>({
    queryKey: ["appointments", "calendar"],
    queryFn: () => {
      const now = new Date();
      const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      const to   = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-31`;
      return fetchAppointments(from, to);
    },
  });

  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";
    const socket = io(`${apiUrl}/calendar`, { path: "/socket.io" });
    socket.on("appointment:created", () => queryClient.invalidateQueries({ queryKey: ["appointments"] }));
    socket.on("appointment:updated", () => queryClient.invalidateQueries({ queryKey: ["appointments"] }));
    return () => { socket.disconnect(); };
  }, [queryClient]);

  const events = (appointments ?? []).map((a) => ({
    id: a.id,
    title: `${a.patient.fullName} — ${a.service.name}`,
    start: a.scheduledAt,
    end: new Date(new Date(a.scheduledAt).getTime() + a.durationMinutes * 60_000).toISOString(),
    backgroundColor: STATUS_COLORS[a.status] ?? "#8E8EA8",
    borderColor: "transparent",
    textColor: "#ffffff",
  }));

  const sortedList = [...(appointments ?? [])].sort(
    (a, b) => new Date(a.scheduledAt).getTime() - new Date(b.scheduledAt).getTime()
  );

  const today    = (appointments ?? []).length;
  const pending  = (appointments ?? []).filter((a) => a.status === "pending").length;
  const confirmed = (appointments ?? []).filter((a) => a.status === "confirmed").length;
  const completed = (appointments ?? []).filter((a) => a.status === "completed").length;

  return (
    <div className="flex flex-col gap-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] font-bold text-dim-900">Agendamentos</h1>
          <p className="text-[13px] text-dim-500 mt-0.5">Calendário de consultas e marcações</p>
        </div>
        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center gap-1 bg-dim-100 rounded-[10px] p-1">
            <button
              onClick={() => setView("calendar")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                view === "calendar" ? "bg-white text-dim-900 shadow-[0_1px_2px_rgba(0,0,0,.08)]" : "text-dim-500 hover:text-dim-700"
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Calendário
            </button>
            <button
              onClick={() => setView("list")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium transition-colors ${
                view === "list" ? "bg-white text-dim-900 shadow-[0_1px_2px_rgba(0,0,0,.08)]" : "text-dim-500 hover:text-dim-700"
              }`}
            >
              <List className="w-3.5 h-3.5" />
              Lista
            </button>
          </div>

          <Link
            href="/appointments/new"
            className="flex items-center gap-1.5 bg-brand-700 hover:bg-brand-800 text-white text-[13px] font-semibold px-4 py-2 rounded-[10px] shadow-[0_1px_2px_rgba(0,0,0,.08)] transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            Nova Marcação
          </Link>
        </div>
      </div>

      {/* Quick stats */}
      <div className="flex items-center gap-3">
        {[
          { label: "Este mês", value: today,     cls: "bg-dim-100 text-dim-700" },
          { label: "Pendentes", value: pending,   cls: "bg-amber-50 text-amber-700 border border-amber-200/80" },
          { label: "Confirmadas", value: confirmed, cls: "bg-brand-50 text-brand-700 border border-brand-200/80" },
          { label: "Concluídas", value: completed, cls: "bg-emerald-50 text-emerald-700 border border-emerald-200/80" },
        ].map((s) => (
          <div key={s.label} className={`flex items-center gap-2 px-3 py-1.5 rounded-[10px] text-[12px] font-medium ${s.cls}`}>
            <span className="font-mono font-bold">{isLoading ? "…" : s.value}</span>
            {s.label}
          </div>
        ))}

        <div className="ml-auto flex items-center gap-2">
          {STATUS_LEGEND.map((s) => (
            <div
              key={s.key}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold"
              style={{ background: s.color + "18", color: s.color }}
            >
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
              {s.label}
            </div>
          ))}
        </div>
      </div>

      {/* Calendar view */}
      {view === "calendar" && (
        <div className={CARD}>
          <div className="p-5 [&_.fc]:font-sans [&_.fc]:text-[13px] [&_.fc-button]:!bg-brand-600 [&_.fc-button]:!border-brand-600 [&_.fc-button]:!text-white [&_.fc-button:hover]:!bg-brand-700 [&_.fc-button-active]:!bg-brand-700 [&_.fc-today-button]:!bg-dim-100 [&_.fc-today-button]:!border-dim-200 [&_.fc-today-button]:!text-dim-700 [&_.fc-today-button:hover]:!bg-dim-200 [&_.fc-daygrid-day.fc-day-today]:!bg-brand-50 [&_.fc-timegrid-col.fc-day-today]:!bg-brand-50/40 [&_.fc-col-header-cell-cushion]:!text-dim-700 [&_.fc-col-header-cell-cushion]:!font-semibold [&_.fc-daygrid-day-number]:!text-dim-600 [&_.fc-event]:!rounded-lg [&_.fc-event]:!text-xs [&_.fc-toolbar-title]:!text-dim-900 [&_.fc-toolbar-title]:!font-bold [&_.fc-toolbar-title]:!text-[17px] [&_.fc-toolbar-title]:!font-display">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView="timeGridWeek"
              headerToolbar={{ left: "prev,next today", center: "title", right: "dayGridMonth,timeGridWeek,timeGridDay" }}
              locale={ptLocale}
              events={events}
              slotMinTime="07:00:00"
              slotMaxTime="20:00:00"
              slotDuration="00:30:00"
              allDaySlot={false}
              height="auto"
              eventClick={(info) => { window.location.href = `/appointments/${info.event.id}`; }}
            />
          </div>
        </div>
      )}

      {/* List view */}
      {view === "list" && (
        <div className={CARD}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-dim-100">
            <h2 className="font-display text-[14px] font-semibold text-dim-900">Lista de Marcações</h2>
            <span className="font-mono text-[11px] text-dim-400">{sortedList.length} registos</span>
          </div>

          {isLoading ? (
            <div className="divide-y divide-dim-100">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="px-5 py-3.5 flex items-center gap-4 animate-pulse">
                  <div className="w-20 h-3 bg-dim-100 rounded" />
                  <div className="w-32 h-3 bg-dim-100 rounded" />
                  <div className="flex-1 h-3 bg-dim-100 rounded" />
                  <div className="w-20 h-5 bg-dim-100 rounded-full" />
                </div>
              ))}
            </div>
          ) : sortedList.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-12 h-12 bg-dim-100 rounded-[16px] flex items-center justify-center mx-auto mb-3">
                <CalendarDays className="w-6 h-6 text-dim-400" />
              </div>
              <p className="text-[13px] font-medium text-dim-600">Sem marcações este mês</p>
            </div>
          ) : (
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {["Data", "Hora", "Paciente", "Serviço", "Médico", "Estado", ""].map((h) => (
                    <th key={h} className="text-left text-[10px] font-bold uppercase tracking-[0.07em] text-dim-400 px-5 py-2.5 border-b border-dim-100 bg-dim-50">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sortedList.map((a) => (
                  <tr key={a.id} className="hover:bg-dim-50 transition-colors group">
                    <td className="px-5 py-3 border-b border-dim-100 font-mono text-[11px] text-dim-600 whitespace-nowrap">
                      {format(new Date(a.scheduledAt), "dd MMM yyyy", { locale: pt })}
                    </td>
                    <td className="px-5 py-3 border-b border-dim-100 font-mono text-[12px] font-semibold text-dim-900">
                      {format(new Date(a.scheduledAt), "HH:mm")}
                    </td>
                    <td className="px-5 py-3 border-b border-dim-100">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-800 font-semibold text-[10px] flex items-center justify-center shrink-0">
                          {a.patient.fullName[0]?.toUpperCase()}
                        </div>
                        <span className="text-[13px] font-medium text-dim-900">{a.patient.fullName}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 border-b border-dim-100 text-[12px] text-dim-600">{a.service.name}</td>
                    <td className="px-5 py-3 border-b border-dim-100 text-[12px] text-dim-500">
                      {a.staff?.fullName ?? "—"}
                    </td>
                    <td className="px-5 py-3 border-b border-dim-100">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_PILL[a.status] ?? "bg-dim-100 text-dim-600"}`}>
                        {STATUS_LEGEND.find((s) => s.key === a.status)?.label ?? a.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 border-b border-dim-100">
                      <Link
                        href={`/appointments/${a.id}`}
                        className="text-[11px] font-semibold text-brand-600 hover:text-brand-700 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
