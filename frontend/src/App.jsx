import { useState, useRef, useEffect } from "react"
import MetricsTab from "./components/MetricsTab"

function App() {
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
      const res = await fetch("http://127.0.0.1:8000/chat", {
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
      const res = await fetch(`http://127.0.0.1:8000/report?date=${reportDate}`, {
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
            tab === "chat"
              ? "bg-amber-500 text-white"
              : "bg-white text-stone-600 hover:bg-stone-200"
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setTab("report")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === "report"
              ? "bg-amber-500 text-white"
              : "bg-white text-stone-600 hover:bg-stone-200"
          }`}
        >
          Daily Report
        </button>
        <button
          onClick={() => setTab("report")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === "report"
              ? "bg-amber-500 text-white"
              : "bg-white text-stone-600 hover:bg-stone-200"
          }`}
        >
          Daily Report
        </button>
        <button
          onClick={() => setTab("metrics")}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
            tab === "metrics"
              ? "bg-amber-500 text-white"
              : "bg-white text-stone-600 hover:bg-stone-200"
          }`}
        >
          Dashboard
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
            <div className="prose prose-sm max-w-none text-stone-800 whitespace-pre-wrap leading-relaxed">
              {report}
            </div>
          )}
        </div>
      )}
      {/* Dashboard Tab */}
      {tab === "metrics" && (
        <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg min-h-[600px]">
          <MetricsTab selectedDate={reportDate} />
        </div>
      )}
    </div>
  )
}

export default App