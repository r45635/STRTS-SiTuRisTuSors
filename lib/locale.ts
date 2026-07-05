const LOCALE_KEY = "strts_locale";

export type Locale = "fr" | "en";

export function obtenirLocale(): Locale {
  if (typeof document === "undefined") return "fr";
  const match = document.cookie.match(new RegExp(`(?:^|; )${LOCALE_KEY}=([^;]*)`));
  return (match?.[1] as Locale) ?? "fr";
}

export function changerLocale(locale: Locale): void {
  document.cookie = `${LOCALE_KEY}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
  window.location.reload();
}
