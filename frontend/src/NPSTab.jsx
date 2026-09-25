import { useState } from "react"
import ReactMarkdown from "react-markdown"

export default function NPSTab() {
  const [score, setScore] = useState(null)
  const [feedback, setFeedback] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [analysis, setAnalysis] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async () => {
    if (score === null) return
    setLoading(true)
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/nps`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ score, feedback }),
      })
      const data = await res.json()
      setAnalysis(data.analysis)
      setSubmitted(true)
    } catch (err) {
      setAnalysis("Error submitting response.")
    }
    setLoading(false)
  }

  return (
    <div className="w-full max-w-2xl mx-auto mt-6 px-4">
      {!submitted ? (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-stone-800 mb-2">How likely are you to recommend BookKeep Buddy?</h2>
          <p className="text-stone-500 text-sm mb-6">0 = Not at all likely, 10 = Extremely likely</p>
          <div className="flex gap-2 flex-wrap mb-6">
            {[0,1,2,3,4,5,6,7,8,9,10].map((n) => (
              <button
                key={n}
                onClick={() => setScore(n)}
                className={`w-10 h-10 rounded-lg font-bold text-sm transition-colors ${
                  score === n
                    ? "bg-amber-500 text-white"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="What's the main reason for your score? (optional)"
            className="w-full border border-stone-200 rounded-xl p-3 text-sm text-stone-800 mb-4 resize-none h-24"
          />
          <button
            onClick={handleSubmit}
            disabled={score === null || loading}
            className="w-full bg-amber-500 text-white font-semibold py-3 rounded-xl hover:bg-amber-600 disabled:opacity-40 transition-colors"
          >
            {loading ? "Submitting..." : "Submit"}
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-xl font-bold text-stone-800 mb-4">Thank you for your feedback!</h2>
          <button onClick={() => { setSubmitted(false); setScore(null); setFeedback(""); setAnalysis(""); }} className="mb-4 text-sm text-amber-600 hover:underline">Submit another response</button>
          <div className="bg-stone-50 rounded-xl p-4 text-sm text-stone-800">
            <ReactMarkdown>{analysis}</ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  )
}
