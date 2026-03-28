// lib/tuvi/validation.ts
// Zod v4 schema for the user input form.
// CRITICAL: Uses Zod v4 syntax — NOT v3.
// v4 breaking changes:
//   - error messages: { error: 'msg' } not { message: 'msg' } or required_error
//   - error access: result.error.issues (not result.error.errors)
//   - z.record() requires TWO type args in v4

import { z } from 'zod';
import type { BirthInput } from './types';

// ── Form schema ────────────────────────────────────────────────────────────────

export const InputFormSchema = z.object({
  birthYear: z
    .number({ error: 'Birth year is required' })
    .int()
    .min(1967, { error: 'Year must be 1967 or later' })
    .max(2025, { error: 'Year must be 2025 or earlier' }),
  birthMonth: z
    .number({ error: 'Birth month is required' })
    .int()
    .min(1, { error: 'Month must be 1–12' })
    .max(12, { error: 'Month must be 1–12' }),
  birthDay: z
    .number({ error: 'Birth day is required' })
    .int()
    .min(1, { error: 'Day must be 1–31' })
    .max(31, { error: 'Day must be 1–31' }),
  birthHour: z
    .number()
    .int()
    .min(0)
    .max(23)
    .optional(), // D-01: optional — null means "use Giờ Ngọ default" in calculation engine
  birthMinute: z
    .number()
    .int()
    .min(0)
    .max(59)
    .optional(), // Collected with hour but only hour index is used for giờ block
  gender: z.enum(['M', 'F'], { error: 'Please select a gender' }),
  birthplace: z
    .string({ error: 'Birthplace is required' })
    .min(2, { error: 'Enter a city or region (2+ characters)' })
    .max(100),
  decision: z
    .string({ error: 'Life decision is required' })
    .min(10, { error: 'Describe your decision (10+ characters)' })
    .max(500, { error: 'Keep your decision under 500 characters' }),
});

export type InputFormData = z.infer<typeof InputFormSchema>;

// ── Helpers ────────────────────────────────────────────────────────────────────

// Parse "HH:MM" string → { hour, minute } numbers.
// Returns null values if empty or unparseable.
export function parseTimeString(timeStr: string): { hour: number | null; minute: number | null } {
  if (!timeStr || timeStr.trim() === '') return { hour: null, minute: null };
  const parts = timeStr.split(':');
  const hour = parseInt(parts[0] ?? '', 10);
  const minute = parseInt(parts[1] ?? '0', 10);
  if (isNaN(hour) || hour < 0 || hour > 23) return { hour: null, minute: null };
  return { hour, minute: isNaN(minute) ? 0 : minute };
}

// Derive UTC offset from birthplace text.
// Vietnam is uniformly UTC+7. Default = +7 for all inputs (D-12 decision:
// birthplace is used for timezone derivation only in Phase 1).
export function birthplaceToOffset(birthplace: string): number {
  const normalized = birthplace.toLowerCase().trim();
  const VN_INDICATORS = [
    'việt', 'viet', 'hanoi', 'hà nội', 'saigon', 'sài gòn',
    'hồ chí minh', 'ho chi minh', 'đà nẵng', 'da nang',
    'hải phòng', 'cần thơ',
  ];
  if (VN_INDICATORS.some((indicator) => normalized.includes(indicator))) {
    return 7;
  }
  // Default: Vietnam UTC+7 (Phase 1 simplification — full geo lookup deferred)
  return 7;
}

// Convert validated InputFormData → typed BirthInput for calculateChart.
// Accesses result.error.issues (Zod v4 — NOT result.error.errors).
export function formDataToBirthInput(data: InputFormData): BirthInput {
  return {
    solarDate: {
      year: data.birthYear,
      month: data.birthMonth,
      day: data.birthDay,
    },
    hour: data.birthHour ?? null, // null → calculation engine defaults to Giờ Ngọ (index 6)
    gender: data.gender,
    birthplace: data.birthplace,
    timezoneOffset: birthplaceToOffset(data.birthplace),
    decision: data.decision,
  };
}
