"use client";

import { useQuery } from "@tanstack/react-query";

type Entry = { id: number; valor: string; codigo: string | null };

export function ParametroSelect({
  nome,
  value,
  onChange,
  placeholder,
  className,
}: {
  nome: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const { data = [] } = useQuery<Entry[]>({
    queryKey: ["parametrizacao", nome],
    queryFn: () => fetch(`/api/parametrizacao/${nome}`).then(r => r.json()),
    staleTime: 120_000,
  });

  return (
    <select value={value} onChange={e => onChange(e.target.value)} className={className}>
      {placeholder && <option value="">{placeholder}</option>}
      {data.map(e => (
        <option key={e.id} value={e.codigo ?? e.valor}>{e.valor}</option>
      ))}
    </select>
  );
}
