"use client";

import { useTranslations } from "next-intl";
import { MapPin, ExternalLink, Navigation } from "lucide-react";
import styles from "./company-map.module.scss";

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
    <div className={styles.mapPanel}>
      <div className={styles.mapFrame}>
        <iframe
          title={label}
          src={embed}
          className={styles.map}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
      <div className={styles.mapActions}>
        <a
          href={openMaps}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.openMapLink}
        >
          <MapPin className={styles.mapPinIcon} />
          {t("openMap")}
          <ExternalLink className={styles.externalLinkIcon} />
        </a>
        <a
          href={googleNav}
          target="_blank"
          rel="noopener noreferrer"
          className={styles.navigateLink}
        >
          <Navigation className={styles.mapPinIcon} />
          {t("navigate")}
        </a>
      </div>
      <p className={styles.mapSource}>{t("mapSource")}</p>
    </div>
  );
}
