# WorkBridge – Lieferdokumentation (Korso)

## 1. Implementierte Funktionen (Spezifikation)

### Kernablauf Arbeitssuchende
- Registrierung per Telefon + SMS-Verifizierung (Mock mit sichtbarem Demo-Code; Twilio-ready)
- Sprachauswahl: Deutsch, Englisch, Arabisch, Türkisch, Persisch/Dari, Ukrainisch
- Icon-basiertes Onboarding: Fähigkeiten, körperliche Belastbarkeit, Verfügbarkeit, Standort (Stadt + GPS)
- Statusabfrage: Bankkonto, Steuer-ID, Arbeitserlaubnis (Ja / Nein / Unklar)
- Status-System: Grün / Gelb / Rot mit automatischer Bewertung
- Smart Help: Bankkonto, Steuer-ID, Arbeitserlaubnis – Erklärungen, Schritte, Dokumente, Behörden-/Banken-Links
- Visuelles Profil / Lebenslauf (Kurz + Vollansicht)
- Job-Marktplatz (produktartige Karten: Firma, Ort, Lohn, Start, Beschreibung, Anforderungen)
- Matching: Entfernung, Fähigkeiten, Verfügbarkeit, Status → „Passende Jobs für dich“
- Bewerbungen auf Jobs

### Unternehmen
- Registrierung / Login (E-Mail + Passwort)
- Dashboard: Jobs veröffentlichen, Übersicht, Bewerbungsanzahl
- Kandidatenfilter inkl. „nur arbeitsbereit (grün)“
- Kontaktfreischaltung (Credits / Pay-per-Contact-Modell)
- Abo-Status-Felder (Starter/Pro) + Demo-Kreditkauf
- Unternehmens-Verifizierung (Demo: Self-Request → verified)

### Vertrauen & Sicherheit
- Beidseitiges Bewertungssystem (Sterne + Kommentar)
- Meldesystem (Fake, Missbrauch, illegale Arbeit, Spam, Sonstiges)
- Verifizierungsbadge für Unternehmen
- Keine Vermittlung ohne Status-Logik; Hinweis bei fehlender Arbeitserlaubnis

### Rechtliches
- Impressum, Datenschutzerklärung (DSGVO-Grundlage), AGB (Vorlagen, vor Go-Live mit echten Firmendaten ersetzen)

### UX
- Mobile-first, große Buttons, Icon-Navigation, minimale Texte
- RTL für Arabisch und Persisch
- Keine Sprachvermischung: strukturierte i18n-Dateien

---

## 2. Verbesserungen (Korso)

1. **Tri-State bei Statusfragen** („Unklar“) statt nur Ja/Nein – realistisch für Neuankömmlinge.
2. **Lesbare Typografie** (Outfit + Lexend) statt System-Defaults – bessere Lesbarkeit bei wenig Sprachkenntnissen.
3. **Visuelles Marken-Hero** mit klarer Markensignatur WorkBridge als dominante Fläche.
4. **Match-Score in %** sichtbar auf Jobkarten – nachvollziehbare Vorschläge.
5. **Demo-Billing ohne Payment-Provider** (Credits/Abo-Felder), damit Geschäftsmodell sofort testbar ist.
6. **GPS optional + Stadtpflicht** – funktioniert auch ohne Standortfreigabe.
7. **Rechtlicher Hinweis** direkt in der Statusabfrage zur Arbeitserlaubnis.

---

## 3. Zusätzliche Features (Korso)

| Feature | Begründung |
|---------|------------|
| Kontakt-Credits + Unlock | Umsetzt Pay-per-Contact ohne externe Payment-Integration blockierend |
| Seed-Daten mit realistischen Berliner/Hamburger Jobs | Sofort nutzbare Demo ohne leere Marktplatz-Ansicht |
| Health-API `/api/health` | Betriebsbereitschaft / Monitoring |
| Job-Detailseite + Report am Job | Vertrauen & Moderation |
| Auto-Verifizierung (Demo) | Flow testbar, vor Produktivbetrieb durch manuelle Prüfung ersetzen |
| PostgreSQL-ready Schema | Einfacher Wechsel von SQLite → Postgres für Vercel/Cloud |

---

## 4. Grenzen / Go-Live-Checkliste

- [ ] Echte Firmendaten in Impressum / Datenschutz / AGB
- [ ] Twilio (oder anderer SMS-Provider) aktivieren
- [ ] PostgreSQL + Backups
- [ ] Payment-Provider (Stripe) für Credits/Abo
- [ ] Manuelle Unternehmensprüfung statt Auto-Verify
- [ ] Juristische Finalprüfung der Smart-Help-Texte
- [ ] AUTH_SECRET rotieren
- [ ] Rate-Limiting für SMS-Codes

Alle Ergänzungen halten deutsches Recht (keine Förderung illegaler Arbeit) und die Kernidee (Status → Hilfe → Matching) ein.
