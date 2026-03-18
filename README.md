# VokabelFuchs

Eine Vokabel-Lern-App fur Kinder, gebaut mit dem Leitner-Karteikasten-System. Eltern verwalten Vokabeln und Facher, Kinder lernen mit einem spielerischen Multiple-Choice- oder Freitext-Modus und verdienen Medienzeit.

## Features

- **Facher & Cluster** — Eltern legen Facher an (z.B. "Englisch Klasse 4"), gruppieren Vokabeln in Clustern (Tags) und weisen Kinder gezielt Clustern zu
- **Leitner-System** — 5-Facher-Karteikasten: richtig = nachstes Fach, falsch = zuruck zu Fach 1
- **Trainings-Modi** — Multiple Choice und Freitext (mit Levenshtein-Toleranz)
- **Medienzeit-System** — Kinder verdienen Gaming- und YouTube-Zeit durch Lernen (konfigurierbar pro Elternteil)
- **Mehrsprachig** — Deutsch ↔ Englisch und Deutsch ↔ Franzosisch
- **Kinder-PIN-Auth** — Kinder loggen sich mit 4-stelligem PIN ein, kein Passwort notig
- **Statistiken** — Trainingslog mit Datum, Cluster, Lernerfolg; Pro-Cluster-Korrektrate

## Tech Stack

| Schicht | Technologie |
|---|---|
| Backend | Laravel 11 + PHP 8.3 |
| Frontend | React 18 + TypeScript + Inertia.js |
| Datenbank | PostgreSQL 16 |
| UI | Tailwind CSS v4 + shadcn/ui |
| Auth (Eltern) | Laravel Breeze (Session) |
| Auth (Kinder) | 4-stelliger PIN (custom) |
| Hosting | Coolify auf Hetzner |

## Setup (Entwicklung)

### Voraussetzungen

- Docker + Docker Compose
- Node.js 20+
- PHP 8.3 + Composer

### Installation

```bash
# Repository klonen
git clone https://github.com/roberteinsle/VokabelFuchs.git
cd VokabelFuchs

# PHP-Abhangigkeiten
composer install

# Node-Abhangigkeiten
npm install

# Umgebungsvariablen
cp .env.example .env
php artisan key:generate

# Datenbank (PostgreSQL via Docker)
docker-compose up -d

# Migrationen + Demo-Daten
php artisan migrate
php artisan db:seed --class=DemoSeeder

# Frontend bauen
npm run build
```

### Entwicklungs-Server

```bash
php artisan serve
npm run dev   # Vite dev server (Hot Reload)
```

## Demo-Zugangsdaten

| Rolle | Login | Passwort/PIN |
|---|---|---|
| Elternteil | jr@einsle.com | 7U9%!7#MehZSqkjherTK8u |
| Kind Tobias | PIN | 1234 |
| Kind Jonas | PIN | 5678 |

## Tests

```bash
php artisan test
```

Aktuell: 55 Tests (Unit + Feature), alle grun.

## Projektstruktur

```
app/
  Http/Controllers/      # Laravel Controller (Eltern + Kind)
  Models/                # Eloquent Models
  Services/              # LeitnerService, MediaTimeService, TrainingService
  Policies/              # Authorization
resources/
  js/
    pages/               # Inertia-Seiten (React/TSX)
    components/          # Wiederverwendbare Komponenten
    types/               # TypeScript-Interfaces
database/
  migrations/            # Datenbankstruktur
  seeders/               # Demo-Daten
```

## Lizenz

Privates Projekt — alle Rechte vorbehalten.
