import { getRequestConfig } from "next-intl/server";
import { messages } from "@/project_workbridge_main";
import { defaultLocale, isLocale } from "@/prog_configs/localization_config";

export default getRequestConfig(async ({ requestLocale }) => {
  const requestedLocale = await requestLocale;
  const locale = requestedLocale && isLocale(requestedLocale) ? requestedLocale : defaultLocale;

  return {
    locale,
    messages: messages[locale],
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
