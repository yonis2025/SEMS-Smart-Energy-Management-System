
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import SemsNavigation from "@/components/SemsNavigation";

const API_URL = "http://localhost:5001";

type Reading = {
  _id: string;
  readingDate: string;
  consumptionKwh: number;
  ratePerKwh: number;
  totalCost: number;
};

type Recommendation = {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: "High" | "Medium" | "General";
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

export default function RecommendationsPage() {
  const router = useRouter();

  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

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

        const response = await fetch(
          `${API_URL}/api/energy`,
          {
            credentials: "include",
            cache: "no-store",
          }
        );

        if (response.status === 401) {
          router.replace("/login");
          return;
        }

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.message || "Unable to load energy readings."
          );
        }

        if (active) {
          setAuthenticated(true);
          setReadings(data.readings);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load recommendations."
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

  const analysis = useMemo(() => {
    const sorted = [...readings].sort((a, b) =>
      a.readingDate.localeCompare(b.readingDate)
    );

    const totalConsumption = sorted.reduce(
      (sum, reading) => sum + reading.consumptionKwh,
      0
    );

    const totalCost = sorted.reduce(
      (sum, reading) => sum + reading.totalCost,
      0
    );

    const averageRate =
      totalConsumption > 0
        ? sorted.reduce(
            (sum, reading) =>
              sum +
              reading.consumptionKwh * reading.ratePerKwh,
            0
          ) / totalConsumption
        : 0;

    const monthly = new Map<
      string,
      { consumption: number; cost: number }
    >();

    for (const reading of sorted) {
      const key = reading.readingDate.slice(0, 7);
      const current = monthly.get(key) || {
        consumption: 0,
        cost: 0,
      };

      current.consumption += reading.consumptionKwh;
      current.cost += reading.totalCost;
      monthly.set(key, current);
    }

    const months = [...monthly.entries()].sort((a, b) =>
      a[0].localeCompare(b[0])
    );

    const latest = months.at(-1);
    const previous = months.at(-2);

    const change =
      latest && previous && previous[1].consumption > 0
        ? ((latest[1].consumption -
            previous[1].consumption) /
            previous[1].consumption) *
          100
        : null;

    const recommendations: Recommendation[] = [];

    if (sorted.length === 0) {
      recommendations.push({
        id: "start",
        title: "Start tracking electricity usage",
        description:
          "Add your electricity readings to SEMS. Once you have records from multiple months, the system can compare consumption and identify possible increases.",
        category: "Tracking",
        priority: "High",
      });
    } else {
      if (change !== null && change > 15) {
        recommendations.push({
          id: "increase",
          title: "Investigate your rising energy consumption",
          description:
            `Your latest recorded month shows ${change.toFixed(1)}% more consumption than the previous recorded month. Check heating, cooling, appliance usage, and whether the readings cover comparable periods.`,
          category: "Consumption",
          priority: "High",
        });
      }

      if (change !== null && change < -10) {
        recommendations.push({
          id: "improvement",
          title: "Maintain your lower energy usage",
          description:
            `Your latest recorded month shows ${Math.abs(change).toFixed(1)}% less consumption than the previous recorded month. Review what changed and continue the habits that helped.`,
          category: "Progress",
          priority: "Medium",
        });
      }

      if (averageRate > 0) {
        recommendations.push({
          id: "rates",
          title: "Review your electricity pricing",
          description:
            `Your consumption-weighted average recorded rate is ${money(averageRate)} per kWh. Review your electricity bill and any available time-of-use pricing options before changing your usage schedule.`,
          category: "Electricity Rates",
          priority: "Medium",
        });
      }

      recommendations.push({
        id: "standby",
        title: "Reduce unnecessary standby electricity use",
        description:
          "Switch off unused electronics, chargers, monitors, and entertainment equipment. Smart power strips can help reduce standby consumption.",
        category: "Home Efficiency",
        priority: "General",
      });

      recommendations.push({
        id: "lighting",
        title: "Use energy-efficient lighting",
        description:
          "Replace frequently used older bulbs with efficient LEDs, turn off lights in empty rooms, and make use of daylight where practical.",
        category: "Lighting",
        priority: "General",
      });

      recommendations.push({
        id: "temperature",
        title: "Optimize heating and cooling",
        description:
          "Use suitable thermostat settings, maintain heating and cooling equipment, and seal drafts where possible. Avoid settings that compromise comfort or safety.",
        category: "Heating & Cooling",
        priority: "General",
      });

      recommendations.push({
        id: "appliances",
        title: "Improve appliance efficiency",
        description:
          "Run full laundry and dishwasher loads when appropriate, clean appliance filters, and compare energy efficiency when replacing old equipment.",
        category: "Appliances",
        priority: "General",
      });

      recommendations.push({
        id: "consistency",
        title: "Record energy readings consistently",
        description:
          "Use the same reporting period each month and enter consumption from your electricity bill. Consistent periods make monthly comparisons more meaningful.",
        category: "Tracking",
        priority: "Medium",
      });
    }

    return {
      totalConsumption,
      totalCost,
      averageRate,
      change,
      recommendations,
      monthCount: months.length,
    };
  }, [readings]);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f8fa]">
        Loading SEMS recommendations...
      </main>
    );
  }

  if (!authenticated) {
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
            SEMS Smart Energy Insights
          </p>

          <h1 className="mt-4 text-3xl font-extrabold">
            Energy-Saving Recommendations
          </h1>

          <p className="mt-3 max-w-2xl text-white/80">
            Discover practical ways to reduce electricity
            consumption and improve energy efficiency.
          </p>
        </section>

        {error && (
          <p className="mt-6 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </p>
        )}

        <section className="mt-8 grid gap-5 md:grid-cols-3">
          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Recorded Consumption
            </p>
            <p className="mt-3 text-2xl font-bold">
              {number(analysis.totalConsumption)} kWh
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Recorded Energy Cost
            </p>
            <p className="mt-3 text-2xl font-bold">
              {money(analysis.totalCost)}
            </p>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm">
            <p className="text-sm text-slate-500">
              Monthly Consumption Change
            </p>
            <p className="mt-3 text-2xl font-bold">
              {analysis.change === null
                ? "N/A"
                : `${analysis.change > 0 ? "+" : ""}${analysis.change.toFixed(1)}%`}
            </p>
            <p className="mt-2 text-xs text-slate-500">
              Compared with previous recorded month
            </p>
          </div>
        </section>

        <section className="mt-8">
          <h2 className="text-2xl font-bold">
            Your Recommendations
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            {analysis.recommendations.length} suggestions
            based on your available records and general
            energy-efficiency practices.
          </p>

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            {analysis.recommendations.map((item) => (
              <article
                key={item.id}
                className="rounded-2xl border border-slate-100 bg-white p-7 shadow-sm"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#399a08]">
                    {item.category}
                  </span>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
                    {item.priority} Priority
                  </span>
                </div>

                <h3 className="mt-5 text-xl font-bold">
                  {item.title}
                </h3>

                <p className="mt-3 text-sm leading-7 text-slate-600">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="mt-8 rounded-2xl bg-white p-7 shadow-sm">
          <h2 className="text-xl font-bold">
            Potential Savings Calculator
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Illustrative savings if you reduce the recorded
            consumption by 5%, 10%, or 15% at the same rates.
          </p>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {[5, 10, 15].map((percent) => (
              <div
                key={percent}
                className="rounded-xl bg-[#f4f8fa] p-5"
              >
                <p className="font-semibold">
                  {percent}% Reduction
                </p>

                <p className="mt-3 text-2xl font-extrabold text-[#328c19]">
                  {money(
                    (analysis.totalCost * percent) / 100
                  )}
                </p>

                <p className="mt-2 text-xs text-slate-500">
                  Illustrative energy-cost savings over
                  the recorded period
                </p>
              </div>
            ))}
          </div>
        </section>

        <p className="mt-6 text-xs leading-6 text-slate-500">
          These recommendations are informational, not
          guaranteed savings. SEMS does not currently measure
          individual appliances, weather conditions, or
          household occupancy. Recorded energy costs exclude
          taxes and fixed utility charges unless included
          in the entered rate.
        </p>
      </div>
    </main>
  );
}
