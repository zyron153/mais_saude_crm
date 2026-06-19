"use client";

import { useState } from "react";
import {
  Building2, Bell, Users, Plug, Shield,
  Check, AlertCircle, Clock, Phone, Mail, Globe,
  Key, Lock, Eye, EyeOff,
} from "lucide-react";

/* ── Mock data ───────────────────────────────────────────── */

const CLINIC = {
  name:    "Clínica Mais Saúde",
  address: "Achada Santo António, Praia, Santiago",
  country: "Cabo Verde",
  phone:   "+238 261 00 00",
  email:   "geral@maissaude.cv",
  website: "www.maissaude.cv",
  nif:     "200 456 789",
  hours:   [
    { day: "Segunda-feira", open: "08:00", close: "18:00", active: true },
    { day: "Terça-feira",   open: "08:00", close: "18:00", active: true },
    { day: "Quarta-feira",  open: "08:00", close: "18:00", active: true },
    { day: "Quinta-feira",  open: "08:00", close: "18:00", active: true },
    { day: "Sexta-feira",   open: "08:00", close: "17:00", active: true },
    { day: "Sábado",        open: "09:00", close: "13:00", active: true },
    { day: "Domingo",       open: "",      close: "",       active: false },
  ],
};

const NOTIF_SETTINGS = [
  { id: "wa_reminder",  group: "WhatsApp",        label: "Lembrete de consulta (24h antes)",   desc: "Enviado automaticamente ao paciente",               on: true  },
  { id: "wa_confirm",   group: "WhatsApp",        label: "Confirmação de marcação",             desc: "Quando o agendamento é criado",                     on: true  },
  { id: "wa_cancel",    group: "WhatsApp",        label: "Notificação de cancelamento",         desc: "Quando a consulta é cancelada ou reagendada",       on: true  },
  { id: "wa_result",    group: "WhatsApp",        label: "Resultado de exame disponível",       desc: "Quando os resultados são carregados no sistema",    on: false },
  { id: "email_daily",  group: "Email Interno",   label: "Resumo diário da agenda",             desc: "Enviado à equipa às 07h30",                         on: true  },
  { id: "email_overdue",group: "Email Interno",   label: "Faturas vencidas",                   desc: "Relatório semanal de faturas em atraso",            on: true  },
  { id: "email_new_pt", group: "Email Interno",   label: "Novo paciente registado",             desc: "Notificação para a direcção",                       on: false },
];

const USERS = [
  { id: "u1", name: "Fátima Costa",  email: "f.costa@maissaude.cv",   role: "Médica",       status: "active",   last: "Hoje"       },
  { id: "u2", name: "Nuno Barros",   email: "n.barros@maissaude.cv",  role: "Médico",       status: "active",   last: "Hoje"       },
  { id: "u3", name: "Sofia Lima",    email: "s.lima@maissaude.cv",    role: "Enfermeira",   status: "active",   last: "Hoje"       },
  { id: "u4", name: "Carlos Neves",  email: "c.neves@maissaude.cv",   role: "Enfermeiro",   status: "active",   last: "Ontem"      },
  { id: "u5", name: "Ana Silva",     email: "a.silva@maissaude.cv",   role: "Recepcionista",status: "active",   last: "Hoje"       },
  { id: "u6", name: "Miguel Varela", email: "m.varela@maissaude.cv",  role: "Médico",       status: "inactive", last: "15 Jun"     },
  { id: "u7", name: "Pedro Santos",  email: "p.santos@maissaude.cv",  role: "Técnico",      status: "active",   last: "Hoje"       },
  { id: "u8", name: "Admin Sistema", email: "admin@maissaude.cv",     role: "Administrador",status: "active",   last: "Hoje"       },
];

