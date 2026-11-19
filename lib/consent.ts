export const CURRENT_CONSENT_VERSION = "2026-11-17-v1";

export function hasCompletedConsent(
  user:
    | {
        consentVersion: string;
        ageRange: string | null;
      }
    | null
    | undefined,
): boolean {
  return Boolean(
    user &&
      user.consentVersion === CURRENT_CONSENT_VERSION &&
      user.ageRange,
  );
}
