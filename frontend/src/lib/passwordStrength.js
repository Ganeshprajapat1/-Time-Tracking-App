const STRONG_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s]).{8,}$/;

export function isStrongPassword(password) {
  return typeof password === "string" && STRONG_REGEX.test(password);
}

/**
 * @returns {{ score: number; label: string; segments: number; meetsAll: boolean }}
 */
export function evaluatePasswordStrength(password) {
  const p = password || "";
  let met = 0;
  if (p.length >= 8) met += 1;
  if (/[a-z]/.test(p)) met += 1;
  if (/[A-Z]/.test(p)) met += 1;
  if (/\d/.test(p)) met += 1;
  if (/[^A-Za-z0-9\s]/.test(p)) met += 1;

  const score = met;
  const labels = ["", "Too weak", "Weak", "Fair", "Good", "Strong"];
  const label = p.length === 0 ? "" : labels[Math.min(5, met)];

  return {
    score,
    label,
    segments: Math.min(4, Math.max(0, met - 1)),
    meetsAll: STRONG_REGEX.test(p)
  };
}

export { STRONG_REGEX };
