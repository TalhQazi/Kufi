import { useEffect, useState } from 'react'
import api from '../../api'

export default function AdminItineraries({ darkMode }) {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [busyId, setBusyId] = useState(null)

  const load = async () => {
    setLoading(true)
    setError('')
    try {
      const res = await api.get('/itineraries/admin/all')
      setItems(Array.isArray(res.data) ? res.data : res.data?.itineraries || [])
    } catch (err) {
      setError(err?.response?.data?.msg || err.message || 'Failed to load itineraries')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const clearAllActivities = async (id) => {
    if (!window.confirm('Delete ALL activities from this itinerary? Day shells will be kept. This cannot be undone.')) {
      return
    }
    setBusyId(id)
    try {
      await api.post(`/itineraries/${id}/clear-activities`)
      await load()
    } catch (err) {
      alert(err?.response?.data?.msg || 'Failed to clear activities')
    } finally {
      setBusyId(null)
    }
  }

  const base = darkMode ? 'bg-slate-900 text-white' : 'bg-white text-slate-900'
  const border = darkMode ? 'border-slate-700' : 'border-gray-200'

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div>
        <h1 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-slate-900'}`}>Itineraries</h1>
        <p className={`text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
          Manage itineraries and clear activities when needed
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 text-rose-700 px-4 py-3 text-sm">{error}</div>
      )}

      {loading ? (
        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>Loading…</p>
      ) : items.length === 0 ? (
        <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>No itineraries found.</p>
      ) : (
        <div className="space-y-3">
          {items.map((it) => {
            const id = it._id || it.id
            const actCount = (it.days || []).reduce((n, d) => n + (d.activities?.length || 0), 0)
            return (
              <div key={id} className={`rounded-2xl border px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3 ${base} ${border}`}>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold truncate">{it.title || it.destination || 'Untitled'}</p>
                  <p className={`text-xs mt-0.5 ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                    {it.status || '—'} · {it.days?.length || 0} days · {actCount} activities
                  </p>
                </div>
                <button
                  type="button"
                  disabled={busyId === id || actCount === 0}
                  onClick={() => clearAllActivities(id)}
                  className="px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500 text-white hover:bg-rose-600 disabled:opacity-40"
                >
                  {busyId === id ? 'Clearing…' : 'Delete All Activities'}
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
