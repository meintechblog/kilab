# kilab-webapp

Lokales Dashboard fuer deutsche Viertelstunden-Strompreise mit Day-Ahead-Fokus, Intraday-Zusatzserie, Postgres-Speicher, 14 Tage Backfill, Realpreis-Hochrechnung fuer Schwäbisch Hall und Fixpreis-Vergleich.

## Befehle

### Installieren

```bash
pnpm install
pnpm db:push
pnpm backfill:prices
pnpm cron:install
```

### Dev starten

```bash
HOST=0.0.0.0 PORT=3000 pnpm dev
```

### Build

```bash
pnpm build
```

### Production Start

```bash
pnpm start -- --hostname 0.0.0.0 --port 3000
```

## Hilfreich

```bash
pnpm test
pnpm lint
pnpm sync:prices -- --mode=day-ahead
pnpm sync:prices -- --mode=intraday
```

## Datenstand

- Spotquellen: Energy-Charts Day-Ahead und Intraday
- Realpreis: Day-Ahead plus Tibber-artige Beschaffungskosten, lokale Netzentgelte und Abgaben fuer Schwaebisch Hall
- Lastprofil: BDEW H0, 3-Personen-Haus, 3.500 kWh/Jahr
- Fixpreis-Referenz: 25 ct/kWh Arbeitspreis plus angenommene 12 EUR Grundpreis pro Monat
- UI: dunkles technisches Dashboard, Szenario-Karten, Preiszusammensetzung jetzt, Monatsrechnung erklaert
- Scheduler: 10:47, 12:58, 13:03, 13:10, 15:47, 22:47 (Europe/Berlin)

## Betrieb

- Persistenter Webdienst: `systemd`-Unit unter `ops/systemd/kilab-webapp.service`
- Status: `systemctl status kilab-webapp.service`
- Logs: `journalctl -u kilab-webapp.service -n 100 --no-pager`
- Neustart: `systemctl restart kilab-webapp.service`
