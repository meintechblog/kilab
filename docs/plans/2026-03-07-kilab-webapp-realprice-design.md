# Kilab Webapp Real Price Design

**Date:** 2026-03-07

## Goal
Die bestehende Strompreis-Webapp soll neben Boersenpreisen auch einen realistischeren Endkundenpreis fuer Schwäbisch Hall darstellen und mehrere sinnvolle Flex-Tarif-Szenarien vergleichen.

## Approach
- Boersenpreise bleiben die Basiserie aus der bestehenden Datenbank.
- Eine neue Kosten-Engine addiert lokale Preisbestandteile fuer Schwäbisch Hall und Tibber-typische Flexkosten.
- Die UI berechnet und vergleicht mehrere Szenarien auf Basis derselben Viertelstundenpreise.
- Eine Monatskosten-Schaetzung nutzt ein normiertes H0-Standardlastprofil fuer ein 3-Personen-Haus mit 3.500 kWh Jahresverbrauch.

## Pricing Model
Variable Bestandteile:
- Spotpreis DE-LU
- Tibber Beschaffungskosten 2,15 ct/kWh
- Netzentgelt-Arbeitspreis nach Szenario
- §19 StromNEV-Aufschlag 1,559 ct/kWh
- KWKG-Umlage 0,446 ct/kWh
- Offshore-Netzumlage 0,941 ct/kWh
- Stromsteuer 2,05 ct/kWh
- Konzessionsabgabe fuer Tarifkunden in Schwäbisch Hall
- 19 % Umsatzsteuer

Fixe Bestandteile:
- Tibber Grundgebuehr 5,99 EUR/Monat
- Netzentgelt-Grundpreis 61,00 EUR/Jahr falls anwendbar
- Messstellenbetrieb je Zaehlertyp/Szenario
- optionale zusaetzliche Mess-/Steuerkosten fuer §14a-Szenarien

## Scenario Set
- Standard: mME, kein §14a
- Smart Meter: iMSys, kein §14a
- §14a Modul 2: separater steuerbarer Zaehlpunkt, reduzierter Arbeitspreis
- §14a Modul 3: iMSys, zeitvariables Netzentgelt mit Niedrig-/Standard-/Hochtarif

## Monthly Estimate
- Profilbasis: BDEW H0 Standardlastprofil fuer 2026
- Jahresverbrauch: 3.500 kWh Default fuer 3-Personen-Haus
- Monatskosten ergeben sich aus skaliertem Viertelstundenverbrauch und dem jeweiligen Realpreisprofil plus anteiligen Fixkosten
- Nicht voll verfuegbare Zukunft im aktuellen Monat wird mit der verfuegbaren Preisstruktur des Monats weitergeschaetzt

## UI
- Szenario-Dropdown mit Vergleichsmodus
- Kennzahlen fuer Spotpreis, Realpreis, Monatskosten und Fixkosten
- Chart mit Spotpreis plus einer oder mehreren Realpreislinien
- Aufschluesselung der Preisbestandteile fuer Transparenz
