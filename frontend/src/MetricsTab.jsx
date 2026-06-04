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
  const [laborThreshold, setLaborThreshold] = useState(30);
  const [showLaborInfo, setShowLaborInfo] = useState(false);

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

  const laborPct = data?.metrics?.labor_cost_pct?.value ?? null;
  const laborOverThreshold = laborPct !== null && laborPct > laborThreshold;
  const laborOverBy = laborPct !== null ? (laborPct - laborThreshold).toFixed(1) : 0;

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
        </div>
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
        </div>
      </div>

      {/* Labor Alert Card */}
      {data && !loading && laborOverThreshold && (
        <div className="mb-6 bg-red-900/30 border border-red-600 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <span className="text-2xl">🚨</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-red-300 font-bold text-sm">Labor Alert — {laborPct}% Labor Cost</p>
                <button
                  onClick={() => setShowLaborInfo((v) => !v)}
                  className="w-5 h-5 rounded-full bg-red-800 text-red-300 text-xs font-bold hover:bg-red-700 transition-colors flex items-center justify-center"
                  title="What is this?"
                >
                  i
                </button>
              </div>
              <p className="text-red-200 text-xs leading-relaxed">
                Labor is <span className="font-bold">{laborOverBy}% over</span> your {laborThreshold}% target.
                At this rate labor costs are eating into your margins.
                Review staffing levels and consider adjusting for the remainder of the shift.
              </p>
              <p className="text-red-400 text-xs mt-2 italic">
                In the live product this triggers an SMS alert to the manager on duty.
              </p>

              {/* Info Expansion */}
              {showLaborInfo && (
                <div className="mt-4 bg-red-950/50 border border-red-800 rounded-xl p-4 text-xs text-red-200 leading-relaxed space-y-2">
                  <p><span className="font-bold text-red-300">What is labor cost %?</span> It's the percentage of your revenue being spent on staff wages. If you do $2,000 in sales and spend $700 on labor, your labor cost is 35%.</p>
                  <p><span className="font-bold text-red-300">Why does it matter?</span> Labor is typically the second biggest cost in a restaurant after food. Most healthy restaurants target 25–35%. When it spikes, it usually means sales slowed down but staffing didn't adjust.</p>
                  <p><span className="font-bold text-red-300">What should I do?</span> Check if sales are trending down for the shift. If so, consider sending one or two staff home early. A small cut can save $50–100 in a single night.</p>
                  <p><span className="font-bold text-red-300">Your threshold:</span> You've set your alert at {laborThreshold}%. You can adjust this with the + and − buttons in the top right. Most full-service restaurants set it between 28–35%.</p>
                </div>
              )}
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

      {/* Covers + Avg Check */}
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

      {/* Best Day Callout */}
      {data && !loading && selectedDate === "2025-05-10" && (
        <div className="mt-4 bg-emerald-900/30 border border-emerald-700 rounded-xl p-4 text-sm text-emerald-300">
          🏆 Best day of May — $5,068 revenue, 168 covers.
        </div>
      )}

    </div>
  );
}
