import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const locale = cookieStore.get("strts_locale")?.value ?? "fr";
  const supportedLocales = ["fr", "en"];
  const validLocale = supportedLocales.includes(locale) ? locale : "fr";

  return {
    locale: validLocale,
    messages: (await import(`../messages/${validLocale}.json`)).default,
  };
});
