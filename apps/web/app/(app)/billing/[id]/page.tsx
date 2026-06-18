"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import { pt } from "date-fns/locale";
import Link from "next/link";
import { ArrowLeft, Download, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { RecordPaymentSchema, type RecordPaymentDto, type Invoice } from "@cms/types";

async function fetchInvoice(id: string) {
  const res = await fetch(`/api/invoices/${id}`);
  if (!res.ok) throw new Error("Fatura não encontrada");
  return res.json() as Promise<Invoice & { patient: { fullName: string } }>;
}

async function recordPayment(id: string, data: RecordPaymentDto) {
  const res = await fetch(`/api/invoices/${id}/payments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.message ?? "Erro ao registar pagamento");
  }
  return res.json();
}

async function getReceiptUrl(id: string) {
  const res = await fetch(`/api/invoices/${id}/receipt`);
  if (!res.ok) throw new Error("Erro ao obter recibo");
  return res.json() as Promise<{ url: string }>;
}

const STATUS_META: Record<string, { label: string; cls: string; icon: typeof CheckCircle2 }> = {
  draft:          { label: "Rascunho",     cls: "bg-slate-100 text-slate-600",         icon: Clock },
  issued:         { label: "Emitida",      cls: "bg-blue-50 text-blue-700",             icon: Clock },
  partially_paid: { label: "Pag. Parcial", cls: "bg-amber-50 text-amber-700",           icon: Clock },
  paid:           { label: "Paga",         cls: "bg-emerald-50 text-emerald-700",       icon: CheckCircle2 },
  overdue:        { label: "Vencida",      cls: "bg-red-50 text-red-700",               icon: AlertCircle },
  cancelled:      { label: "Cancelada",    cls: "bg-slate-100 text-slate-400",          icon: AlertCircle },
};

const inputCls = "w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-sm";

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const queryClient = useQueryClient();

  const { data: invoice, isLoading } = useQuery({
    queryKey: ["invoice", params.id],
    queryFn: () => fetchInvoice(params.id),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<RecordPaymentDto>({
    resolver: zodResolver(RecordPaymentSchema),
    defaultValues: { method: "cash" },
  });

  const payMutation = useMutation({
    mutationFn: (data: RecordPaymentDto) => recordPayment(params.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invoice", params.id] });
      queryClient.invalidateQueries({ queryKey: ["invoices"] });
      reset();
    },
  });

  const receiptMutation = useMutation({
    mutationFn: () => getReceiptUrl(params.id),
    onSuccess: ({ url }) => window.open(url, "_blank"),
  });

  if (isLoading) {
    return (
      <div className="max-w-3xl space-y-6 animate-pulse">
        <div className="w-24 h-4 bg-slate-100 rounded-lg" />
        <div className="bg-white rounded-2xl border border-slate-200 h-96" />
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-red-600">Fatura não encontrada.</p>
      </div>
    );
  }

  const amountDue = Number(invoice.total) - Number(invoice.amountPaid);
  const statusMeta = STATUS_META[invoice.status];
  const StatusIcon = statusMeta?.icon ?? Clock;
  const paidPercent = invoice.total > 0
    ? Math.min(100, Math.round((Number(invoice.amountPaid) / Number(invoice.total)) * 100))
    : 0;

  return (
    <div className="max-w-3xl space-y-6">
      {/* Nav + actions */}
      <div className="flex items-center justify-between">
        <Link
          href="/billing"
          className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Faturação
        </Link>
        <button
          onClick={() => receiptMutation.mutate()}
          disabled={receiptMutation.isPending}
          className="inline-flex items-center gap-2 border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-sm font-medium px-4 py-2 rounded-xl shadow-sm transition-colors cursor-pointer disabled:opacity-60"
        >
          <Download className="w-4 h-4" />
          {receiptMutation.isPending ? "A obter…" : "Recibo PDF"}
        </button>
      </div>

      {/* Invoice card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="px-6 py-6 border-b border-slate-200">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-1">Fatura</p>
              <h1 className="text-2xl font-bold text-slate-900 font-mono">{invoice.invoiceNumber}</h1>
              <p className="text-sm text-slate-500 mt-1">{invoice.patient.fullName}</p>
              {invoice.issuedAt && (
                <p className="text-xs text-slate-400 mt-0.5">
                  {format(new Date(invoice.issuedAt), "d 'de' MMMM 'de' yyyy", { locale: pt })}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-slate-900 tabular-nums">
                {Number(invoice.total).toLocaleString("pt-CV")}
                <span className="text-base font-normal text-slate-500 ml-1">CVE</span>
              </p>
              {amountDue > 0 && (
                <p className="text-sm text-red-600 font-medium mt-0.5">
                  Em dívida: {amountDue.toLocaleString("pt-CV")} CVE
                </p>
              )}
              <div className="mt-2 inline-flex items-center gap-1.5">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${statusMeta?.cls}`}>
                  <StatusIcon className="w-3.5 h-3.5" />
                  {statusMeta?.label ?? invoice.status}
                </span>
              </div>
            </div>
          </div>

          {/* Progress bar */}
          {paidPercent > 0 && paidPercent < 100 && (
            <div className="mt-4">
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>{paidPercent}% pago</span>
                <span>{(100 - paidPercent)}% em dívida</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
                  style={{ width: `${paidPercent}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Line items */}
        <div className="px-6 py-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="text-left py-2 pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrição</th>
                <th className="text-right py-2 pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Qtd.</th>
                <th className="text-right py-2 pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Preço Unit.</th>
                <th className="text-right py-2 pb-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {invoice.items?.map((item) => (
                <tr key={item.id}>
                  <td className="py-3 text-sm text-slate-900">{item.description}</td>
                  <td className="py-3 text-right text-sm text-slate-600 tabular-nums">{item.quantity}</td>
                  <td className="py-3 text-right text-sm text-slate-600 tabular-nums">{Number(item.unitPrice).toLocaleString("pt-CV")} CVE</td>
                  <td className="py-3 text-right text-sm font-semibold text-slate-900 tabular-nums">{Number(item.total).toLocaleString("pt-CV")} CVE</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="border-t border-slate-200">
                <td colSpan={3} className="py-3 text-sm font-semibold text-slate-700 text-right pr-4">Total</td>
                <td className="py-3 text-right text-sm font-bold text-slate-900 tabular-nums">{Number(invoice.total).toLocaleString("pt-CV")} CVE</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Payments */}
        {invoice.payments && invoice.payments.length > 0 && (
          <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50">
            <h3 className="text-sm font-semibold text-slate-700 mb-3">Pagamentos Registados</h3>
            <div className="space-y-2">
              {invoice.payments.map((p) => (
                <div key={p.id} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-slate-600">
                      {format(new Date(p.paidAt), "d MMM yyyy", { locale: pt })} · <span className="capitalize">{p.method?.replace("_", " ")}</span>
                      {p.reference ? ` · ${p.reference}` : ""}
                    </span>
                  </div>
                  <span className="font-semibold text-emerald-700 tabular-nums">
                    +{Number(p.amount).toLocaleString("pt-CV")} CVE
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Record payment form */}
        {!["paid", "cancelled"].includes(invoice.status) && (
          <form
            onSubmit={handleSubmit((data) => payMutation.mutate(data))}
            className="px-6 py-5 border-t border-slate-200"
          >
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Registar Pagamento</h3>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Valor (CVE) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  {...register("amount", { valueAsNumber: true })}
                  defaultValue={amountDue}
                  className={inputCls}
                />
                {errors.amount && <p className="text-xs text-red-600 mt-1">{errors.amount.message}</p>}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">
                  Método <span className="text-red-500">*</span>
                </label>
                <select {...register("method")} className={inputCls}>
                  <option value="cash">Numerário</option>
                  <option value="bank_transfer">Transferência</option>
                  <option value="health_plan">Plano de Saúde</option>
                  <option value="vinti4">Vinti4</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1.5">Referência</label>
                <input {...register("reference")} className={inputCls} placeholder="Opcional" />
              </div>
            </div>

            {payMutation.error && (
              <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-xs text-red-700">{(payMutation.error as Error).message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={payMutation.isPending}
              className="mt-4 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm disabled:opacity-60 transition-all shadow-sm hover:shadow cursor-pointer"
            >
              {payMutation.isPending ? "A registar…" : "Registar Pagamento"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
