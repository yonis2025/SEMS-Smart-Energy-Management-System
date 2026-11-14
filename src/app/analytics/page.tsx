
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import SemsNavigation from "@/components/SemsNavigation";

import { API_URL } from "@/lib/api";

type Reading = {
  _id: string;
  readingDate: string;
  consumptionKwh: number;
  ratePerKwh: number;
  totalCost: number;
};

type User = {
  fullName: string;
  email: string;
};

type MonthData = {
  key: string;
  label: string;
  consumption: number;
  cost: number;
  count: number;
};

function money(value: number) {
  return new Intl.NumberFormat("en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(value);
}

function number(value: number) {
  return new Intl.NumberFormat("en-CA", {
    maximumFractionDigits: 2,
  }).format(value);
}

function getMonthKey(date: string) {
  return date.slice(0, 7);
}

function monthLabel(key: string) {
  const [year, month] = key.split("-").map(Number);

  return new Date(Date.UTC(year, month - 1, 1))
    .toLocaleDateString("en-CA", {
      month: "short",
      year: "numeric",
      timeZone: "UTC",
    });
}

function percentageChange(current: number, previous: number) {
  if (previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export default function AnalyticsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [metric, setMetric] = useState<"consumption" | "cost">(
    "consumption"
  );

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        const authResponse = await fetch(
          `${API_URL}/api/auth/me`,
          {
            credentials: "include",
            cache: "no-store",
          }
        );

        if (authResponse.status === 401) {
          router.replace("/login");
          return;
        }

        if (!authResponse.ok) {
          throw new Error("Unable to verify your session.");
        }

        const auth = await authResponse.json();

        if (!auth.success || !auth.user) {
          router.replace("/login");
          return;
        }

        const energyResponse = await fetch(
          `${API_URL}/api/energy`,
          {
            credentials: "include",
            cache: "no-store",
          }
        );

        if (energyResponse.status === 401) {
          router.replace("/login");
          return;
        }

        const energy = await energyResponse.json();

        if (!energyResponse.ok || !energy.success) {
          throw new Error(
            energy.message || "Unable to load energy readings."
          );
        }

        if (active) {
          setUser(auth.user);
          setReadings(energy.readings);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load analytics."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [router]);

  const months = useMemo(() => {
    const grouped = new Map<string, MonthData>();

    for (const reading of readings) {
      const key = getMonthKey(reading.readingDate);

      const current = grouped.get(key) || {
        key,
        label: monthLabel(key),
        consumption: 0,
        cost: 0,
        count: 0,
      };

      current.consumption += reading.consumptionKwh;
      current.cost += reading.totalCost;
      current.count += 1;

      grouped.set(key, current);
    }

    return Array.from(grouped.values()).sort((a, b) =>
      a.key.localeCompare(b.key)
    );
  }, [readings]);

  const totals = useMemo(() => {
    const consumption = readings.reduce(
      (sum, item) => sum + item.consumptionKwh,
      0
    );

    const cost = readings.reduce(
      (sum, item) => sum + item.totalCost,
      0
    );

    const averageRate =
      consumption > 0
        ? readings.reduce(
            (sum, item) =>
              sum +
              item.consumptionKwh * item.ratePerKwh,
            0
          ) / consumption
        : 0;

    return {
      consumption,
      cost,
      averageRate,
      records: readings.length,
    };
  }, [readings]);

  const recentMonths = months.slice(-12);
  const latest = months.at(-1);
  const previous = months.at(-2);

  const consumptionChange =
    latest && previous
      ? percentageChange(
          latest.consumption,
          previous.consumption
        )
      : null;

  const costChange =
    latest && previous
      ? percentageChange(latest.cost, previous.cost)
      : null;

  const maxValue = Math.max(
    1,
    ...recentMonths.map((month) => month[metric])
  );

  const highestMonth =
    months.length > 0
      ? months.reduce((best, item) =>
          item.consumption > best.consumption ? item : best
        )
      : null;

  const cards = [
    {
      title: "Total Consumption",
      value: `${number(totals.consumption)} kWh`,
    },
    {
      title: "Total Energy Cost",
      value: money(totals.cost),
    },
    {
      title: "Average Rate",
      value: `${money(totals.averageRate)}/kWh`,
    },
    {
      title: "Energy Records",
      value: String(totals.records),
    },
  ];

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f8fa]">
        <p className="text-[#082542]">
          Loading SEMS analytics...
        </p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="p-10 text-center">
        {error || "Redirecting to login..."}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f4f8fa] text-[#082542]">
      <SemsNavigation />

      <div className="mx-auto max-w-7xl px-6 py-10">
        <section className="min-h-[220px] rounded-3xl bg-[#052b47] p-8 text-white md:p-10">
          <p className="text-sm font-bold uppercase tracking-widest text-[#a6f16b]">
            SEMS Advanced Analytics
          </p>

          <h1 className="mt-4 text-3xl font-extrabold">
            Energy Analytics
          </h1>

          <p className="mt-3 text-white/80">
            Understand your electricity consumption,
            expenses, and monthly trends.
          </p>
        </section>

        {error && (
          <p className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </p>
        )}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {cards.map((card) => (
            <div
              key={card.title}
              className="rounded-2xl bg-white p-6 shadow-sm"
            >
              <p className="text-sm text-slate-500">
                {card.title}
              </p>

              <p className="mt-3 break-words text-2xl font-extrabold">
                {card.value}
              </p>
            </div>
          ))}
        </section>

        <section className="mt-8 rounded-2xl bg-white p-7 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                Monthly Energy Trends
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Last 12 months with recorded readings
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setMetric("consumption")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                  metric === "consumption"
                    ? "bg-[#4bbd0b] text-white"
                    : "bg-slate-100"
                }`}
              >
                kWh
              </button>

              <button
                onClick={() => setMetric("cost")}
                className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                  metric === "cost"
                    ? "bg-[#4bbd0b] text-white"
                    : "bg-slate-100"
                }`}
              >
                Cost
              </button>
            </div>
          </div>

          {recentMonths.length === 0 ? (
            <p className="mt-8 rounded-xl bg-slate-50 p-8 text-center text-slate-500">
              No energy data yet. Add readings from your dashboard.
            </p>
          ) : (
            <div className="mt-8 overflow-x-auto">
              <div className="flex h-72 min-w-[540px] items-end gap-3 border-b border-slate-200 pb-5">
                {recentMonths.map((month) => (
                  <div
                    key={month.key}
                    className="flex h-full min-w-0 flex-1 flex-col items-center justify-end"
                  >
                    <span className="mb-2 text-xs font-semibold">
                      {metric === "cost"
                        ? money(month.cost)
                        : number(month.consumption)}
                    </span>

                    <div
                      className="w-full max-w-16 rounded-t-lg bg-[#4bbd0b]"
                      style={{
                        height: `${
                          (month[metric] / maxValue) * 75
                        }%`,
                        minHeight:
                          month[metric] > 0 ? "4px" : "0px",
                      }}
                    />

                    <span className="mt-3 text-center text-xs text-slate-500">
                      {month.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Latest Recorded Month
            </p>
            <p className="mt-3 text-xl font-bold">
              {latest?.label || "No data"}
            </p>
            <p className="mt-2 text-sm">
              {number(latest?.consumption || 0)} kWh
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Consumption Change
            </p>
            <p className="mt-3 text-2xl font-bold">
              {consumptionChange === null
                ? "N/A"
                : `${consumptionChange > 0 ? "+" : ""}${consumptionChange.toFixed(1)}%`}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Compared with previous recorded month
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Cost Change
            </p>
            <p className="mt-3 text-2xl font-bold">
              {costChange === null
                ? "N/A"
                : `${costChange > 0 ? "+" : ""}${costChange.toFixed(1)}%`}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Compared with previous recorded month
            </p>
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-7 shadow-sm">
          <h2 className="text-2xl font-bold">
            Monthly Breakdown
          </h2>

          {highestMonth && (
            <p className="mt-3 text-sm text-slate-600">
              Highest recorded consumption:{" "}
              <strong>{highestMonth.label}</strong> —{" "}
              {number(highestMonth.consumption)} kWh
            </p>
          )}

          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[550px] text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="p-3">Month</th>
                  <th className="p-3">Consumption</th>
                  <th className="p-3">Cost</th>
                  <th className="p-3">Records</th>
                </tr>
              </thead>

              <tbody>
                {[...months].reverse().map((month) => (
                  <tr
                    key={month.key}
                    className="border-b border-slate-100"
                  >
                    <td className="p-3 font-semibold">
                      {month.label}
                    </td>
                    <td className="p-3">
                      {number(month.consumption)} kWh
                    </td>
                    <td className="p-3">
                      {money(month.cost)}
                    </td>
                    <td className="p-3">{month.count}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {months.length === 0 && (
              <p className="p-6 text-center text-slate-500">
                No records available.
              </p>
            )}
          </div>
        </section>

        <p className="mt-6 text-xs text-slate-500">
          Analytics are based on your recorded readings.
          Monthly totals assume readings represent separate
          consumption amounts, not cumulative meter values.
          Missing months are not treated as zero consumption.
        </p>
      </div>
    </main>
  );
}
