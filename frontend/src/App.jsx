import { useState } from "react"

function App() {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hi! I'm BookKeep Buddy, your AI bookkeeper for Mesa Verde Restaurant. Ask me anything about your sales, food costs, labor, or inventory.",
    },
  ])
  const [input, setInput] = useState("")

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: "user", text: input }
    setMessages((prev) => [...prev, userMessage])
    setInput("")

    const res = await fetch("http://127.0.0.1:8000/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: input }),
    })

    const data = await res.json()
    setMessages((prev) => [...prev, { role: "assistant", text: data.response }])
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") sendMessage()
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="w-full max-w-2xl mb-4 text-center">
        <h1 className="text-2xl font-bold text-stone-800">BookKeep Buddy</h1>
        <p className="text-stone-500 text-sm">Mesa Verde Restaurant</p>
      </div>

      {/* Chat Window */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg flex flex-col h-[600px]">
        {/* Messages */}
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
        </div>

        {/* Input Bar */}
        <div className="border-t border-stone-200 p-4 flex gap-3">
          <input
            className="flex-1 bg-stone-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400"
            placeholder="Ask about your restaurant..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            onClick={sendMessage}
            className="bg-amber-500 hover:bg-amber-600 text-white rounded-xl px-5 py-3 text-sm font-medium transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
