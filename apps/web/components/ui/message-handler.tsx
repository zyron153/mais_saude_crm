"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type MessageType = "Success" | "Info" | "Warning" | "Error";

interface Message {
  id: string;
  type: MessageType;
  text: string;
}

interface MessageContextValue {
  addMessage: (type: MessageType, text: string) => void;
}

const MessageContext = createContext<MessageContextValue>({ addMessage: () => {} });

export function useMessage() {
  return useContext(MessageContext);
}

const CONFIG: Record<
  MessageType,
  { Icon: LucideIcon; bg: string; border: string; text: string; iconCls: string; ttl: number | null }
> = {
  Success: { Icon: CheckCircle2,  bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-800", iconCls: "text-emerald-500", ttl: 4000 },
  Info:    { Icon: Info,          bg: "bg-brand-50",   border: "border-brand-200",   text: "text-brand-800",   iconCls: "text-brand-500",   ttl: 4000 },
  Warning: { Icon: AlertTriangle, bg: "bg-amber-50",   border: "border-amber-200",   text: "text-amber-800",   iconCls: "text-amber-500",   ttl: 6000 },
  Error:   { Icon: XCircle,       bg: "bg-red-50",     border: "border-red-200",     text: "text-red-800",     iconCls: "text-red-500",     ttl: null  },
};

function Toast({ msg, onDismiss }: { msg: Message; onDismiss: (id: string) => void }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const { Icon, bg, border, text, iconCls, ttl } = CONFIG[msg.type];

  const onDismissRef = useRef(onDismiss);
  useEffect(() => { onDismissRef.current = onDismiss; });

  const dismiss = useCallback(() => {
    setLeaving(true);
    setTimeout(() => onDismissRef.current(msg.id), 300);
  }, [msg.id]);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!ttl) return;
    const t = setTimeout(dismiss, ttl);
    return () => clearTimeout(t);
  }, [ttl, dismiss]);

  const shown = visible && !leaving;

  return (
    <div
      role="alert"
      className={[
        "flex items-start gap-3 w-80 px-4 py-3.5 rounded-[12px] border",
        "shadow-[0_4px_20px_rgba(0,0,0,.13)]",
        "transition-all duration-300 ease-out",
        bg, border,
        shown ? "translate-x-0 opacity-100" : "translate-x-full opacity-0",
      ].join(" ")}
    >
      <Icon className={`w-[18px] h-[18px] shrink-0 mt-0.5 ${iconCls}`} />
      <p className={`flex-1 text-[13px] font-medium leading-snug ${text}`}>{msg.text}</p>
      <button
        onClick={dismiss}
        aria-label="Fechar"
        className={`shrink-0 ${iconCls} opacity-50 hover:opacity-100 transition-opacity`}
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function MessageProvider({ children }: { children: React.ReactNode }) {
  const [messages, setMessages] = useState<Message[]>([]);

  const addMessage = useCallback((type: MessageType, text: string) => {
    setMessages((prev) => [...prev, { id: crypto.randomUUID(), type, text }]);
  }, []);

  const dismiss = useCallback((id: string) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return (
    <MessageContext.Provider value={{ addMessage }}>
      {children}
      <div
        aria-live="polite"
        aria-label="Notificações"
        className="fixed top-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none"
      >
        {messages.map((msg) => (
          <div key={msg.id} className="pointer-events-auto">
            <Toast msg={msg} onDismiss={dismiss} />
          </div>
        ))}
      </div>
    </MessageContext.Provider>
  );
}
