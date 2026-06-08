import { useState } from "react"

export default function Login({ onLogin }) {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      setError("Please enter both username and password.")
      return
    }
    setLoading(true)
    setError("")
    setTimeout(() => {
      if (username === "mesaverde" && password === "demo2025") {
        onLogin()
      } else {
        setError("Invalid username or password.")
        setLoading(false)
      }
    }, 600)
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleLogin()
  }

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-stone-800">BookKeep Buddy</h1>
          <p className="text-stone-500 text-sm mt-1">Mesa Verde Restaurant</p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter username"
              className="w-full bg-stone-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Enter password"
              className="w-full bg-stone-100 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-amber-400"
            />
          </div>

          {error && (
            <p className="text-red-500 text-xs">{error}</p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-amber-500 hover:bg-amber-600 disabled:opacity-50 text-white rounded-xl px-4 py-3 text-sm font-medium transition-colors"
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </div>

        <p className="text-center text-xs text-stone-400 mt-6">
          Demo credentials: mesaverde / demo2025
        </p>
      </div>
    </div>
  )
}
