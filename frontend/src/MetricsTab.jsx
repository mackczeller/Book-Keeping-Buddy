import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

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

function DeltaBadge({ delta }) {
  if (delta === null || delta === undefined) return null;
  const up = delta > 0;
  const neutral = delta === 0;
  if (neutral) return null;
  const color = up ? "text-emerald-400" : "text-red-400";
  const arrow = up ? "↑" : "↓";
  return (
    <span className={`text-xs font-semibold ml-2 whitespace-nowrap ${color}`}>
      {arrow} {Math.abs(delta)}% vs avg
    </span>
  );
}

function MetricCard({ label, value, format, status, target, delta }) {
  const isWarning = status === "warning";
  return (
    <div className={`rounded-2xl p-6 border ${isWarning ? "border-amber-500 bg-amber-900/20" : "border-gray-700 bg-gray-800"}`}>
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-2">{label}</p>
      <div className="flex items-baseline gap-1">
        <p className={`text-3xl font-bold tabular-nums ${isWarning ? "text-amber-400" : "text-white"}`}>
          {fmt(value, format)}
        </p>
        <DeltaBadge delta={delta} />
      </div>
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
  const [compareData, setCompareData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [laborThreshold, setLaborThreshold] = useState(30);
  const [showThresholdInfo, setShowThresholdInfo] = useState(false);

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

  useEffect(() => {
    if (!selectedDate) return;
    const fetchCompare = async () => {
      try {
        const res = await fetch(`${API_BASE}/compare?date=${selectedDate}`);
        if (!res.ok) return;
        const json = await res.json();
        setCompareData(json);
      } catch {
        setCompareData(null);
      }
    };
    fetchCompare();
  }, [selectedDate]);

  const laborPct = data?.metrics?.labor_cost_pct?.value ?? null;
  const laborOverThreshold = laborPct !== null && laborPct > laborThreshold;
  const laborOverBy = laborPct !== null ? (laborPct - laborThreshold).toFixed(1) : 0;

  const deltas = compareData?.deltas ?? {};

  const deltaMap = {
    revenue: deltas.net_revenue ?? null,
    food_cost_pct: deltas.food_cost_pct ?? null,
    labor_cost_pct: deltas.labor_pct ?? null,
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">

      {/* Header + Threshold Setting */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white">Dashboard</h2>
          <p className="text-gray-400 text-sm mt-1">
            {selectedDate
              ? `Metrics for ${new Date(selectedDate + "T12:00:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`
              : "Select a date to load metrics"}
          </p>
          {compareData && (
            <p className="text-gray-500 text-xs mt-1">
              Compared to {compareData.weeks_compared} other {compareData.day_of_week}s in May
            </p>
          )}
        </div>

        {/* Threshold control */}
        <div className="relative">
          <div className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-xl px-4 py-2">
            <span className="text-xs text-gray-400 font-medium">Labor Alert At</span>
            <button
              onClick={() => setLaborThreshold((t) => Math.max(1, t - 1))}
              className="w-6 h-6 rounded-lg bg-gray-700 text-white text-sm font-bold hover:bg-gray-600 transition-colors"
            >
              −
            </button>
            <span className="text-white font-bold text-sm w-8 text-center">{laborThreshold}%</span>
            <button
              onClick={() => setLaborThreshold((t) => Math.min(99, t + 1))}
              className="w-6 h-6 rounded-lg bg-gray-700 text-white text-sm font-bold hover:bg-gray-600 transition-colors"
            >
              +
            </button>
            <button
              onClick={() => setShowThresholdInfo((v) => !v)}
              className="w-5 h-5 rounded-full bg-gray-600 text-gray-300 text-xs font-bold hover:bg-gray-500 transition-colors flex items-center justify-center ml-1"
            >
              i
            </button>
          </div>

          {/* Tooltip */}
          {showThresholdInfo && (
            <div className="absolute right-0 top-12 w-72 bg-gray-900 border border-gray-600 rounded-xl p-4 text-xs text-gray-300 leading-relaxed shadow-xl z-10">
              <p className="font-bold text-white mb-1">Labor Alert Threshold</p>
              <p>This sets your target labor cost %. If labor exceeds this number on any day, BookKeep Buddy will flag it and send an SMS alert to the manager on duty with a staffing suggestion.</p>
              <p className="mt-2 text-gray-400">Most full-service restaurants set this between 28–35%.</p>
            </div>
          )}
        </div>
      </div>

      {/* Labor Alert Card */}
      {data && !loading && laborOverThreshold && (
        <div className="mb-6 bg-red-900/30 border border-red-600 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🚨</span>
            <div className="flex-1">
              <p className="text-red-300 font-bold text-sm mb-1">Labor Alert — {laborPct}% Labor Cost</p>
              <p className="text-red-200 text-xs leading-relaxed">
                Labor is <span className="font-bold">{laborOverBy}% over</span> your {laborThreshold}% target.
                At this rate labor costs are eating into your margins.
                Review staffing levels and consider adjusting for the remainder of the shift.
              </p>
              <p className="text-red-400 text-xs mt-2 italic">
                When labor exceeds your target, an SMS alert is sent to the manager on duty.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-900/40 border border-red-700 text-red-300 rounded-xl p-4 mb-6 text-sm">
          ⚠ Could not load metrics: {error}
        </div>
      )}

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {loading ? (
          Array.from({ length: 5 }).map((_, i) => <SkeletonCard key={i} />)
        ) : data ? (
          Object.entries(data.metrics).map(([key, card]) => (
            <MetricCard key={key} {...card} delta={deltaMap[key] ?? null} />
          ))
        ) : (
          !error && (
            <p className="text-gray-500 col-span-3 text-center py-16">
              Pick a date to see the numbers.
            </p>
          )
        )}
      </div>

      {/* Covers + Avg Check */}
      {data && !loading && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
            <div className="flex items-baseline gap-1">
              <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Covers</p>
            </div>
            <div className="flex items-baseline gap-1">
              <p className="text-2xl font-bold text-white">{data.covers}</p>
              <DeltaBadge delta={deltas.covers ?? null} />
            </div>
          </div>
          <div className="bg-gray-800 rounded-2xl p-5 border border-gray-700">
            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-1">Avg Check</p>
            <p className="text-2xl font-bold text-white">${data.avg_check}</p>
          </div>
        </div>
      )}

      {/* Best Day Callout */}
      {data && !loading && selectedDate === "2025-05-10" && (
        <div className="mt-4 bg-emerald-900/30 border border-emerald-700 rounded-xl p-4 text-sm text-emerald-300">
          🏆 Best day of May — $5,068 revenue, 168 covers.
        </div>
      )}

    </div>
  );
}
