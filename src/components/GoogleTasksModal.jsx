import { useState, useEffect } from 'react'
import Button from './Button'
import { fetchGoogleTasks, formatGoogleTaskToHabit } from '../services/googleTasks'

export default function GoogleTasksModal({ isOpen, onClose, onImportHabits }) {
  const [accessToken, setAccessToken] = useState('')
  const [clientId, setClientId] = useState('721724668570-nbkv1cfusk7kk4eni4pjvepaus73b13t.apps.googleusercontent.com')
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedTaskIds, setSelectedTaskIds] = useState(new Set())

  // Load GIS script dynamically
  useEffect(() => {
    if (window.google?.accounts?.oauth2) return

    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    document.body.appendChild(script)
  }, [])

  if (!isOpen) return null

  const handleSignInWithGoogle = () => {
    setError('')
    if (!window.google?.accounts?.oauth2) {
      setError('Google Sign-In SDK loading... Please try again in a moment.')
      return
    }

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: clientId.trim(),
        scope: 'https://www.googleapis.com/auth/tasks.readonly',
        callback: async (response) => {
          if (response.error) {
            setError(`Authentication failed: ${response.error}`)
            return
          }
          if (response.access_token) {
            setAccessToken(response.access_token)
            await loadTasks(response.access_token)
          }
        },
      })
      client.requestAccessToken()
    } catch (err) {
      setError(err.message || 'Failed to initialize Google Auth.')
    }
  }

  const loadTasks = async (token = accessToken) => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const fetchedTasks = await fetchGoogleTasks(token)
      setTasks(fetchedTasks)
      // Pre-select all non-empty tasks
      const allIds = new Set(fetchedTasks.filter(t => t.title).map(t => t.id))
      setSelectedTaskIds(allIds)
    } catch (err) {
      setError(err.message || 'Error fetching Google Tasks.')
    } finally {
      setLoading(false)
    }
  }

  const toggleTaskSelection = (id) => {
    const updated = new Set(selectedTaskIds)
    if (updated.has(id)) {
      updated.delete(id)
    } else {
      updated.add(id)
    }
    setSelectedTaskIds(updated)
  }

  const handleConfirmImport = () => {
    const tasksToImport = tasks.filter(t => selectedTaskIds.has(t.id))
    const newHabits = tasksToImport.map(formatGoogleTaskToHabit)
    onImportHabits(newHabits)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl flex flex-col gap-5">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">📋</span>
            <h2 className="text-xl font-bold text-white">Import Google Tasks</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white text-lg font-bold px-2 py-1 rounded"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-xs p-3 rounded-lg flex flex-col gap-1">
            <span className="font-semibold text-red-300">Authentication Error:</span>
            <span>{error}</span>
            {error.includes('origin_mismatch') || error.includes('popup_closed') || error.includes('failed') ? (
              <div className="mt-2 text-zinc-300 bg-zinc-950/60 p-2.5 rounded border border-zinc-800 text-[11px] leading-relaxed">
                <p className="font-semibold text-amber-400">💡 How to fix origin_mismatch error:</p>
                <ol className="list-decimal pl-4 mt-1 flex flex-col gap-1 text-zinc-400">
                  <li>Go to <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="text-violet-400 underline">Google Cloud Console Credentials</a>.</li>
                  <li>Click on your OAuth 2.0 Client ID.</li>
                  <li>Under <strong>Authorized JavaScript origins</strong>, add: <code className="bg-zinc-800 px-1 py-0.5 rounded text-violet-300">{window.location.origin}</code></li>
                  <li>Or generate a quick access token via <a href="https://developers.google.com/oauthplayground" target="_blank" rel="noreferrer" className="text-violet-400 underline">Google OAuth Playground</a> (select Google Tasks API v1) and paste it below.</li>
                </ol>
              </div>
            ) : null}
          </div>
        )}

        {tasks.length === 0 ? (
          <div className="flex flex-col gap-4 py-2">
            <p className="text-sm text-zinc-300">
              Sign in with your Google Account to fetch your saved Google Tasks directly into Habit Tracker.
            </p>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-zinc-400 font-medium">Google OAuth Client ID:</label>
              <input
                type="text"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                placeholder="OAuth Client ID..."
                className="bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-violet-500"
              />
            </div>

            <Button
              variant="primary"
              className="w-full flex items-center justify-center gap-2 py-2.5 font-semibold text-sm"
              onClick={handleSignInWithGoogle}
            >
              <span>🔑</span> Sign in with Google
            </Button>

            <div className="relative my-1">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-zinc-800"></div>
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-zinc-900 px-2 text-zinc-500">Or paste OAuth Access Token</span>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={accessToken}
                onChange={(e) => setAccessToken(e.target.value)}
                placeholder="OAuth Access Token (ya29...)"
                className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-xs text-zinc-200 outline-none focus:border-violet-500"
              />
              <Button
                variant="secondary"
                disabled={!accessToken.trim() || loading}
                onClick={() => loadTasks(accessToken.trim())}
              >
                Fetch Tasks
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span>Select tasks to import as habits:</span>
              <span>{selectedTaskIds.size} of {tasks.length} selected</span>
            </div>

            <div className="max-h-60 overflow-y-auto flex flex-col gap-2 pr-1 custom-scrollbar">
              {tasks.map((task) => (
                <label
                  key={task.id}
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedTaskIds.has(task.id)
                      ? 'bg-violet-950/40 border-violet-500/50 text-white'
                      : 'bg-zinc-800/60 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selectedTaskIds.has(task.id)}
                    onChange={() => toggleTaskSelection(task.id)}
                    className="w-4 h-4 accent-violet-600 rounded cursor-pointer"
                  />
                  <span className="text-sm font-medium flex-1 truncate">
                    {task.title || 'Untitled Task'}
                  </span>
                  {task.status === 'completed' && (
                    <span className="text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                      Completed
                    </span>
                  )}
                </label>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-800">
              <Button variant="secondary" onClick={onClose}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={selectedTaskIds.size === 0}
                onClick={handleConfirmImport}
              >
                Import Selected ({selectedTaskIds.size})
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
