# WorkBridge live auf Netlify (Handy + alle Geräte)

Du kennst Netlify schon – perfekt.  
**Wichtig:** Netlify hostet die App, aber die **Datenbank** brauchst du extra (kostenlos bei **Supabase**).

---

## Übersicht

| Was | Wo |
|-----|-----|
| App (Website) | **Netlify** ← du hast schon ein Konto |
| Datenbank | **Supabase** (kostenlos, 2 Min. Setup) |
| Code | **GitHub** (Netlify holt sich Updates automatisch) |

---

## Schritt 1: Supabase-Datenbank (einmalig, kostenlos)

1. [supabase.com](https://supabase.com) → anmelden
2. **New project** → Name: `workbridge` → Region: **Frankfurt**
3. Warten bis fertig → **Project Settings** → **Database**
4. Unter **Connection string** → **URI** kopieren  
   Format: `postgresql://postgres.xxxx:PASSWORT@aws-0-eu-central-1.pooler.supabase.com:6543/postgres`
5. Passwort einsetzen (wurde beim Anlegen angezeigt)

> Diese URL ist dein `DATABASE_URL` für Netlify.

---

## Schritt 2: Code auf GitHub

Falls noch nicht geschehen:

1. [github.com](https://github.com) → **New repository** → `workbridge`
2. Terminal:

```bash
cd "/Users/user/Job App /workbridge"
git add .
git commit -m "Netlify deploy ready"
git branch -M main
git remote add origin https://github.com/DEIN-NAME/workbridge.git
git push -u origin main
```

---

## Schritt 3: Neues Netlify-Projekt

1. [app.netlify.com](https://app.netlify.com) → **Add new site** → **Import an existing project**
2. **GitHub** wählen → Repo **`workbridge`** auswählen
3. Einstellungen (meist automatisch erkannt):

| Feld | Wert |
|------|------|
| Branch | `main` |
| Build command | `npm run build` |
| Publish directory | *(leer lassen – Netlify macht das für Next.js)* |

4. **Environment variables** (vor dem Deploy!):

| Variable | Wert |
|----------|------|
| `DATABASE_URL` | Supabase Connection String |
| `AUTH_SECRET` | z. B. `workbridge-live-geheim-2026-mindestens-32-zeichen` |
| `NEXT_PUBLIC_APP_URL` | Erst leer – nach Deploy eintragen (Schritt 5) |
| `SMS_PROVIDER` | `mock` |
| `SEED_ON_DEPLOY` | `true` *(nur beim ersten Deploy)* |

5. **Deploy site** klicken (dauert ca. 3–5 Min.)

---

## Schritt 4: Build-Logs prüfen

Unter **Deploys** → aktueller Deploy → **Deploy log**

Erfolg wenn du siehst:
- `Using PostgreSQL schema for production build`
- `Build successful`

Bei Fehler: meist falsches `DATABASE_URL` → Supabase-URL nochmal kopieren.

---

## Schritt 5: URL festlegen

1. Netlify zeigt dir eine URL, z. B. `random-name-123.netlify.app`
2. Optional: **Domain settings** → eigenen Namen wählen, z. B. `workbridge-demo.netlify.app`
3. **Environment variables** → `NEXT_PUBLIC_APP_URL` setzen:
   ```
   https://workbridge-demo.netlify.app
   ```
4. **Trigger deploy** → **Clear cache and deploy site**

---

## Schritt 6: Demo-Daten

Mit `SEED_ON_DEPLOY=true` beim ersten Deploy sind Demo-Jobs und Ahmed schon drin.

Danach **`SEED_ON_DEPLOY` löschen** (sonst Reset bei jedem Deploy).

Falls nötig, einmal lokal:

```bash
DATABASE_URL="postgresql://..." npm run db:seed
```

---

## Deine Live-Links (Handy, Tablet, überall)

Ersetze `DEINE-SITE` durch deine Netlify-URL:

| Zweck | Link |
|--------|------|
| **Alles fertig (Ahmed)** | `https://DEINE-SITE/de/demo/ready` |
| **Von null anfangen** | `https://DEINE-SITE/de/start` |

Funktioniert auf **allen Geräten** – dein Mac kann aus sein.

---

## Updates später

Einfach Code pushen:

```bash
git add .
git commit -m "Update"
git push
```

Netlify baut automatisch neu.

---

## Kurz: Was du brauchst

- ✅ Netlify-Konto (hast du)
- ✅ Supabase (kostenlos, 5 Min.)
- ✅ GitHub-Repo mit dem Code
- ❌ Stripe – nicht nötig
- ❌ Mac muss nicht an sein

---

## Hilfe bei Problemen

| Problem | Lösung |
|---------|--------|
| Build schlägt fehl | `DATABASE_URL` in Netlify prüfen (Supabase-URI mit Passwort) |
| Seite lädt, Login geht nicht | `SEED_ON_DEPLOY=true` setzen und redeployen |
| Demo zeigt alten Stand | **Clear cache and deploy** |
| Links auf Handy gehen nicht | `NEXT_PUBLIC_APP_URL` muss exakt deine Netlify-URL sein |
