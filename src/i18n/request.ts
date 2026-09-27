import { getRequestConfig } from "next-intl/server";
import { routing } from "./routing";
import { isLocale } from "./config";

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !isLocale(locale)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
    onError(error) {
      if (error.code === "MISSING_MESSAGE") {
        console.warn("[i18n]", error.message);
        return;
      }
      console.error("[i18n]", error);
    },
    getMessageFallback({ namespace, key }) {
      return namespace ? `${namespace}.${key}` : key;
    },
  };
});
