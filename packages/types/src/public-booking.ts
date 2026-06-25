import { z } from "zod";

export const PublicBookingSchema = z.object({
  fullName: z.string().min(2).max(120),
  phone: z.string().min(7).max(20),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Format: YYYY-MM-DD"),
  email: z.string().email().optional(),
  gender: z.enum(["male", "female", "other"]).default("other"),
  serviceId: z.string().uuid(),
  staffId: z.string().uuid(),
  scheduledAt: z.string().datetime({ offset: true }),
  notes: z.string().max(500).optional(),
  consentGiven: z.literal(true, {
    errorMap: () => ({ message: "O consentimento é obrigatório" }),
  }),
});

export type PublicBookingDto = z.infer<typeof PublicBookingSchema>;
