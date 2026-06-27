"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, CalendarDays, Users, MessageCircle,
  Shield, FileSearch, Receipt, ClipboardList,
  Users2, Home, BarChart2, Settings, SlidersHorizontal, ChevronRight,
} from "lucide-react";

const NAV = [
  {
    section: "Principal",
    items: [
      { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    section: "Módulos",
    items: [
      { href: "/appointments", label: "Agendamentos",          icon: CalendarDays,  badge: "24", badgeVariant: "default" },
      { href: "/patients",     label: "Pacientes CRM",         icon: Users },
      { href: "/whatsapp",     label: "WhatsApp Hub",          icon: MessageCircle, badge: "7",  badgeVariant: "warn"    },
      { href: "/health-plans", label: "Planos de Saúde",       icon: Shield },
      { href: "/exams",        label: "Exames & Resultados",   icon: FileSearch },
      { href: "/billing",      label: "Faturação",             icon: Receipt,       badge: "3",  badgeVariant: "danger"  },
      { href: "/records",      label: "Registos Clínicos",     icon: ClipboardList },
      { href: "/staff",        label: "Equipa & Turnos",       icon: Users2 },
      { href: "/visits",       label: "Visitas Domiciliárias", icon: Home },
      { href: "/analytics",    label: "Analytics",             icon: BarChart2 },
    ],
  },
  {
    section: "Sistema",
    items: [
      { href: "/settings",         label: "Configurações",   icon: Settings           },
      { href: "/parametrizacoes",  label: "Parametrizações", icon: SlidersHorizontal  },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === href;
    return pathname === href || pathname.startsWith(href + "/");
  }

  return (
    <aside className="w-60 h-screen bg-dim-900 flex flex-col shrink-0 overflow-y-auto overflow-x-hidden z-50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-white/[0.07]">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 bg-brand-600 rounded-[10px] flex items-center justify-center shrink-0">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M10 2.5C10 2.5 4 5 4 10.5C4 13.8 6.7 16.5 10 16.5C13.3 16.5 16 13.8 16 10.5C16 5 10 2.5 10 2.5Z" fill="white" fillOpacity="0.9"/>
              <path d="M10 7V13M7 10H13" stroke="#0A6E6E" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="leading-tight">
            <strong className="font-display font-semibold text-[15px] text-white block">Mais Saúde 360</strong>
            <span className="text-[10px] text-dim-400 tracking-[0.06em] uppercase font-medium">Healthcare ERP/CRM</span>
          </div>
        </div>
      </div>

      {/* Clinic badge */}
      <div className="mx-3 mt-3 bg-white/[0.04] border border-white/[0.07] rounded-[10px] px-3 py-2.5">
        <small className="block text-[10px] text-dim-500 uppercase tracking-[0.06em] font-semibold mb-0.5">Clínica</small>
        <p className="text-[12px] text-dim-300 font-medium">Mais Saúde CV — Palmarejo</p>
      </div>

      {/* Navigation */}
      <nav className="py-4 flex-1">
        {NAV.map((group, gi) => (
          <div key={group.section} className={gi > 0 ? "mt-2" : ""}>
            <div className="px-5 py-1 text-[10px] font-semibold tracking-[0.08em] uppercase text-dim-600">
              {group.section}
            </div>
            {group.items.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  className={`relative flex items-center gap-2.5 px-5 py-2 text-[13px] transition-colors ${
                    active
                      ? "bg-brand-500/[0.15] text-brand-300 font-medium"
                      : "text-dim-400 font-normal hover:bg-white/[0.05] hover:text-dim-200"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-0 bottom-0 w-[3px] bg-brand-400 rounded-r-sm" />
                  )}
                  <Icon className="w-[15px] h-[15px] shrink-0" />
                  {item.label}
                  {"badge" in item && item.badge && (
                    <span className={`ml-auto text-[10px] font-semibold font-mono px-1.5 rounded-full ${
                      item.badgeVariant === "warn"
                        ? "bg-amber-500/[0.15] text-amber-400"
                        : item.badgeVariant === "danger"
                        ? "bg-red-500/[0.15] text-red-400"
                        : "bg-brand-700 text-brand-200"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="p-3 border-t border-white/[0.07]">
        <div className="flex items-center gap-2.5 p-2 rounded-[10px] cursor-pointer hover:bg-white/[0.05] transition-colors">
          <div className="w-8 h-8 rounded-full bg-brand-700 flex items-center justify-center font-semibold text-[12px] text-brand-100 shrink-0">
            AR
          </div>
          <div>
            <strong className="block text-[12px] text-dim-200 font-medium">Ana Rocha</strong>
            <span className="text-[10px] text-dim-500">Recepcionista</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-dim-500 ml-auto" />
        </div>
      </div>
    </aside>
  );
}
