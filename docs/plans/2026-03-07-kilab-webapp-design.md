# Kilab Webapp Design

**Date:** 2026-03-07

## Goal
Eine lokal im LXC laufende Web-App zeigt den aktuellen deutschen Boersenstrompreis mit Fokus auf Day-Ahead-Viertelstundenpreisen und einer zusaetzlichen Intraday-Serie, inklusive Wochen-Chart mit Historie und vorhandener Zukunft.

## Architecture
- Next.js App Router als Full-Stack-Web-App unter `/root/projects/kilab-webapp`
- Postgres als lokale Datenbank fuer Preisserien, Preiswerte und Sync-Laeufe
- Serverseitiger Import aus oeffentlichen Viertelstunden-Datenquellen
- UI liest aus der lokalen DB und zeigt Sync-Status, aktuellen Preis und Chart

## Data Source
- Primaere Quelle: Energy-Charts static JSON/API fuer `Day Ahead Auction (DE-LU)` sowie oeffentlich verfuegbare Intraday-Viertelstundenserien aus dem Spot-Market-Chart-Datensatz
- Day-Ahead bleibt die Primaerserie
- Abrufzeiten werden nach offiziellen EPEX-Zeiten frueh gesetzt, mit Wiederholungen zur Absicherung

## Data Model
- `market_price_series`: Serien-Metadaten
- `market_price_points`: Viertelstundenpunkte mit Zeitbereich und Preiswerten
- `sync_runs`: Protokollierung der Importe

## Sync Strategy
- Initialer Backfill fuer die letzten 14 Tage
- Wiederkehrende Imports fuer einen rollierenden Korridor von 7 Tagen zurueck bis 7 Tage vor
- Scheduler fuer fruehe Day-Ahead- und Intraday-Zeitpunkte mit idempotenten Upserts

## UI
- Hero mit aktuellem Day-Ahead-Preis und daneben Intraday-Status
- Chart fuer 7 Tage Rueckblick plus Zukunft bis zum letzten vorhandenen Preis
- Serien farblich getrennt und klar beschriftet
- Hinweis auf letzte erfolgreiche Synchronisation und Datenfrische
