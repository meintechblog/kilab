"use client";

import { formatInTimeZone } from "date-fns-tz";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardChartRow } from "@/src/lib/prices/query";
import type { ScenarioId } from "@/src/lib/pricing/types";

type ScenarioOption = {
  id: ScenarioId;
  label: string;
  description: string;
};

const scenarioColors: Record<ScenarioId, string> = {
  standard_mme: "#b45309",
  smart_meter_imsys: "#7c3aed",
  module2_blended: "#0f766e",
  module3_blended: "#be123c",
};

export function PriceChart({
  rows,
  scenarioOptions,
  selectedScenarioId,
  compareScenarioIds,
  availableUntil,
  fixedPriceCtKwh,
  fixedPriceLabel,
}: {
  rows: DashboardChartRow[];
  scenarioOptions: ScenarioOption[];
  selectedScenarioId: ScenarioId;
  compareScenarioIds: ScenarioId[];
  availableUntil: string | null;
  fixedPriceCtKwh: number;
  fixedPriceLabel: string;
}) {
  const selectedScenario = scenarioOptions.find((scenario) => scenario.id === selectedScenarioId);
  const visibleCompareIds = compareScenarioIds.filter((scenarioId) => scenarioId !== selectedScenarioId);
  const chartData = rows.map((row) => ({ ...row, fixedPriceCtKwh }));

  return (
    <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_24px_80px_rgba(14,35,21,0.08)] backdrop-blur">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-800/70">Chart</p>
          <h2 className="mt-2 text-2xl font-semibold text-zinc-950">7 Tage Rueckblick plus verfuegbare Zukunft</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-zinc-600">
            Gruen zeigt den Boersenpreis, Bernstein den aktiven Realpreis. Die gestrichelte rote Linie markiert deinen aktuellen Fixpreis als Referenz.
          </p>
        </div>
        <div className="rounded-[1.25rem] border border-zinc-200/80 bg-zinc-50/90 px-4 py-3 text-sm text-zinc-600">
          <p>Aktiv: <span className="font-semibold text-zinc-950">{selectedScenario?.label ?? selectedScenarioId}</span></p>
          <p className="mt-1">Verfuegbar bis {availableUntil ? formatInTimeZone(availableUntil, "Europe/Berlin", "dd.MM.yyyy HH:mm") : "-"}</p>
        </div>
      </div>
      <div className="h-[460px] w-full">
        <ResponsiveContainer minHeight={340}>
          <LineChart data={chartData} margin={{ top: 10, right: 24, bottom: 10, left: 0 }}>
            <CartesianGrid stroke="rgba(15,59,45,0.08)" strokeDasharray="3 6" />
            <XAxis
              dataKey="timestamp"
              minTickGap={40}
              tickFormatter={(value: string) =>
                new Intl.DateTimeFormat("de-DE", {
                  month: "2-digit",
                  day: "2-digit",
                  hour: "2-digit",
                  minute: "2-digit",
                }).format(new Date(value))
              }
              stroke="rgba(39,39,42,0.6)"
            />
            <YAxis unit=" ct/kWh" stroke="rgba(39,39,42,0.6)" />
            <Tooltip
              formatter={(value: number | string | readonly (string | number)[] | null | undefined) =>
                typeof value === "number" ? `${value.toFixed(2)} ct/kWh` : "-"}
              labelFormatter={(label: unknown) =>
                typeof label === "string" ? formatInTimeZone(label, "Europe/Berlin", "dd.MM.yyyy HH:mm") : "-"}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="dayAheadCtKwh"
              name="Day-Ahead"
              stroke="#166534"
              strokeWidth={3}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="intradayCtKwh"
              name="Intraday"
              stroke="#0f766e"
              strokeDasharray="6 6"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="fixedPriceCtKwh"
              name={fixedPriceLabel}
              stroke="#dc2626"
              strokeDasharray="8 6"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey={`realPriceByScenario.${selectedScenarioId}`}
              name={`Realpreis ${selectedScenario?.label ?? selectedScenarioId}`}
              stroke={scenarioColors[selectedScenarioId]}
              strokeWidth={3}
              dot={false}
              connectNulls
            />
            {visibleCompareIds.map((scenarioId) => {
              const scenario = scenarioOptions.find((entry) => entry.id === scenarioId);
              return (
                <Line
                  key={scenarioId}
                  type="monotone"
                  dataKey={`realPriceByScenario.${scenarioId}`}
                  name={`Vergleich ${scenario?.label ?? scenarioId}`}
                  stroke={scenarioColors[scenarioId]}
                  strokeDasharray="4 6"
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              );
            })}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
