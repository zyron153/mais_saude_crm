import { z } from "zod";

const NOME_RE = /^[A-Z][A-Z0-9_]{1,99}$/;

export const CreateParametrizacaoSchema = z.object({
  nome: z.string().regex(NOME_RE, "nome must be SCREAMING_SNAKE_CASE"),
  valor: z.string().min(1).max(191),
  codigo: z.string().max(100).nullable().optional(),
  descricao: z.string().max(255).nullable().optional(),
  ordem: z.number().int().min(0).optional(),
  ativo: z.boolean().optional(),
});
export type CreateParametrizacaoDto = z.infer<typeof CreateParametrizacaoSchema>;

export const UpdateParametrizacaoSchema = z.object({
  valor: z.string().min(1).max(191).optional(),
  codigo: z.string().max(100).nullable().optional(),
  descricao: z.string().max(255).nullable().optional(),
  ordem: z.number().int().min(0).optional(),
  ativo: z.boolean().optional(),
});
export type UpdateParametrizacaoDto = z.infer<typeof UpdateParametrizacaoSchema>;

export interface ParametrizacaoEntry {
  id: number;
  nome: string;
  valor: string;
  codigo: string | null;
  descricao: string | null;
  ordem: number;
  ativo: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ParametrizacaoGroup {
  nome: string;
  count: number;
}
