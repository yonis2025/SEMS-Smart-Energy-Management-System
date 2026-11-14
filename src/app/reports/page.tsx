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
  notes: string;
};

type User = {
  fullName: string;
  email: string;
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

function dateLabel(value: string) {
  return new Date(`${value.slice(0, 10)}T12:00:00Z`)
    .toLocaleDateString("en-CA", {
      year: "numeric",
      month: "short",
      day: "numeric",
      timeZone: "UTC",
    });
}

function csvCell(value: string | number) {
  let text = String(value);

  // Prevent spreadsheet applications from evaluating
  // user-entered notes as formulas.
  if (/^[\s]*[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  return `"${text.replace(/"/g, '""')}"`;
}

export default function ReportsPage() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [search, setSearch] = useState("");

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
            data.message || "Unable to load reports."
          );
        }

        if (active) {
          setUser(auth.user);
          setReadings(data.readings);
        }
      } catch (err) {
        if (active) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load reports."
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

  const invalidRange =
    Boolean(startDate && endDate && startDate > endDate);

  const filtered = useMemo(() => {
    if (invalidRange) return [];

    return readings
      .filter((reading) => {
        const date = reading.readingDate.slice(0, 10);

        if (startDate && date < startDate) return false;
        if (endDate && date > endDate) return false;

        if (
          search &&
          !(reading.notes || "")
            .toLowerCase()
            .includes(search.toLowerCase())
        ) {
          return false;
        }

        return true;
      })
      .sort((a, b) =>
        b.readingDate.localeCompare(a.readingDate)
      );
  }, [readings, startDate, endDate, search, invalidRange]);

  const summary = useMemo(() => {
    const consumption = filtered.reduce(
      (sum, reading) => sum + reading.consumptionKwh,
      0
    );

    const cost = filtered.reduce(
      (sum, reading) => sum + reading.totalCost,
      0
    );

    const averageRate =
      consumption > 0
        ? filtered.reduce(
            (sum, reading) =>
              sum +
              reading.consumptionKwh * reading.ratePerKwh,
            0
          ) / consumption
        : 0;

    return {
      consumption,
      cost,
      averageRate,
      count: filtered.length,
    };
  }, [filtered]);

  const period =
    startDate || endDate
      ? `${startDate || "Beginning"} to ${endDate || "Latest"}`
      : "All recorded dates";

  function downloadCSV() {
    if (filtered.length === 0 || invalidRange) return;

    const rows: (string | number)[][] = [
      [
        "Date",
        "Consumption (kWh)",
        "Rate (CAD/kWh)",
        "Energy Cost (CAD)",
        "Notes",
      ],
      ...filtered.map((reading) => [
        reading.readingDate.slice(0, 10),
        reading.consumptionKwh,
        reading.ratePerKwh,
        reading.totalCost,
        reading.notes || "",
      ]),
      [
        "TOTAL",
        summary.consumption,
        "",
        summary.cost,
        "",
      ],
    ];

    const csv = rows
      .map((row) => row.map(csvCell).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = `SEMS_Energy_Report_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  }

  function exportPDF() {
    if (filtered.length === 0 || invalidRange) return;
    window.print();
  }

  function clearFilters() {
    setStartDate("");
    setEndDate("");
    setSearch("");
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f4f8fa]">
        Loading SEMS reports...
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
    <main className="min-h-screen bg-[#f4f8fa] text-[#082542] print:bg-white">
      <style jsx global>{`
        @media print {
          @page {
            size: A4;
            margin: 15mm;
          }

          .sems-no-print {
            display: none !important;
          }

          .sems-print-area {
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .sems-print-area table {
            width: 100%;
            border-collapse: collapse;
            font-size: 10px;
          }

          .sems-print-area th,
          .sems-print-area td {
            border-bottom: 1px solid #ddd;
            padding: 7px;
            overflow-wrap: anywhere;
          }

          .sems-print-area thead {
            display: table-header-group;
          }

          .sems-print-area tr {
            break-inside: avoid;
          }
        }
      `}</style>

      <SemsNavigation />

      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10 print:max-w-none print:p-0">
        <section className="sems-no-print rounded-3xl bg-[#052b47] p-8 text-white md:p-10">
          <p className="text-sm font-bold uppercase tracking-widest text-[#a6f16b]">
            SEMS Reporting Center
          </p>

          <h1 className="mt-4 text-3xl font-extrabold">
            Reports and Data Export
          </h1>

          <p className="mt-3 text-white/80">
            Review your electricity records and export
            professional energy reports.
          </p>
        </section>

        {error && (
          <p className="sems-no-print mt-6 rounded-xl bg-red-50 p-4 text-red-700">
            {error}
          </p>
        )}

        <section className="sems-no-print mt-8 rounded-2xl bg-white p-7 shadow-sm">
          <h2 className="text-xl font-bold">
            Report Filters
          </h2>

          <div className="mt-6 grid gap-5 md:grid-cols-3">
            <div>
              <label
                htmlFor="startDate"
                className="mb-2 block text-sm font-semibold"
              >
                Start Date
              </label>

              <input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(event) =>
                  setStartDate(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 p-3"
              />
            </div>

            <div>
              <label
                htmlFor="endDate"
                className="mb-2 block text-sm font-semibold"
              >
                End Date
              </label>

              <input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(event) =>
                  setEndDate(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 p-3"
              />
            </div>

            <div>
              <label
                htmlFor="search"
                className="mb-2 block text-sm font-semibold"
              >
                Search Notes
              </label>

              <input
                id="search"
                type="text"
                value={search}
                placeholder="Search records..."
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                className="w-full rounded-xl border border-slate-200 p-3"
              />
            </div>
          </div>

          {invalidRange && (
            <p className="mt-4 text-sm text-red-600">
              The start date cannot be after the end date.
            </p>
          )}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={downloadCSV}
              disabled={filtered.length === 0 || invalidRange}
              className="rounded-xl bg-[#4bbd0b] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              Download CSV
            </button>

            <button
              onClick={exportPDF}
              disabled={filtered.length === 0 || invalidRange}
              className="rounded-xl bg-[#052b47] px-6 py-3 text-sm font-bold text-white disabled:opacity-50"
            >
              Print / Save PDF
            </button>

            <button
              onClick={clearFilters}
              className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold"
            >
              Clear Filters
            </button>
          </div>
        </section>

        <section className="sems-print-area mt-8 rounded-2xl bg-white p-7 shadow-sm print:mt-0">
          <div className="border-b border-slate-200 pb-5">
            <p className="text-sm font-bold uppercase tracking-wider text-[#399a08]">
              SEMS — Smart Energy Management System
            </p>

            <h2 className="mt-3 text-2xl font-extrabold">
              Electricity Consumption Report
            </h2>

            <p className="mt-3 text-sm text-slate-600">
              Prepared for: {user.fullName}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Reporting Period: {period}
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Generated:{" "}
              {new Date().toLocaleDateString("en-CA")}
            </p>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <div className="rounded-xl bg-slate-50 p-4 print:bg-white">
              <p className="text-xs text-slate-500">
                Consumption
              </p>
              <p className="mt-2 text-lg font-bold">
                {number(summary.consumption)} kWh
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 print:bg-white">
              <p className="text-xs text-slate-500">
                Energy Cost
              </p>
              <p className="mt-2 text-lg font-bold">
                {money(summary.cost)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 print:bg-white">
              <p className="text-xs text-slate-500">
                Average Rate
              </p>
              <p className="mt-2 text-lg font-bold">
                {money(summary.averageRate)}
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 print:bg-white">
              <p className="text-xs text-slate-500">
                Total Records
              </p>
              <p className="mt-2 text-lg font-bold">
                {summary.count}
              </p>
            </div>
          </div>

          <h3 className="mt-8 text-xl font-bold">
            Energy Reading Details
          </h3>

          <div className="mt-4 overflow-x-auto print:overflow-visible">
            <table className="w-full min-w-[650px] text-left text-sm print:min-w-0">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="p-3">Date</th>
                  <th className="p-3">kWh</th>
                  <th className="p-3">Rate</th>
                  <th className="p-3">Cost</th>
                  <th className="p-3">Notes</th>
                </tr>
              </thead>

              <tbody>
                {filtered.map((reading) => (
                  <tr
                    key={reading._id}
                    className="border-b border-slate-100"
                  >
                    <td className="p-3">
                      {dateLabel(reading.readingDate)}
                    </td>

                    <td className="p-3">
                      {number(reading.consumptionKwh)}
                    </td>

                    <td className="p-3">
                      {money(reading.ratePerKwh)}
                    </td>

                    <td className="p-3">
                      {money(reading.totalCost)}
                    </td>

                    <td className="break-words p-3">
                      {reading.notes || "—"}
                    </td>
                  </tr>
                ))}

                {filtered.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="p-8 text-center text-slate-500"
                    >
                      No readings match your filters.
                    </td>
                  </tr>
                )}
              </tbody>

              <tfoot>
                <tr className="font-bold">
                  <td className="p-3">TOTAL</td>
                  <td className="p-3">
                    {number(summary.consumption)}
                  </td>
                  <td className="p-3">—</td>
                  <td className="p-3">
                    {money(summary.cost)}
                  </td>
                  <td className="p-3">—</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <p className="mt-8 text-xs leading-5 text-slate-500">
            Report generated from SEMS energy readings.
            Energy costs are calculated using recorded kWh
            and electricity rates. They may not include
            utility taxes, delivery fees, or fixed charges.
          </p>
        </section>
      </div>
    </main>
  );
}
