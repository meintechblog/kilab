# Decision Dashboard Design

## Goal
- Turn the electricity dashboard from a price viewer into a decision surface.
- Answer the questions a household actually has in a few seconds: whether flex is currently cheaper than the fixed tariff, how large the spread is, and which upcoming windows are best for shifting consumption.

## Product Direction
- Keep the current dark technical visual system.
- Preserve the existing data model and tariff logic for Schwäbisch Hall.
- Add decision support above and below the chart instead of adding more generic chrome.

## Recommended Approach
- Build a compact advisory layer derived from existing `chartRows`, `scenarioSummaries`, and `fixedPriceReference`.
- Surface simple high-value outputs:
  - `Jetzt besser als Fix` / `Jetzt teurer als Fix`
  - current spread in `ct/kWh`
  - projected monthly delta versus fixed tariff
  - cheapest upcoming time windows for the active scenario
  - strongest savings window over the next day
- Keep the chart central, but make the line set controllable and easier to read on desktop and mobile.

## Data and Logic
- Derive advisory data from already available dashboard payload instead of adding a new backend roundtrip.
- For the active scenario, compute:
  - current real price versus fixed tariff delta
  - next 24h cheapest windows using scenario real price if available, otherwise fall back to spot-derived values already present in `realPriceByScenario`
  - best contiguous windows for practical actions such as appliance runs
  - current monthly delta against fixed tariff using existing monthly projections
- Treat gaps conservatively: if no future values exist, show a compact unavailable state instead of invented advice.

## UX Structure
- Add a `Jetzt entscheiden` strip above the chart with three to four compact decision cards.
- Keep scenario cards as the main control surface, but enrich each card with a clear signal such as monthly delta versus fix.
- Add chart controls that let the user hide or show key series without leaving the chart area.
- Add a `Beste Zeitfenster` panel below the chart with practical windows for `heute` and `naechste 24h`.
- Keep the existing price breakdown and monthly explanation, but make them work together with the active advisory state.

## Error Handling
- If a current value is missing, advisory cards fall back to `-` and explanatory copy instead of failing the whole page.
- If no forward-looking data exists, best-window cards render an explicit `keine zukunftsdaten` state.
- Existing dashboard rendering remains functional even if advisory derivation returns partial data.

## Testing Strategy
- Add unit tests for advisory derivation logic first.
- Add render tests for the new decision panels and chart-control copy.
- Re-run the existing full verification path: `pnpm test`, `pnpm lint`, `pnpm build`, plus an HTTP check against the running service.
