import { useEffect, useState } from 'react'
import api from '../../api'

export default function BlogDetail({ blogId, onBack, onHomeClick, hideHeaderFooter = false }) {
  const [blog, setBlog] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBlog = async () => {
      if (!blogId) {
        setBlog(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        const res = await api.get(`/blogs/${blogId}`)
        setBlog(res.data || null)
      } catch (error) {
        console.error('Error fetching blog:', error)
        setBlog(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlog()
  }, [blogId])

  const title = blog?.title || 'Blog'
  const image = blog?.image || blog?.imageUrl || '/assets/blog1.jpeg'
  const subtitle = blog?.subtitle || blog?.category || ''
  const content = blog?.content || blog?.description || blog?.body || ''

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1100px] mx-auto px-4 sm:px-8 lg:px-20 py-10">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (onBack) onBack()
              }}
              className="px-4 py-2 rounded-full border border-slate-300 text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => {
                if (onHomeClick) onHomeClick()
              }}
              className="px-4 py-2 rounded-full bg-[#A67C52] text-white hover:bg-[#8e6a45] transition-colors"
            >
              Home
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-slate-500">Loading blog...</div>
        ) : !blog ? (
          <div className="py-20 text-center text-slate-500">Blog not found.</div>
        ) : (
          <>
            <div className="rounded-3xl overflow-hidden shadow-lg mb-8">
              <div
                className="w-full h-[260px] sm:h-[360px] bg-cover bg-center"
                style={{ backgroundImage: `url(${image})` }}
              />
            </div>

            <div className="max-w-[900px]">
              {subtitle && (
                <p className="m-0 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  {subtitle}
                </p>
              )}
              <h1 className="m-0 mb-4 text-3xl sm:text-4xl font-bold text-slate-900">{title}</h1>

              <div className="prose prose-slate max-w-none">
                {typeof content === 'string' && content.trim() ? (
                  <p className="text-slate-700 leading-relaxed">{content}</p>
                ) : (
                  <p className="text-slate-500">No content available for this blog.</p>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {!hideHeaderFooter && (
        <div className="border-t border-slate-200 py-8 text-center text-sm text-slate-500">
          Kufi Travel
        </div>
      )}
    </div>
  )
}
