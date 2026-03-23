const STORAGE_KEY = "3dPacking_packCalc_usageCount";

/** Máximo de cálculos exitosos permitidos; `null` = sin límite (env vacío o inválido). */
export function getPackCalcMaxUses(): number | null {
  const raw = import.meta.env.VITE_PACK_CALC_MAX_USES?.trim();
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n <= 0) return null;
  return n;
}

export function getPackCalcUsageCount(): number {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v == null) return 0;
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) && n >= 0 ? n : 0;
  } catch {
    return 0;
  }
}

/** Suma 1 tras un `submitPack` exitoso. */
export function incrementPackCalcUsage(): void {
  const next = getPackCalcUsageCount() + 1;
  try {
    localStorage.setItem(STORAGE_KEY, String(next));
  } catch {
    /* quota / modo privado */
  }
}

export function isPackCalcLimitReached(): boolean {
  const max = getPackCalcMaxUses();
  if (max == null) return false;
  return getPackCalcUsageCount() >= max;
}