const INTEGRATIONS = [
  { name: "Keycloak SSO",       desc: "Autenticação e gestão de identidades",  status: "connected",    icon: Shield, color: "text-brand-600",   bg: "bg-brand-50"   },
  { name: "WhatsApp Business",  desc: "Mensagens automáticas aos pacientes",   status: "connected",    icon: Phone,  color: "text-emerald-600", bg: "bg-emerald-50" },
  { name: "Cloudflare R2",      desc: "Armazenamento de exames e documentos",  status: "connected",    icon: Globe,  color: "text-amber-600",   bg: "bg-amber-50"   },
  { name: "Email (SMTP)",       desc: "Notificações por email",                status: "connected",    icon: Mail,   color: "text-violet-600",  bg: "bg-violet-50"  },
  { name: "Laboratório CVLab",  desc: "Integração de resultados de exames",    status: "disconnected", icon: Plug,   color: "text-dim-400",     bg: "bg-dim-100"    },
  { name: "Portal de Saúde CV", desc: "Comunicação com o SNS nacional",        status: "pending",      icon: Globe,  color: "text-amber-600",   bg: "bg-amber-50"   },
];

const ROLE_COLOR: Record<string, string> = {
  "Médica":        "bg-brand-100 text-brand-800",
  "Médico":        "bg-brand-100 text-brand-800",
  "Enfermeira":    "bg-emerald-100 text-emerald-800",
  "Enfermeiro":    "bg-emerald-100 text-emerald-800",
  "Recepcionista": "bg-amber-100 text-amber-800",
  "Técnico":       "bg-rose-100 text-rose-800",
  "Administrador": "bg-violet-100 text-violet-800",
};

/* ── UI primitives ───────────────────────────────────────── */

const CARD = "bg-white rounded-[16px] border border-dim-200 shadow-[0_1px_4px_rgba(0,0,0,.08),0_0_0_1px_rgba(0,0,0,.03)] overflow-hidden";
const inputCls = "w-full border border-dim-200 rounded-[10px] px-3.5 py-2.5 text-[13px] text-dim-900 bg-white focus:outline-none focus:border-brand-500 focus:shadow-[0_0_0_3px_rgba(19,163,163,.12)] transition-all shadow-[0_1px_2px_rgba(0,0,0,.05)] hover:border-dim-300 font-sans placeholder:text-dim-400";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[12px] font-semibold text-dim-700 mb-1.5">{label}</label>
      {children}
    </div>
  );
}

function Toggle({ defaultChecked }: { defaultChecked?: boolean }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input type="checkbox" className="sr-only peer" defaultChecked={defaultChecked} />
      <div className="w-9 h-5 bg-dim-200 rounded-full peer peer-checked:bg-brand-700 transition-colors after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:after:translate-x-4" />
    </label>
  );
}

/* ── Tab content components ──────────────────────────────── */

