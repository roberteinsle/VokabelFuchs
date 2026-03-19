# VokabelFuchs — V. 1.0.1

Eine Vokabel-Lern-App für Kinder, gebaut mit dem Leitner-Karteikasten-System. Eltern verwalten Vokabeln und Fächer, Kinder lernen spielerisch und verdienen Medienzeit.

## Features

- **Profilauswahl ohne Login** — Startseite zeigt direkt alle Profile; Zugang per 4-stelligem PIN (kein E-Mail-Passwort nötig)
- **Fächer & Cluster** — Eltern legen Fächer an (z.B. "Englisch Klasse 4"), gruppieren Vokabeln in Clustern und weisen Kinder gezielt Clustern zu
- **Leitner-System** — 5-Fächer-Karteikasten pro Lernmodus: richtig → nächstes Fach, falsch → zurück zu Fach 1
- **Trainings-Modi** — Multiple Choice, Freitext (mit Levenshtein-Toleranz) und Diktat (TTS)
- **Trainingsrichtung** — Vorwärts (DE→EN) und Rückwärts (EN→DE) wählbar
- **Medienzeit-System** — Kinder verdienen Gaming- und YouTube-Zeit durch Lernen (konfigurierbar)
- **Mehrsprachig** — Deutsch ↔ Englisch, Deutsch ↔ Französisch
- **Statistiken** — Trainingslog pro Modus, Korrektrate, Fach-Verteilung
- **Backup** — Export/Import als JSON
- **CSV-Import** — Vokabeln per CSV-Datei importieren

## Tech Stack

| Schicht | Technologie |
|---|---|
| Backend | Laravel 11 + PHP 8.3 |
| Frontend | React 18 + TypeScript + Inertia.js |
| Datenbank | PostgreSQL 16 |
| CSS | Tailwind CSS v4 (kein PostCSS, kein tailwind.config.js) |
| UI | shadcn/ui v4 (base-nova) |
| Auth (Eltern) | PIN-basiert via Session |
| Auth (Kinder) | 4-stelliger PIN |
| Hosting | Coolify (Docker) |

## Auth-Flow

```
/ (Startseite) → Profilauswahl → PIN eingeben → Dashboard
```

- Kein E-Mail-Login erforderlich — Zugang nur per PIN
- Kein Konto vorhanden → "Jetzt registrieren"-Button (einmalige Erstregistrierung per E-Mail)
- Elternteil-PIN schützt den Verwaltungsbereich
- Kinder-PIN gibt Zugang zum Lernbereich

## Setup (Entwicklung)

### Voraussetzungen

- PHP 8.3 + Composer
- Node.js 20+
- PostgreSQL 16

### Installation

```bash
git clone https://github.com/roberteinsle/VokabelFuchs.git
cd VokabelFuchs

composer install
npm install

cp .env.example .env
php artisan key:generate

# Datenbank konfigurieren in .env (DB_HOST, DB_DATABASE, DB_USERNAME, DB_PASSWORD)
php artisan migrate
php artisan db:seed --class=DemoSeeder

npm run build
php artisan serve
```

## Demo-Zugangsdaten (nach DemoSeeder)

| Profil | Typ | PIN |
|---|---|---|
| Demo Elternteil | Elternteil | *(kein PIN gesetzt — direkter Zugang)* |
| Tobias | Kind | 1234 |
| Jonas | Kind | 5678 |

## Tests

```bash
php artisan test
```

55 Tests (Unit + Feature), alle grün.

## Deployment (Coolify)

Die App läuft in einem Docker-Container via `Dockerfile`. Coolify deployed automatisch bei Push auf `main`.

**Pflicht-Umgebungsvariablen in Coolify:**
```
APP_KEY=base64:...        # php artisan key:generate --show
APP_ENV=production
APP_URL=https://deine-domain.de
DB_CONNECTION=pgsql
DB_HOST=...
DB_PORT=5432
DB_DATABASE=...
DB_USERNAME=...
DB_PASSWORD=...
```

## Projektstruktur

```
app/
  Http/Controllers/      # Laravel Controller (Parent + Child + Auth)
  Models/                # Eloquent Models
  Services/              # LeitnerService, MediaTimeService, TrainingService, LevenshteinService
  Middleware/            # EnsureIsParent, EnsureIsChild
resources/
  js/
    pages/               # Inertia-Seiten (React/TSX)
    components/          # Layout, UI-Komponenten, TtsButton
    types/               # TypeScript-Interfaces
database/
  migrations/            # Datenbankstruktur
  seeders/               # DemoSeeder
.github/workflows/
  ci.yml                 # Tests + Lint + Build bei jedem Push
  deploy.yml             # Coolify Webhook bei Push auf main
```

## Lizenz

Privates Projekt — alle Rechte vorbehalten.
