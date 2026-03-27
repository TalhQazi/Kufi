import React, { useEffect, useMemo, useState } from 'react'
import { Pencil, Plus, Search, Trash2, X } from 'lucide-react'
import api from '../../api'

const emptyDraft = {
  type: 'feedback',
  name: '',
  role: 'client',
  note: '',
  rating: 5,
  image: '',
  country: '',
  isActive: true,
  sortOrder: 0,
}

const toDataUrl = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

const normalizeRoleLabel = (role) => {
  const r = String(role || '').toLowerCase().trim()
  return r === 'traveler' ? 'TRAVELER' : 'CLIENT'
}

export default function ReviewController() {
  const [activeType, setActiveType] = useState('feedback')
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [countries, setCountries] = useState([])
  const [countriesLoading, setCountriesLoading] = useState(false)

  const [modalOpen, setModalOpen] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState('')
  const [draft, setDraft] = useState(emptyDraft)

  const fetchReviews = async (type) => {
    try {
      setLoading(true)
      const res = await api.get(`/reviews?type=${encodeURIComponent(type)}&includeInactive=true`)
      const data = Array.isArray(res.data) ? res.data : []
      setItems(data)
    } catch (e) {
      console.error('Error fetching reviews:', e)
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReviews(activeType)
  }, [activeType])

  useEffect(() => {
    const fetchCountries = async () => {
      try {
        setCountriesLoading(true)
        const res = await api.get('/countries')
        const list = Array.isArray(res?.data) ? res.data : []
        const mapped = list
          .filter(Boolean)
          .map((c) => ({
            id: c?._id || c?.id || c?.name,
            name: String(c?.name || '').trim(),
          }))
          .filter((c) => Boolean(c.name))
          .sort((a, b) => a.name.localeCompare(b.name))
        setCountries(mapped)
      } catch (e) {
        console.error('Error fetching countries:', e)
        setCountries([])
      } finally {
        setCountriesLoading(false)
      }
    }

    if (modalOpen && activeType === 'country' && countries.length === 0 && !countriesLoading) {
      fetchCountries()
    }
  }, [modalOpen, activeType, countries.length, countriesLoading])

  const filtered = useMemo(() => {
    const q = String(query || '').toLowerCase().trim()
    if (!q) return items
    return items.filter((r) => {
      return (
        String(r?.name || '').toLowerCase().includes(q) ||
        String(r?.note || '').toLowerCase().includes(q) ||
        String(r?.country || '').toLowerCase().includes(q)
      )
    })
  }, [items, query])

  const openAdd = () => {
    setEditingId('')
    setDraft({ ...emptyDraft, type: activeType })
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditingId(String(item?._id || item?.id || ''))
    setDraft({
      type: String(item?.type || activeType),
      name: String(item?.name || ''),
      role: String(item?.role || 'client'),
      note: String(item?.note || ''),
      rating: Number(item?.rating) || 5,
      image: String(item?.image || ''),
      country: String(item?.country || ''),
      isActive: Boolean(item?.isActive !== false),
      sortOrder: Number(item?.sortOrder) || 0,
    })
    setModalOpen(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this review?')) return
    try {
      await api.delete(`/reviews/${id}`)
      fetchReviews(activeType)
    } catch (e) {
      console.error('Error deleting review:', e)
      alert('Failed to delete review')
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)

      const payload = {
        name: String(draft.name || '').trim(),
        role: String(draft.role || 'client').toLowerCase().trim(),
        note: String(draft.note || '').trim(),
        rating: Number(draft.rating) || 5,
        image: String(draft.image || '').trim(),
        country: String(draft.country || '').trim(),
        isActive: Boolean(draft.isActive),
        sortOrder: Number(draft.sortOrder) || 0,
      }

      if (!payload.name) {
        alert('Client name is required')
        return
      }

      if (!payload.note) {
        alert('Review note is required')
        return
      }

      if (!editingId) {
        await api.post('/reviews', { ...payload, type: activeType })
      } else {
        await api.patch(`/reviews/${editingId}`, payload)
      }

      setModalOpen(false)
      setEditingId('')
      setDraft({ ...emptyDraft, type: activeType })
      fetchReviews(activeType)
    } catch (e) {
      console.error('Error saving review:', e)
      alert('Failed to save review')
    } finally {
      setSaving(false)
    }
  }

  const handleImageUpload = async (file) => {
    if (!file) return
    const maxBytes = 8 * 1024 * 1024
    if (file.size > maxBytes) {
      alert('Image must be 8MB or less')
      return
    }
    try {
      const dataUrl = await toDataUrl(file)
      setDraft((prev) => ({ ...prev, image: dataUrl }))
    } catch (e) {
      console.error('Error reading image:', e)
      alert('Failed to load image')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Reviews</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage website reviews for Feedback section and Country details</p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 bg-[#a26e35] text-white text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2.5 rounded-lg shadow-sm hover:bg-[#8b5c2a] transition-colors w-full sm:w-auto"
          onClick={openAdd}
          type="button"
        >
          <Plus className="w-4 h-4" />
          Add Review
        </button>
      </div>

      <div className="bg-white rounded-2xl card-shadow border border-gray-100 p-5 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${activeType === 'feedback'
                ? 'bg-[#a26e35] text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#ddb071]/60'
                }`}
              onClick={() => setActiveType('feedback')}
            >
              Feedback Reviews
            </button>
            <button
              type="button"
              className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition ${activeType === 'country'
                ? 'bg-[#a26e35] text-white shadow-sm'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-[#ddb071]/60'
                }`}
              onClick={() => setActiveType('country')}
            >
              Country Reviews
            </button>
          </div>

          <div className="flex items-center bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 text-sm text-gray-500 ml-0 md:ml-auto w-full md:w-auto">
            <Search className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Search reviews..."
              className="bg-transparent outline-none text-sm placeholder:text-gray-400 w-full md:w-60"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Client</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Role</th>
                {activeType === 'country' && (
                  <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Country</th>
                )}
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Note</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Active</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={activeType === 'country' ? 6 : 5} className="py-14 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-brown mx-auto"></div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={activeType === 'country' ? 6 : 5} className="py-12 text-center text-gray-500">
                    No reviews found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const id = item?._id || item?.id
                  const hasImage = Boolean(String(item?.image || '').trim())
                  const initials = String(item?.name || 'C').trim().slice(0, 1).toUpperCase()

                  return (
                    <tr key={id} className="bg-white hover:bg-gray-50/50 transition-colors">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {hasImage ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-10 h-10 rounded-full object-cover border border-gray-200"
                              onError={(e) => {
                                e.currentTarget.style.display = 'none'
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-xs font-bold">
                              {initials}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-900 truncate">{item?.name || 'Client'}</p>
                            <p className="text-xs text-gray-500 truncate">Rating: {Number(item?.rating) || 5}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-gray-600 font-semibold text-xs">
                        {normalizeRoleLabel(item?.role)}
                      </td>
                      {activeType === 'country' && (
                        <td className="px-4 py-4 text-gray-600">{item?.country || '—'}</td>
                      )}
                      <td className="px-4 py-4 text-slate-600 max-w-[520px]">
                        <p className="text-xs text-slate-600 line-clamp-2">{item?.note || '—'}</p>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${item?.isActive === false ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'}`}>
                          {item?.isActive === false ? 'No' : 'Yes'}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            className="p-2 rounded-lg bg-[#f7f1e7] text-[#704b24] hover:bg-[#efe2cf] transition-colors"
                            onClick={() => openEdit(item)}
                            title="Edit"
                            type="button"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            className="p-2 rounded-lg bg-gray-900 text-white hover:bg-black transition-colors"
                            onClick={() => handleDelete(id)}
                            title="Delete"
                            type="button"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 z-[80] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden max-h-[calc(100vh-2rem)] flex flex-col">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-slate-900">{editingId ? 'Edit Review' : 'Add Review'}</h2>
              <button
                className="p-2 rounded-lg hover:bg-gray-100 text-gray-500"
                onClick={() => setModalOpen(false)}
                type="button"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#c18c4d] font-semibold">Client Name</p>
                  <input
                    value={draft.name}
                    onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#ddb071]/60"
                    placeholder="Client name"
                  />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#c18c4d] font-semibold">Role</p>
                  <select
                    value={draft.role}
                    onChange={(e) => setDraft((p) => ({ ...p, role: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#ddb071]/60"
                  >
                    <option value="client">Client</option>
                    <option value="traveler">Traveler</option>
                  </select>
                </div>
              </div>

              {activeType === 'country' && (
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#c18c4d] font-semibold">Country (optional)</p>
                  <select
                    value={draft.country}
                    onChange={(e) => setDraft((p) => ({ ...p, country: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#ddb071]/60"
                    disabled={countriesLoading}
                  >
                    <option value="">{countriesLoading ? 'Loading countries...' : 'Select a country'}</option>
                    {countries.map((c) => (
                      <option key={c.id} value={c.name}>{c.name}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <p className="text-xs uppercase tracking-wide text-[#c18c4d] font-semibold">Review Note</p>
                <textarea
                  value={draft.note}
                  onChange={(e) => setDraft((p) => ({ ...p, note: e.target.value }))}
                  className="mt-2 w-full min-h-[120px] rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#ddb071]/60"
                  placeholder="Write review..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#c18c4d] font-semibold">Rating</p>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={draft.rating}
                    onChange={(e) => setDraft((p) => ({ ...p, rating: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#ddb071]/60"
                  />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#c18c4d] font-semibold">Sort Order</p>
                  <input
                    type="number"
                    value={draft.sortOrder}
                    onChange={(e) => setDraft((p) => ({ ...p, sortOrder: e.target.value }))}
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#ddb071]/60"
                  />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#c18c4d] font-semibold">Active</p>
                  <select
                    value={draft.isActive ? 'yes' : 'no'}
                    onChange={(e) => setDraft((p) => ({ ...p, isActive: e.target.value === 'yes' }))}
                    className="mt-2 w-full rounded-xl border border-gray-200 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#ddb071]/60"
                  >
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
                <div>
                  <p className="text-xs uppercase tracking-wide text-[#c18c4d] font-semibold">Client Image (optional)</p>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e.target.files?.[0])}
                    className="mt-2 w-full text-sm"
                  />
                  {draft.image && (
                    <div className="mt-3 flex items-center gap-3">
                      <img src={draft.image} alt="Preview" className="w-12 h-12 rounded-full object-cover border border-gray-200" />
                      <button
                        type="button"
                        className="text-xs font-semibold text-rose-600 hover:text-rose-700"
                        onClick={() => setDraft((p) => ({ ...p, image: '' }))}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
                  <p className="text-xs font-semibold text-slate-700">Preview</p>
                  <div className="mt-3 bg-white rounded-[18px] px-6 py-5 shadow-[0_16px_30px_rgba(15,23,42,0.10)] border border-slate-100 w-full min-h-[160px]">
                    <div className="flex gap-1 text-[#FFB21E] mb-3">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={`star-${i}`}
                          className={`w-3.5 h-3.5 ${i < (Number(draft.rating) || 0) ? 'fill-current' : 'fill-slate-200'}`}
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <p className="m-0 text-slate-600 text-[13px] leading-relaxed">“{draft.note || '—'}”</p>
                    <div className="mt-4 flex items-center gap-3">
                      {draft.image ? (
                        <img src={draft.image} alt={draft.name} className="w-9 h-9 rounded-full object-cover" />
                      ) : (
                        <div className="w-9 h-9 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                          {(draft.name || 'C').trim().charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="m-0 text-xs font-bold text-slate-900 truncate">{draft.name || 'Client'}</h4>
                        <p className="m-0 text-[9px] text-slate-400 font-bold uppercase tracking-[0.22em] leading-none mt-1 truncate">
                          {normalizeRoleLabel(draft.role)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end pt-2">
                <button
                  type="button"
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50"
                  onClick={() => setModalOpen(false)}
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className={`px-5 py-2.5 rounded-xl text-white font-semibold text-sm ${saving ? 'bg-[#a26e35]/60 cursor-not-allowed' : 'bg-[#a26e35] hover:bg-[#8b5c2a]'}`}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
