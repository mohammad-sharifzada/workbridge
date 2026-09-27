"use client";

import { useTranslations } from "next-intl";
import { MapPin, ExternalLink, Navigation } from "lucide-react";

export function CompanyMap({
  latitude,
  longitude,
  label,
}: {
  latitude: number;
  longitude: number;
  label: string;
}) {
  const t = useTranslations("companyPage");
  // OpenStreetMap Embed – kostenlos, kein API-Key
  const bbox = `${longitude - 0.02},${latitude - 0.015},${longitude + 0.02},${latitude + 0.015}`;
  const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${encodeURIComponent(bbox)}&layer=mapnik&marker=${latitude}%2C${longitude}`;
  const openMaps = `https://www.openstreetmap.org/?mlat=${latitude}&mlon=${longitude}#map=15/${latitude}/${longitude}`;
  const googleNav = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-2xl border border-line">
        <iframe
          title={label}
          src={embed}
          className="h-56 w-full"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <a
          href={openMaps}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-secondary !min-h-11 !px-3 !text-sm"
        >
          <MapPin className="h-4 w-4" />
          {t("openMap")}
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
        <a
          href={googleNav}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary !min-h-11 !px-3 !text-sm"
        >
          <Navigation className="h-4 w-4" />
          {t("navigate")}
        </a>
      </div>
      <p className="text-xs text-ink-soft">{t("mapSource")}</p>
    </div>
  );
}
