import { useState } from "react"

const initialEntries = [
  {
    id: 1,
    icon: "🔴",
    title: "Unidentified Wire Transfer",
    badge: "Flagged",
    badgeColor: "bg-red-100 text-red-700",
    amount: "$1,800.00",
    account: "Miscellaneous Expense",
    date: "May 10, 2025",
    details: "Wire transfer received with no matching invoice or vendor on file. Needs categorization before posting to QuickBooks.",
  },
  {
    id: 2,
    icon: "🟡",
    title: "Duplicate Invoice — Southwest Linen",
    badge: "Duplicate",
    badgeColor: "bg-yellow-100 text-yellow-700",
    amount: "$385.00",
    account: "Linen & Laundry Expense",
    date: "May 8, 2025",
    details: "This invoice matches a payment already posted on May 1. Approving will create a duplicate charge. Recommend rejecting to save $385.",
  },
  {
    id: 3,
    icon: "🟠",
    title: "W-9 Alert — Sunrise Produce",
    badge: "Compliance",
    badgeColor: "bg-orange-100 text-orange-700",
    amount: "$580.00",
    account: "Food & Beverage Cost",
    date: "May 9, 2025",
    details: "Sunrise Produce has no W-9 on file and is $20 away from the $600 IRS reporting threshold. A W-9 request should be sent before approving further payments.",
  },
  {
    id: 4,
    icon: "🟣",
    title: "Breakfast Burrito Margin Drop",
    badge: "Menu Alert",
    badgeColor: "bg-purple-100 text-purple-700",
    amount: "$0.00",
    account: "Menu Engineering",
    date: "May 7, 2025",
    details: "Egg prices rose 38% this month. Breakfast Burrito margin dropped from 30% to 18.6%. Recommend raising price from $12.00 to $13.50 to restore target margin.",
  },
  {
    id: 5,
    icon: "🔵",
    title: "Chicken Breast Inventory Shortage",
    badge: "Inventory",
    badgeColor: "bg-blue-100 text-blue-700",
    amount: "$84.00",
    account: "Food & Beverage Cost",
    date: "May 10, 2025",
    details: "Theoretical count based on invoices and sales is 25 lbs. Actual count reported is 5 lbs. 20 lbs unaccounted ($84 at cost). Flag for waste review or possible theft.",
  },
]

export default function ApprovalsTab() {
  const [entries, setEntries] = useState(initialEntries)
  const [resolved, setResolved] = useState([])

  const approve = (id) => {
    const entry = entries.find((e) => e.id === id)
    setResolved((prev) => [...prev, { ...entry, status: "Approved" }])
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  const reject = (id) => {
    const entry = entries.find((e) => e.id === id)
    setResolved((prev) => [...prev, { ...entry, status: "Rejected" }])
    setEntries((prev) => prev.filter((e) => e.id !== id))
  }

  const approveAll = () => {
    setResolved((prev) => [...prev, ...entries.map((e) => ({ ...e, status: "Approved" }))])
    setEntries([])
  }

  const rejectAll = () => {
    setResolved((prev) => [...prev, ...entries.map((e) => ({ ...e, status: "Rejected" }))])
    setEntries([])
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-stone-800">Pending Approvals</h2>
          <p className="text-stone-500 text-sm mt-0.5">
            {entries.length} item{entries.length !== 1 ? "s" : ""} pending your approval
          </p>
        </div>
        {entries.length > 0 && (
          <div className="flex gap-2">
            <button
              onClick={rejectAll}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
            >
              Reject All
            </button>
            <button
              onClick={approveAll}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
            >
              Approve All
            </button>
          </div>
        )}
      </div>

      {/* Pending entries */}
      <div className="space-y-4">
        {entries.map((entry) => (
          <div key={entry.id} className="border border-stone-200 rounded-2xl p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{entry.icon}</span>
                  <span className="font-semibold text-stone-800 text-sm">{entry.title}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${entry.badgeColor}`}>
                    {entry.badge}
                  </span>
                </div>
                <div className="flex gap-4 text-xs text-stone-500 mb-2">
                  <span>Amount: <span className="font-medium text-stone-700">{entry.amount}</span></span>
                  <span>Account: <span className="font-medium text-stone-700">{entry.account}</span></span>
                  <span>Date: <span className="font-medium text-stone-700">{entry.date}</span></span>
                </div>
                <p className="text-xs text-stone-500 leading-relaxed">{entry.details}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => reject(entry.id)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
              >
                ✗ Reject
              </button>
              <button
                onClick={() => approve(entry.id)}
                className="px-4 py-2 rounded-xl text-sm font-medium bg-green-500 text-white hover:bg-green-600 transition-colors"
              >
                ✅ Approve
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Resolved entries */}
      {resolved.length > 0 && (
        <div className="mt-8">
          <h3 className="text-sm font-semibold text-stone-500 mb-3">Resolved</h3>
          <div className="space-y-2">
            {resolved.map((entry, i) => (
              <div key={i} className="flex items-center justify-between border border-stone-100 rounded-xl px-4 py-3 bg-stone-50">
                <div className="flex items-center gap-2">
                  <span>{entry.icon}</span>
                  <span className="text-sm text-stone-600">{entry.title}</span>
                  <span className="text-xs text-stone-400">{entry.amount}</span>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  entry.status === "Approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                }`}>
                  {entry.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {entries.length === 0 && resolved.length === 0 && (
        <div className="flex items-center justify-center h-48 text-stone-400 text-sm">
          No pending approvals
        </div>
      )}
    </div>
  )
}
