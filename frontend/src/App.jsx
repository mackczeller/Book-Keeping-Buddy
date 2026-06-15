import { useState, useRef, useEffect } from "react"
import Login from "./Login"
import ReactMarkdown from "react-markdown"
import MetricsTab from "./MetricsTab"
import ApprovalsTab from "./ApprovalsTab"

const initialSuggestions = [
  {
    id: 1,
    type: "action",
    icon: "📋",
    title: "Send W-9 Request to Sunrise Produce",
    note: "Sunrise Produce has no W-9 on file and is $20 away from the $600 IRS reporting threshold. Sending a request now keeps you compliant.",
    impact: "Compliance risk avoided",
  },
  {
    id: 2,
    type: "note",
    icon: "📉",
    title: "Breakfast Burrito — Margin Down to 18.6%",
    note: "Egg costs rose 38% this month. Margin dropped from 30% to 18.6%. Review pricing with your team when you update the menu.",
    impact: "Margin impact: -11.4%",
  },
  {
    id: 3,
    type: "note",
    icon: "🍗",
    title: "Chicken Breast Shortage — Review with Kitchen",
    note: "20 lbs unaccounted for ($84 at cost). Theoretical count is 25 lbs, actual reported is 5 lbs. Review with kitchen staff for waste or theft.",
    impact: "Potential loss: $84.00",
  },
]

function App() {
  const [loggedIn, setLoggedIn] = useState(false)
  const [tab, setTab] = useState("chat")
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm BookKeep Buddy, your AI bookkeeper for Mesa Verde Restaurant. Ask me anything about your sales, food costs, labor, or inventory.",
    },
  ])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [report, setReport] = useState(null)
  const [reportLoading, setReportLoading] = useState(false)
  const [reportDate, setReportDate] = useState("2025-05-10")
  const [suggestions, setSuggestions] = useState(initialSuggestions)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  const sendMessage = async () => {
    if (!input.trim() || loading) return
    const userMessage = { role: "user", text: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setLoading(true)
    try {
      const res = await fetch((import.meta.env.VITE_API_URL || "http://127.0.0.1:8000") + "/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      })
      const data = await res.json()
      setMessages((prev) => [...prev, { role: "assistant", text: data.response }])
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", text: "Sorry, I couldn't reach the server. Make sure the backend is running." },
      ])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage()
  }

  const fetchReport = async () => {
    setReportLoading(true)
    setReport(null)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || "http://127.0.0.1:8000"}/report?date=${reportDate}`, {
        method: "POST",
      })
      const data = await res.json()
      setReport(data.report)
    } catch {
      setReport("Sorry, couldn't load the report. Make sure the backend is running.")
    } finally {
      setReportLoading(false)
    }
  }

  useEffect(() => {
    if (tab === "report" && !report) fetchReport()
  }, [tab])

  const handleSuggestion = (id) => {
    setSuggestions((prev) => prev.filter((s) => s.id !== id))
  }

  if (!loggedIn) {
    return <Login onLogin={() => setLoggedIn(true)} />
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-2xl mb-4 text-center">
        <h1 className="text-2xl font-bold text-stone-800">BookKeep Buddy</h1>
        <p className="text-stone-500 text-sm">Mesa Verde Restaurant</p>
      </div>

      {/* Tabs */}
      <div className="w-full max-w-2xl flex gap-2 mb-3">
        <button
          onClick={() => setTab("chat")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === "chat" ? "bg-amber-500 text-white" : "bg-white text-stone-600 hover:bg-stone-200"
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setTab("report")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === "report" ? "bg-amber-500 text-white" : "bg-white text-stone-600 hover:bg-stone-200"
          }`}
        >
          Daily Report
        </button>
        <button
          onClick={() => setTab("metrics")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === "metrics" ? "bg-amber-500 text-white" : "bg-white text-stone-600 hover:bg-stone-200"
          }`}
        >
          Dashboard
        </button>
        <button
          onClick={() => setTab("approvals")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === "approvals" ? "bg-amber-500 text-white" : "bg-white text-stone-600 hover:bg-stone-200"
          }`}
        >
          Approvals
        </button>
        <button
          onClick={() => setLoggedIn(false)}
          className="ml-auto px-4 py-2 rounded-xl text-sm font-medium bg-white text-stone-400 hover:bg-stone-200 transition-colors"
        >
          Log Out
        </button>
      </div>

      {/* Chat Tab */}
      {tab === "chat" && (
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg flex flex-col h-[600px]">
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    msg.role === "user"
                      ? "bg-amber-500 text-white rounded-br-sm"
                      : "bg-stone-100 text-stone-800 rounded-bl-sm"
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-stone-100 rounded-2xl rounded-bl-sm px-4 py-3">
                  <div className="flex gap-1 items-center h-4">
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:0ms]"></div>
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:150ms]"></div>
                    <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce [animation-delay:300ms]"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>
          <div className="border-t border-stone-200 p-4 flex gap-3">
            <input
              className="flex-1 bg-stone-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400"
              placeholder="Ask about your restaurant..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl px-5 py-3 text-sm font-medium transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Report Tab */}
      {tab === "report" && (
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-6 min-h-[600px]">
          <p className="text-xs text-stone-400 mb-2">📅 Demo data available for May 1–30, 2025</p>
          <div className="flex gap-3 mb-6">
            <input
              type="date"
              value={reportDate}
              min="2025-05-01"
              max="2025-05-30"
              onChange={(e) => setReportDate(e.target.value)}
              className="bg-stone-100 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-amber-400"
            />
            <button
              onClick={fetchReport}
              className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-5 py-2 text-sm font-medium transition-colors"
            >
              Generate Report
            </button>
          </div>
          {reportLoading && (
            <div className="flex items-center justify-center h-48 text-stone-400 text-sm">
              Generating your daily report...
            </div>
          )}
          {!reportLoading && report && (
            <>
              <div className="prose prose-sm max-w-none text-stone-800">
                <ReactMarkdown>{report}</ReactMarkdown>
              </div>
              {suggestions.length > 0 && (
                <div className="mt-8 border-t border-stone-100 pt-6">
                  <h3 className="text-base font-bold text-stone-800 mb-1">Suggestions</h3>
                  <p className="text-stone-500 text-xs mb-4">Items flagged for your awareness and action</p>
                  <div className="space-y-3">
                    {suggestions.map((s) => (
                      <div key={s.id} className="border border-stone-200 rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                          <span className="text-lg">{s.icon}</span>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-stone-800 text-sm">{s.title}</span>
                              {s.type === "action" && (
                                <span className="text-xs px-2 py-0.5 rounded-full font-medium bg-amber-100 text-amber-700">
                                  Action
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-stone-500 leading-relaxed mb-1">{s.note}</p>
                            <p className="text-xs font-medium text-stone-600">{s.impact}</p>
                          </div>
                        </div>
                        {s.type === "action" && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleSuggestion(s.id)}
                              className="px-4 py-2 rounded-xl text-sm font-medium bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors"
                            >
                              Not Now
                            </button>
                            <button
                              onClick={() => handleSuggestion(s.id)}
                              className="px-4 py-2 rounded-xl text-sm font-medium bg-amber-500 text-white hover:bg-amber-600 transition-colors"
                            >
                              Yes, Send W-9 Request
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Dashboard Tab */}
      {tab === "metrics" && (
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg min-h-[600px]">
          <MetricsTab selectedDate={reportDate} />
        </div>
      )}

      {/* Approvals Tab */}
      {tab === "approvals" && (
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg min-h-[600px]">
          <ApprovalsTab />
        </div>
      )}
    </div>
  )
}

export default App
