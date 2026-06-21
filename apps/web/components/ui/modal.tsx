"use client";

import { useEffect } from "react";
import { X } from "lucide-react";

interface Props {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg";
}

export function Modal({ open, onClose, title, description, children, size = "md" }: Props) {
  useEffect(() => {
    if (!open) return;
    const fn = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", fn);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", fn);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  const w = { sm: "max-w-sm", md: "max-w-lg", lg: "max-w-2xl" }[size];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className={`relative bg-white rounded-[20px] shadow-[0_24px_64px_rgba(0,0,0,.18)] w-full ${w} flex flex-col max-h-[90vh] overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between px-6 py-4 border-b border-dim-100 shrink-0">
          <div>
            <h2 className="font-display text-[16px] font-bold text-dim-900">{title}</h2>
            {description && <p className="text-[12px] text-dim-500 mt-0.5">{description}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-[8px] text-dim-400 hover:text-dim-700 hover:bg-dim-100 transition-colors shrink-0 mt-0.5"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}
