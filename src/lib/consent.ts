/**
 * Cookie consent, remembered for 12 months. Nothing third-party loads unless this says 'accepted'.
 * Stored as { value, exp } where exp is a ms timestamp.
 */
const KEY = 'cookie-consent';
const YEAR_MS = 365 * 24 * 3600 * 1000;

export type Consent = 'accepted' | 'declined' | null;

export function getConsent(): Consent {
  try {
    const v = JSON.parse(localStorage.getItem(KEY) || 'null');
    if (v && v.exp > Date.now() && (v.value === 'accepted' || v.value === 'declined')) return v.value;
  } catch {}
  return null;
}

export function setConsent(value: 'accepted' | 'declined') {
  try {
    localStorage.setItem(KEY, JSON.stringify({ value, exp: Date.now() + YEAR_MS }));
  } catch {}
  window.dispatchEvent(new Event('darkroom:consent'));
}

/** Re-open the cookie bar (footer "Cookie settings"). */
export const openConsent = () => window.dispatchEvent(new Event('darkroom:consent-open'));
