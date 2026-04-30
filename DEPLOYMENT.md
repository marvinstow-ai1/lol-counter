# Deployment Guide — Rift Counter

Step-by-step. Estimated total time: **~15 minutes**.

---

## 1. Supabase einrichten

### 1.1 Projekt anlegen
1. Gehe zu https://supabase.com → **Sign in** (mit GitHub) → **New Project**.
2. Name: `lol-counter` (oder beliebig).
3. **Database password**: ein sicheres Passwort generieren und speichern.
4. **Region**: nimm die nächste zu deinen Nutzern (für DE: `Frankfurt`).
5. **Create new project** klicken — Setup dauert ~1–2 Min.

### 1.2 Schema erstellen
1. Wenn das Projekt fertig ist, links auf **SQL Editor** klicken → **New query**.
2. Inhalt von [`supabase/schema.sql`](./supabase/schema.sql) reinkopieren.
3. **Run** klicken (oder `Ctrl/Cmd + Enter`).
4. Erwartete Ausgabe: `Success. No rows returned`.

### 1.3 Seed-Daten einspielen
1. Im SQL Editor → **New query**.
2. Inhalt von [`supabase/seed.sql`](./supabase/seed.sql) reinkopieren.
3. **Run** klicken.
4. Erwartete Ausgabe: ein paar `INSERT ... rows` Zeilen.

### 1.4 API-Keys notieren
1. Links auf **Project Settings** (⚙️) → **API**.
2. Du brauchst zwei Werte:
   - `Project URL`  → wird **NEXT_PUBLIC_SUPABASE_URL**
   - `anon` `public` key → wird **NEXT_PUBLIC_SUPABASE_ANON_KEY**

> ⚠️ Den `service_role` key niemals im Frontend benutzen — wir nutzen nur den `anon` key (Read-only via RLS-Policy).

---

## 2. Lokal testen (optional aber empfohlen)

```bash
git clone https://github.com/<dein-user>/lol-counter
cd lol-counter
npm install
cp .env.example .env.local
```

`.env.local` öffnen und ausfüllen:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xyz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
```

Dann:

```bash
npm run dev
```

Browser auf http://localhost:3000 — du solltest die App sehen und nach z.B. *Yasuo* suchen können.

---

## 3. Vercel-Deployment

### 3.1 Repo verbinden
1. https://vercel.com → **Sign in** (mit GitHub).
2. **Add New… → Project**.
3. Dein GitHub-Repo `lol-counter` auswählen → **Import**.
4. **Framework Preset**: Vercel sollte automatisch *Next.js* erkennen.
5. **Root Directory**: `./` (Default).

### 3.2 Environment Variables setzen
Im Import-Screen **Environment Variables** ausklappen und beide hinzufügen:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | (aus Schritt 1.4) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | (aus Schritt 1.4) |

### 3.3 Deployen
1. **Deploy** klicken — Build dauert ~1–2 Min.
2. Wenn fertig: **Visit** → deine App ist live unter `https://<projektname>.vercel.app`.

---

## 4. Updates pushen

Jeder `git push` auf den Branch `main` (oder den verbundenen Branch) löst automatisch ein neues Vercel-Deployment aus. Pull-Requests bekommen automatisch Preview-URLs.

---

## 5. Counter-Daten erweitern oder aktualisieren

Du hast zwei Wege:

**A) Per SQL Editor (für gelegentliche Updates)**
1. Supabase → SQL Editor → New query.
2. Z.B.:
   ```sql
   insert into counters (champion_id, counter_id, counter_role, win_rate, tier, notes, patch)
   values ('Aatrox','Fiora','TOP',54.5,'A','Parry kontert Q3','14.X');
   ```
3. Run.

**B) Per Table Editor (UI)**
1. Supabase → **Table Editor** → `counters` → **Insert row**.

> Champion-IDs müssen exakt mit Data Dragon übereinstimmen (z.B. `MasterYi`, `Kaisa`, `KogMaw`). Schau bei Bedarf in https://ddragon.leagueoflegends.com/cdn/14.X.X/data/en_US/champion.json nach.

---

## 6. Auto-Update bei neuem Patch (optional)

Riot Data Dragon liefert automatisch die neueste Version — die App hat dafür einen 12-Stunden-Cache. Du musst also **nichts** manuell tun, wenn ein neuer Patch rauskommt; lediglich deine Counter-Notizen / Win-Rates können veralten und sollten manuell oder per Cron-Job aktualisiert werden.

Für einen automatischen Cron via Supabase Edge Function: lass mich wissen, ich baue das gerne nach.

---

## Troubleshooting

| Problem | Lösung |
|---|---|
| `Missing NEXT_PUBLIC_SUPABASE_URL` Warning | Env-Vars in Vercel **Project Settings → Environment Variables** prüfen. Nach Änderung: **Redeploy** triggern. |
| Counter-Liste leer | `seed.sql` wurde nicht ausgeführt, oder RLS blockiert. Prüfe in Supabase Table Editor, ob `counters` Zeilen enthält. |
| 404 bei Champion-Bildern | Data Dragon ID falsch geschrieben. `MasterYi` (kein Space), `Kaisa` (kein Apostroph). |
| Build failed in Vercel | Logs anschauen. Häufigster Grund: `npm install` schlägt fehl wegen Node-Version → in Project Settings → General → Node.js Version auf `20.x`. |
