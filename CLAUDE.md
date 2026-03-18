# VokabelFuchs – Claude Code Instructions

## Tech Stack
- **Backend:** Laravel 11, PHP 8.3
- **Frontend:** React 18 + TypeScript + Inertia.js
- **Datenbank:** PostgreSQL 16 (Tests: SQLite `:memory:`)
- **CSS:** Tailwind CSS v4 (`@tailwindcss/vite` Plugin, kein PostCSS, kein `tailwind.config.js`)
- **UI:** shadcn/ui v4 (base-nova) – verwendet `@base-ui/react`, kein `asChild` prop
- **Auth:** Laravel Breeze (Eltern), PIN-basiert via Session (Kinder)

## Wichtige Konventionen

### Datei-Pfade
- Pages: `resources/js/pages/` (Kleinbuchstaben!) – z.B. `pages/Training/Index.tsx`
- `app.tsx` resolver: `./pages/**/*.tsx`
- `app.blade.php` Vite-Pfad: `resources/js/pages/{$page['component']}.tsx`

### Tailwind CSS v4
- CSS: `@import "tailwindcss"` + `@theme inline { ... }` (CSS-Variablen zu Tailwind-Tokens)
- Kein `tailwind.config.js`
- Plugin in `vite.config.js`: `import tailwindcss from '@tailwindcss/vite'`

### Datenbank / Eloquent
- Pivot-Tabelle Vokabeln↔Tags: `vocabulary_tag` – muss **explizit** angegeben werden: `belongsToMany(Tag::class, 'vocabulary_tag')`
- Laravel generiert sonst alphabetisch `tag_vocabulary` → falsch
- Gleiches gilt für `child_tag`

### Auth-Flow
- Eltern: Laravel Breeze (Session) → `/profiles` → PIN → `session('parent_profile_unlocked', true)`
- Kinder: Profil wählen → PIN → `session('child_id', $child->id)`
- Middleware: `EnsureIsParent` prüft `parent_profile_unlocked`, `EnsureIsChild` prüft `child_id`
- Nach Login immer zuerst zu `/profiles` (Profilauswahl)

### Routen
- Eltern-Bereich: `/parent/*` mit Middleware `['auth', 'verified', 'parent']` → Name: `parent.*`
- Kinder-Bereich: `/child/*` mit Middleware `['auth', 'verified', 'child.auth']` → Name: `child.*`
- Profil-Auswahl: `/profiles/*` mit `['auth', 'verified']`

### Breeze-Redirects
- Nach Login/Register → `parent.dashboard` (nicht `dashboard`)
- Profil-Route: `parent.profile.edit` (nicht `profile.edit`)

## Leitner-System
- Intervalle in `config/leitner.php`: `[1=>0, 2=>2, 3=>5, 4=>10, 5=>30]` Tage
- Fach 1 = 0 Tage (heute fällig)
- Karten werden **nur** für Vokabeln erstellt, die mindestens einen dem Kind zugewiesenen Cluster/Tag haben

## Vokabel-Struktur
- `vocabulary_lists` = Fächer (z.B. "Englisch Klasse 4") mit `language_pair`
- `tags` = Cluster, **pro Fach** (haben `vocabulary_list_id`)
- `child_tag` Pivot = Zuweisung Kinder → Cluster
- FlashCards werden automatisch erstellt wenn Kind einem Cluster zugewiesen wird

## Tests ausführen
```bash
php artisan test
```
- Konfiguration: `phpunit.xml` → SQLite `:memory:`, `SESSION_DRIVER=array`
- 55 Tests (Unit + Feature)

## Build
```bash
npm run build
# oder für Entwicklung:
npm run dev
```

## Datenbank zurücksetzen + Demo-Daten
```bash
php artisan migrate:fresh --seed
```

## Bekannte Fallstricke
- Nach Code-Änderungen immer `npm run build` (kein Hot-Reload in Produktion)
- `language_pair` auf `Child` ist nullable (Kinder können mehreren Fächern mit verschiedenen Sprachen angehören)
- `TrainingSession.tag_id` nullable = Training ohne Cluster-Filter
- Beim Erstellen von Tags muss `vocabulary_list_id` gesetzt sein (unique constraint: `vocabulary_list_id + name`)
- Keine `username`-Spalte auf `children` – Kinder identifizieren sich nur per Name + PIN
