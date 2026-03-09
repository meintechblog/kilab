# Data Sources And Modelling

## Market Sources

The dashboard currently relies on:
- `Energy-Charts` day-ahead data
- `Energy-Charts` intraday data

These sources provide the quarter-hour market baseline used throughout the project.

## What Is Stored

Imported data is normalized and stored as quarter-hour points with explicit start and end timestamps.

Stored categories currently include:
- day-ahead quarter-hour prices
- intraday quarter-hour prices
- sync run metadata for traceability

## Local End-Customer Modelling

The project does not stop at exchange prices. It derives a more realistic household-facing price for Schwaebisch Hall.

The real-price layer includes:
- market spot price
- Tibber-like procurement cost component
- local network fee assumptions
- taxes, levies, and concession charge
- VAT
- scenario-specific metering and network treatment

## Scenario Model

The app currently compares multiple household scenarios, including:
- standard meter / mME
- smart meter / iMSys
- blended `§14a Modul 2`
- blended `§14a Modul 3`

These are used for chart overlays, current price comparison, and monthly cost projection.

## Fixed Tariff Reference

The dashboard also keeps a simple fixed-price benchmark in view:
- `25 ct/kWh` work price
- `12 EUR/month` assumed base fee

This is not treated as a supplier integration. It is a user-provided reference for practical comparison.

## Load Profile Assumption

Monthly cost estimation uses:
- `BDEW H0`
- `3-person house`
- `3,500 kWh/year`

That gives the dashboard a plausible demand profile for turning quarter-hour prices into a monthly estimate.

## Boundaries

Important distinction:
- market prices are source-backed imports
- local real-price logic is a modelling layer
- the fixed tariff is a comparison assumption

That split is intentional and should stay visible in the UI and documentation.
