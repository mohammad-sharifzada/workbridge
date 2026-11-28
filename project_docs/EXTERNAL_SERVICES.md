# Externe Dienste & Go-Live – WorkBridge

## Bereits implementiert (Code)

| Funktion | Status | Technik |
|----------|--------|---------|
| Nachrichten & Unterhaltungen | ✅ | Prisma `Conversation` / `Message` |
| Jobangebote annehmen/ablehnen | ✅ | `JobOffer` + Status |
| „In meine Sprache übersetzen“ | ✅ Code | DeepL API (Key nötig) |
| Unternehmensprofil + Verifizierung | ✅ | `verificationStatus`, Logo, Branche… |
| Unternehmensseite + Karte | ✅ | OpenStreetMap Embed (kostenlos) |
| Navigation zum Standort | ✅ | Link Google Maps / OSM |
| Einfache Jobdarstellung | ✅ | Icon-Zeilen + simpleWhat/Need i18n |
| Match-% + Gründe | ✅ | Matching-Engine |
| Bewertungen nur nach Zusammenarbeit | ✅ | angebot ACCEPTED + Moderation |
| Keine erfundenen Firmendaten in Prod | ✅ | `isDemoData` + Verifizierungspflicht |

## Noch einzurichten (Betrieb)

### 1) DeepL Übersetzung
- **Wofür:** Freitext-Nachrichten „In meine Sprache übersetzen“
- **Schnittstelle:** DeepL API (`DEEPL_API_KEY`)
- **Kosten:** Free-Kontingent begrenzt; Pro ab ca. nutzungsbasiert (siehe deepl.com/pro)
- **Datenschutz:** Nachrichteninhalt wird an DeepL gesendet → AVV/DPA, Zweckbindung, EU-Option prüfen
- **Hinweis UI:** Automatische Übersetzung ist **nicht rechtlich verbindlich** (bereits implementiert)
- **Einschränkung:** Persisch (fa) wird von DeepL oft nicht unterstützt → klare Fehlermeldung im UI

### 2) OpenStreetMap / Karten
- **Wofür:** Unternehmensstandort, Route
- **Schnittstelle:** OSM Embed + Deeplinks (kein Key)
- **Kosten:** kostenlos (Fair Use / eigener Tile-Server bei hohem Traffic empfohlen)
- **Recht:** ODbL-Attribution (Hinweis ist im UI)

### 3) Unternehmens-Verifizierung (Produktion)
- **Wofür:** Keine Fake-Firmen
- **Aktuell:** Status `PENDING` / `VERIFIED`; Self-Verify nur wenn `ALLOW_SELF_VERIFY=true` (nur Dev!)
- **Noch nötig:** Admin-Review-UI oder manueller Prozess; optional Handelsregister-API (kostenpflichtig, rechtlich prüfen)
- **Nicht tun:** Mitarbeiterzahlen oder Adressen erfinden

### 4) SMS (Twilio)
- wie zuvor: `SMS_PROVIDER=twilio` + Credentials

### 5) PostgreSQL + Hosting
- Vercel + Managed Postgres (Neon/Supabase)

## Demo-Daten
Seed-Firmen haben `isDemoData: true` und Badge „Demo-Daten“.  
In Produktion: Seed nicht deployen bzw. leere DB; nur verifizierte echte Unternehmen.

## Umgebungsvariablen (.env)
```
DEEPL_API_KEY=           # für Nachrichtenübersetzung
ALLOW_SELF_VERIFY=true   # NUR lokal – Firma selbst freischalten
DATABASE_URL=file:./dev.db
AUTH_SECRET=...
```