function ClinicTab({ saved, onSave }: { saved: boolean; onSave: () => void }) {
  return (
    <div className="flex flex-col gap-4">
      <div className={CARD}>
        <div className="px-5 py-4 border-b border-dim-100">
          <h3 className="font-display text-[14px] font-semibold text-dim-900">Informação da Clínica</h3>
        </div>
        <div className="px-5 py-5 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <Field label="Nome da Clínica">
              <input className={inputCls} defaultValue={CLINIC.name} />
            </Field>
          </div>
          <Field label="NIF">
            <input className={`${inputCls} font-mono`} defaultValue={CLINIC.nif} />
          </Field>
          <Field label="Website">
            <input className={inputCls} defaultValue={CLINIC.website} />
          </Field>
          <Field label="Telefone Principal">
            <input className={`${inputCls} font-mono`} defaultValue={CLINIC.phone} />
          </Field>
          <Field label="Email Geral">
            <input type="email" className={inputCls} defaultValue={CLINIC.email} />
          </Field>
          <div className="col-span-2">
            <Field label="Endereço">
              <input className={inputCls} defaultValue={CLINIC.address} />
            </Field>
          </div>
          <Field label="País / Região">
            <select className={inputCls}>
              <option>Cabo Verde</option>
              <option>Portugal</option>
            </select>
          </Field>
        </div>
      </div>

      <div className={CARD}>
        <div className="px-5 py-4 border-b border-dim-100">
          <h3 className="font-display text-[14px] font-semibold text-dim-900">Horário de Funcionamento</h3>
        </div>
        <div className="px-5 py-4 flex flex-col gap-2">
          {CLINIC.hours.map((h) => (
            <div key={h.day} className="flex items-center gap-4 py-2 border-b border-dim-50 last:border-0">
              <div className="w-36 shrink-0">
                <span className={`text-[13px] font-medium ${h.active ? "text-dim-800" : "text-dim-400"}`}>{h.day}</span>
              </div>
              {h.active ? (
                <>
                  <div className="flex items-center gap-2">
                    <input className="w-20 border border-dim-200 rounded-[8px] px-2.5 py-1.5 text-[12px] font-mono text-dim-700 focus:outline-none focus:border-brand-500 bg-white" defaultValue={h.open} />
                    <span className="text-dim-300 text-[12px]">–</span>
                    <input className="w-20 border border-dim-200 rounded-[8px] px-2.5 py-1.5 text-[12px] font-mono text-dim-700 focus:outline-none focus:border-brand-500 bg-white" defaultValue={h.close} />
                  </div>
                  <Toggle defaultChecked={true} />
                </>
              ) : (
                <>
                  <span className="text-[12px] text-dim-400 italic">Encerrado</span>
                  <Toggle defaultChecked={false} />
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={onSave}
          className="flex items-center gap-2 bg-brand-700 hover:bg-brand-800 text-white font-semibold px-5 py-2.5 rounded-[10px] text-[13px] transition-colors shadow-[0_1px_2px_rgba(0,0,0,.08)]"
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : null}
          {saved ? "Guardado!" : "Guardar Alterações"}
        </button>
        {saved && <span className="text-[12px] text-emerald-600 font-medium">Alterações guardadas com sucesso.</span>}
      </div>
    </div>
  );
}

function NotificationsTab({ saved, onSave }: { saved: boolean; onSave: () => void }) {
  const groups = [...new Set(NOTIF_SETTINGS.map((n) => n.group))];
  return (
    <div className="flex flex-col gap-4">
      {groups.map((group) => (
        <div key={group} className={CARD}>
          <div className="px-5 py-4 border-b border-dim-100">
            <h3 className="font-display text-[14px] font-semibold text-dim-900">{group}</h3>
          </div>
          <div className="divide-y divide-dim-100">
            {NOTIF_SETTINGS.filter((n) => n.group === group).map((n) => (
              <div key={n.id} className="px-5 py-4 flex items-center justify-between gap-4">
                <div>
                  <p className="text-[13px] font-medium text-dim-900">{n.label}</p>
                  <p className="text-[11px] text-dim-400 mt-0.5">{n.desc}</p>
                </div>
                <Toggle defaultChecked={n.on} />
              </div>
            ))}
          </div>
        </div>
      ))}
      <div className="flex items-center gap-3">
        <button
          onClick={onSave}
          className="flex items-center gap-2 bg-brand-700 hover:bg-brand-800 text-white font-semibold px-5 py-2.5 rounded-[10px] text-[13px] transition-colors shadow-[0_1px_2px_rgba(0,0,0,.08)]"
        >
          {saved ? <Check className="w-3.5 h-3.5" /> : null}
          {saved ? "Guardado!" : "Guardar Preferências"}
        </button>
      </div>
    </div>
  );
}

function UsersTab() {
  return (
    <div className={CARD}>
      <div className="flex items-center justify-between px-5 py-4 border-b border-dim-100">
        <h3 className="font-display text-[14px] font-semibold text-dim-900">Utilizadores do Sistema</h3>
        <button className="flex items-center gap-1.5 bg-brand-700 hover:bg-brand-800 text-white text-[12px] font-semibold px-3 py-1.5 rounded-[8px] transition-colors">
          + Convidar
        </button>
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            {["Utilizador", "Função", "Email", "Último acesso", "Estado", ""].map((h) => (
              <th key={h} className="text-left text-[10px] font-bold uppercase tracking-[0.07em] text-dim-400 px-5 py-2.5 border-b border-dim-100 bg-dim-50">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {USERS.map((u) => (
            <tr key={u.id} className="hover:bg-dim-50 transition-colors group">
              <td className="px-5 py-3.5 border-b border-dim-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-brand-100 text-brand-800 font-semibold text-[10px] flex items-center justify-center shrink-0">
                    {u.name.split(" ").map((n) => n[0]).slice(0, 2).join("")}
                  </div>
                  <span className="text-[13px] font-medium text-dim-900">{u.name}</span>
                </div>
              </td>
              <td className="px-5 py-3.5 border-b border-dim-100">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${ROLE_COLOR[u.role] ?? "bg-dim-100 text-dim-600"}`}>{u.role}</span>
              </td>
              <td className="px-5 py-3.5 border-b border-dim-100 font-mono text-[11px] text-dim-500">{u.email}</td>
              <td className="px-5 py-3.5 border-b border-dim-100 text-[12px] text-dim-500">{u.last}</td>
              <td className="px-5 py-3.5 border-b border-dim-100">
                <div className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${u.status === "active" ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80" : "bg-dim-100 text-dim-400"}`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${u.status === "active" ? "bg-emerald-500" : "bg-dim-300"}`} />
                  {u.status === "active" ? "Activo" : "Inactivo"}
                </div>
              </td>
              <td className="px-5 py-3.5 border-b border-dim-100">
                <button className="text-[11px] font-semibold text-dim-400 hover:text-dim-700 opacity-0 group-hover:opacity-100 transition-all">Editar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function IntegrationsTab() {
  return (
    <div className="grid grid-cols-2 gap-4">
      {INTEGRATIONS.map((intg) => {
        const Icon = intg.icon;
        const isConnected    = intg.status === "connected";
        const isPending      = intg.status === "pending";
        const isDisconnected = intg.status === "disconnected";
        return (
          <div key={intg.name} className={CARD}>
            <div className="px-5 py-5">
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 ${intg.bg} rounded-[10px] flex items-center justify-center`}>
                  <Icon className={intg.color} style={{ width: 18, height: 18 }} />
                </div>
                <div className={`inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  isConnected    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200/80" :
                  isPending      ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200/80"      :
                                   "bg-dim-100 text-dim-400"
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${isConnected ? "bg-emerald-500" : isPending ? "bg-amber-400 animate-pulse" : "bg-dim-300"}`} />
                  {isConnected ? "Ligado" : isPending ? "Pendente" : "Desligado"}
                </div>
              </div>
              <p className="text-[14px] font-semibold text-dim-900">{intg.name}</p>
              <p className="text-[11px] text-dim-400 mt-0.5">{intg.desc}</p>
              <div className="mt-4 flex items-center gap-2">
                <button className={`text-[11px] font-semibold px-3 py-1.5 rounded-[8px] border transition-colors ${
                  isConnected
                    ? "border-dim-200 text-dim-500 hover:border-dim-300 hover:text-dim-700"
                    : "border-brand-400 text-brand-700 hover:bg-brand-50"
                }`}>
                  {isConnected ? "Configurar" : "Ligar"}
                </button>
                {isConnected && (
                  <button className="text-[11px] font-semibold text-dim-400 hover:text-red-500 transition-colors">Desligar</button>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SecurityTab({ saved, onSave }: { saved: boolean; onSave: () => void }) {
  const [showPw, setShowPw] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      <div className={CARD}>
        <div className="px-5 py-4 border-b border-dim-100">
          <h3 className="font-display text-[14px] font-semibold text-dim-900">Alterar Palavra-passe</h3>
        </div>
        <div className="px-5 py-5 flex flex-col gap-4 max-w-md">
          <Field label="Palavra-passe actual">
            <div className="relative">
              <input type={showPw ? "text" : "password"} className={inputCls} placeholder="••••••••" />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-dim-400 hover:text-dim-700 transition-colors"
              >
                {showPw ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
              </button>
            </div>
          </Field>
          <Field label="Nova palavra-passe">
            <input type="password" className={inputCls} placeholder="••••••••" />
          </Field>
          <Field label="Confirmar nova palavra-passe">
            <input type="password" className={inputCls} placeholder="••••••••" />
          </Field>
          <button
            onClick={onSave}
            className="flex items-center gap-2 w-fit bg-brand-700 hover:bg-brand-800 text-white font-semibold px-5 py-2.5 rounded-[10px] text-[13px] transition-colors"
          >
            {saved ? <Check className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5" />}
            {saved ? "Actualizado!" : "Actualizar Palavra-passe"}
          </button>
        </div>
      </div>

      <div className={CARD}>
        <div className="px-5 py-4 border-b border-dim-100">
          <h3 className="font-display text-[14px] font-semibold text-dim-900">Autenticação de Dois Factores</h3>
        </div>
        <div className="px-5 py-5 flex items-start justify-between gap-6">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 bg-violet-50 rounded-[10px] flex items-center justify-center shrink-0">
              <Lock className="text-violet-600" style={{ width: 18, height: 18 }} />
            </div>
            <div>
              <p className="text-[13px] font-semibold text-dim-900">2FA via aplicação autenticadora</p>
              <p className="text-[11px] text-dim-400 mt-0.5">Proteja a sua conta com TOTP (Google Authenticator, Authy, etc.)</p>
              <div className="mt-2 flex items-center gap-1.5 text-[11px] text-amber-600 font-medium">
                <AlertCircle style={{ width: 12, height: 12 }} />
                Não configurado — recomendado para contas administrativas
              </div>
            </div>
          </div>
          <button className="text-[12px] font-semibold px-3.5 py-2 rounded-[10px] border border-brand-400 text-brand-700 hover:bg-brand-50 transition-colors shrink-0">
            Configurar 2FA
          </button>
        </div>
      </div>

      <div className={CARD}>
        <div className="px-5 py-4 border-b border-dim-100">
          <h3 className="font-display text-[14px] font-semibold text-dim-900">Sessões Activas</h3>
        </div>
        <div className="divide-y divide-dim-100">
          {[
            { device: "Chrome · Windows 11", location: "Praia, Cabo Verde", time: "Agora",     current: true  },
            { device: "Safari · iPhone 15",   location: "Praia, Cabo Verde", time: "Há 2 horas", current: false },
            { device: "Chrome · macOS",        location: "Lisboa, Portugal",  time: "Ontem",    current: false },
          ].map((s) => (
            <div key={s.device} className="px-5 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${s.current ? "bg-emerald-500" : "bg-dim-300"}`} />
                <div>
                  <p className="text-[13px] font-medium text-dim-900">{s.device}</p>
                  <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-dim-400">
                    <Clock style={{ width: 9, height: 9 }} />
                    {s.time} · {s.location}
                  </div>
                </div>
              </div>
              {!s.current && (
                <button className="text-[11px] font-semibold text-red-500 hover:text-red-700 transition-colors">Terminar</button>
              )}
              {s.current && <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">Esta sessão</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */

const TABS = [
  { key: "clinic",    label: "Clínica",        icon: Building2 },
  { key: "notifs",    label: "Notificações",    icon: Bell      },
  { key: "users",     label: "Utilizadores",    icon: Users     },
  { key: "integrations", label: "Integrações", icon: Plug      },
  { key: "security",  label: "Segurança",       icon: Shield    },
] as const;

type TabKey = typeof TABS[number]["key"];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<TabKey>("clinic");
  const [saved,     setSaved]     = useState(false);

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div>
        <h1 className="font-display text-[22px] font-bold text-dim-900">Configurações</h1>
        <p className="text-[13px] text-dim-500 mt-0.5">Gestão da clínica, notificações, integrações e segurança</p>
      </div>

      <div className="flex gap-5 items-start">
        {/* Sidebar nav */}
        <nav className="w-48 shrink-0 flex flex-col gap-1">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2.5 w-full text-left px-3.5 py-2.5 rounded-[10px] text-[13px] font-medium transition-colors cursor-pointer ${
                  active
                    ? "bg-brand-700 text-white shadow-[0_1px_2px_rgba(0,0,0,.08)]"
                    : "text-dim-600 hover:bg-dim-100 hover:text-dim-900"
                }`}
              >
                <Icon style={{ width: 15, height: 15 }} className={active ? "opacity-90" : "opacity-60"} />
                {tab.label}
              </button>
            );
          })}
        </nav>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {activeTab === "clinic"       && <ClinicTab        saved={saved} onSave={handleSave} />}
          {activeTab === "notifs"       && <NotificationsTab saved={saved} onSave={handleSave} />}
          {activeTab === "users"        && <UsersTab />}
          {activeTab === "integrations" && <IntegrationsTab />}
          {activeTab === "security"     && <SecurityTab      saved={saved} onSave={handleSave} />}
        </div>
      </div>
    </div>
  );
}
