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
  standard_mme: "#fb923c",
  smart_meter_imsys: "#c084fc",
  module2_blended: "#34d399",
  module3_blended: "#fb7185",
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
    <div className="graphite-panel rounded-[2rem] p-6">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-orange-200/76">Chart</p>
          <h2 className="mt-3 text-2xl font-semibold text-white md:text-3xl">7 Tage Rueckblick plus verfuegbare Zukunft</h2>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-400">
            Boersenpreise, aktiver Realpreis und dein Fixpreis liegen auf einer gemeinsamen Lesespur, damit Unterschiede sofort sichtbar werden.
          </p>
        </div>
        <div className="graphite-pill rounded-[1.3rem] px-4 py-3 text-sm text-slate-300">
          <p>Aktiv: <span className="font-semibold text-white">{selectedScenario?.label ?? selectedScenarioId}</span></p>
          <p className="mt-1">Verfuegbar bis {availableUntil ? formatInTimeZone(availableUntil, "Europe/Berlin", "dd.MM.yyyy HH:mm") : "-"}</p>
        </div>
      </div>
      <div className="h-[460px] w-full">
        <ResponsiveContainer minHeight={340}>
          <LineChart data={chartData} margin={{ top: 10, right: 24, bottom: 10, left: 0 }}>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" strokeDasharray="3 8" />
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
              stroke="rgba(203,213,225,0.68)"
              tick={{ fill: "rgba(226,232,240,0.82)", fontSize: 12 }}
            />
            <YAxis
              unit=" ct/kWh"
              stroke="rgba(203,213,225,0.68)"
              tick={{ fill: "rgba(226,232,240,0.82)", fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                background: "rgba(8,15,26,0.96)",
                border: "1px solid rgba(148,163,184,0.2)",
                borderRadius: 18,
                color: "#f8fafc",
                boxShadow: "0 24px 80px rgba(2,8,20,0.42)",
              }}
              formatter={(value: number | string | readonly (string | number)[] | null | undefined) =>
                typeof value === "number" ? `${value.toFixed(2)} ct/kWh` : "-"}
              labelFormatter={(label: unknown) =>
                typeof label === "string" ? formatInTimeZone(label, "Europe/Berlin", "dd.MM.yyyy HH:mm") : "-"}
            />
            <Legend wrapperStyle={{ color: "#e2e8f0", paddingTop: 12 }} />
            <Line
              type="monotone"
              dataKey="dayAheadCtKwh"
              name="Day-Ahead"
              stroke="#22c55e"
              strokeWidth={3}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="intradayCtKwh"
              name="Intraday"
              stroke="#38bdf8"
              strokeDasharray="6 6"
              strokeWidth={2}
              dot={false}
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="fixedPriceCtKwh"
              name={fixedPriceLabel}
              stroke="#fb7185"
              strokeDasharray="10 8"
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
                  strokeDasharray="4 7"
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
