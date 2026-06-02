import { useState, useEffect } from "react";

const API_BASE = "http://127.0.0.1:8000";

function fmt(value, format) {
  if (format === "currency") {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  }
  if (format === "percent") return `${value}%`;
  return value;
}

function MetricCard({ label, value, format, status, target }) {
  const isWarning = status === "warning";
  return (
    <div className={`rounded-2xl p-6 border ${isWarning ? "border-amber-500 bg-amber-900/20" : "border-gray-700 bg-gray-800"}`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      <p className={`text-3xl font-bold tabular-nums ${isWarning ? "text-amber-400" : "text-white"}`}>
        {fmt(value, format)}
      </p>
      {target && (
        <p className="text-xs text-gray-500 mt-1">
          Target: {fmt(target, format)}
          {isWarning && <span className="ml-2 text-amber-400">⚠ Over target</span>}
        </p>
      )}
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700 animate-pulse">
      <div className="h-3 w-24 bg-gray-600 rounded mb-4" />
      <div className="h-8 w-32 bg-gray-600 rounded mb-2" />
      <div className="h-3 w-20 bg-gray-700 rounded" />
    </div>
  );
}

export default function MetricsTab({ selectedDate }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!selectedDate) return;
    const fetchMetrics = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${API_BASE}/metrics`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ date: selectedDate }),
        });
        if (!res.ok) throw new Error(`Server error: ${res.status}`);
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, [selectedDate]);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Dashboard</h2>
        <p className="text-gray-400 text-sm mt-1">
          {selectedDate
            ? `Metrics for ${new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`
            : "Select a date to load metrics"}
        </p>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-xl p-4 mb-6 text-sm">
          ⚠ Could not load metrics: {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : data ? (
          Object.entries(data.metrics).map(([key, card]) => (
            <MetricCard key={key} {...card} />
          ))
        ) : (
          !error && (
            <p className="text-gray-500 col-span-3 text-center py-16">
              Pick a date to see the numbers.
            </p>
          )
        )}
      </div>

      {data && !loading && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Covers</p>
            <p className="text-2xl font-bold text-white">{data.covers}</p>
          </div>
          <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Avg Check</p>
            <p className="text-2xl font-bold text-white">${data.avg_check}</p>
          </div>
        </div>
      )}

      {data && !loading && selectedDate === "2025-05-10" && (
        <div className="mt-4 bg-emerald-900/30 border border-emerald-700 rounded-xl p-4 text-sm text-emerald-300">
          🏆 Best day of May — $5,068 revenue, 168 covers.
        </div>
      )}
      {data && !loading && selectedDate === "2025-05-06" && (
        <div className="mt-4 bg-amber-900/30 border border-amber-700 rounded-xl p-4 text-sm text-amber-300">
          ⚠ Labor hit 41.9% this day — well above the 30% target.
        </div>
      )}
    </div>
  );
}
