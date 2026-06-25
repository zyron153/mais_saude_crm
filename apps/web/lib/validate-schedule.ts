export function validateScheduledAt(value: string): string | null {
  const d = new Date(value);
  if (isNaN(d.getTime())) return "Data e hora inválidas.";
  if (d.getDay() === 0) return "Agendamentos não disponíveis ao domingo.";
  const hour = d.getHours();
  if (hour < 8 || hour >= 19)
    return "Horário de atendimento: 08h00 – 18h59, de segunda a sábado.";
  return null;
}

// Checks only the calendar day (for date pickers before a slot is chosen).
// Adds T12:00:00 so the Date is parsed as local noon, avoiding midnight UTC edge cases.
export function isWeekday(dateStr: string): boolean {
  const d = new Date(`${dateStr}T12:00:00`);
  return !isNaN(d.getTime()) && d.getDay() !== 0;
}
