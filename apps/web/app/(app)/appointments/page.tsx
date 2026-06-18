"use client";

import { useEffect, useRef } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import ptLocale from "@fullcalendar/core/locales/pt";
import Link from "next/link";
import { Plus, Dot } from "lucide-react";
import { io } from "socket.io-client";

async function fetchAppointments(from: string, to: string) {
  const params = new URLSearchParams({ from, to });
  const res = await fetch(`/api/appointments?${params}`);
  if (!res.ok) throw new Error("Erro ao carregar marcações");
  return res.json();
}

const STATUS_COLORS: Record<string, string> = {
  pending:    "#f59e0b",
  confirmed:  "#3b82f6",
  checked_in: "#8b5cf6",
  completed:  "#10b981",
  cancelled:  "#94a3b8",
  no_show:    "#ef4444",
};

const STATUS_LEGEND = [
  { key: "pending",    label: "Pendente",   color: "#f59e0b" },
  { key: "confirmed",  label: "Confirmada", color: "#3b82f6" },
  { key: "checked_in", label: "Presente",   color: "#8b5cf6" },
  { key: "completed",  label: "Concluída",  color: "#10b981" },
  { key: "cancelled",  label: "Cancelada",  color: "#94a3b8" },
  { key: "no_show",    label: "Faltou",     color: "#ef4444" },
];

export default function AppointmentsPage() {
  const queryClient = useQueryClient();
  const calendarRef = useRef<FullCalendar>(null);

  const { data: appointments } = useQuery({
    queryKey: ["appointments", "calendar"],
    queryFn: () => {
      const now = new Date();
      const from = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
      const to   = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-31`;
      return fetchAppointments(from, to);
    },
  });

  useEffect(() => {
    const socket = io("/calendar", { path: "/socket.io" });
    socket.on("appointment:created", () => queryClient.invalidateQueries({ queryKey: ["appointments"] }));
    socket.on("appointment:updated", () => queryClient.invalidateQueries({ queryKey: ["appointments"] }));
    return () => { socket.disconnect(); };
  }, [queryClient]);

  const events = (appointments ?? []).map((a: {
    id: string;
    scheduledAt: string;
    durationMinutes: number;
    status: string;
    patient: { fullName: string };
    service: { name: string };
  }) => ({
    id: a.id,
    title: `${a.patient.fullName} — ${a.service.name}`,
    start: a.scheduledAt,
    end: new Date(new Date(a.scheduledAt).getTime() + a.durationMinutes * 60_000).toISOString(),
    backgroundColor: STATUS_COLORS[a.status] ?? "#94a3b8",
    borderColor: "transparent",
    textColor: "#ffffff",
  }));

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Marcações</h1>
          <p className="text-sm text-slate-500 mt-0.5">Calendário de consultas e marcações</p>
        </div>
        <Link
          href="/appointments/new"
          className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all duration-150 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          Nova Marcação
        </Link>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {STATUS_LEGEND.map((s) => (
          <div key={s.key} className="flex items-center gap-1.5">
            <Dot className="w-5 h-5 -mx-1" style={{ color: s.color }} />
            <span className="text-xs text-slate-600">{s.label}</span>
          </div>
        ))}
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 [&_.fc]:font-sans [&_.fc-button]:!bg-brand-600 [&_.fc-button]:!border-brand-600 [&_.fc-button]:!text-white [&_.fc-button:hover]:!bg-brand-700 [&_.fc-button-active]:!bg-brand-700 [&_.fc-today-button]:!bg-slate-100 [&_.fc-today-button]:!border-slate-200 [&_.fc-today-button]:!text-slate-700 [&_.fc-today-button:hover]:!bg-slate-200 [&_.fc-daygrid-day.fc-day-today]:!bg-brand-50 [&_.fc-timegrid-col.fc-day-today]:!bg-brand-50/40 [&_.fc-col-header-cell-cushion]:!text-slate-700 [&_.fc-col-header-cell-cushion]:!font-semibold [&_.fc-daygrid-day-number]:!text-slate-600 [&_.fc-event]:!rounded-lg [&_.fc-event]:!text-xs [&_.fc-toolbar-title]:!text-slate-900 [&_.fc-toolbar-title]:!font-bold [&_.fc-toolbar-title]:!text-lg">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
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
    </div>
  );
}
