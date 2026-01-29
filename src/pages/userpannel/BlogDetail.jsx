import { useEffect, useState } from 'react'
import api from '../../api'

export default function BlogDetail({ blogId, onBack, onHomeClick, hideHeaderFooter = false }) {
  const [blog, setBlog] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const fallbackBlogs = [
    {
      id: '1',
      title: 'Travel Experience',
      subtitle: 'ADVENTURE',
      image: '/assets/blog1.jpeg',
      content:
        'Discover how to plan an unforgettable adventure with the right balance of exploration, comfort, and local experiences. From choosing the best season to visit to building a flexible itinerary, these tips will help you travel smarter and enjoy every moment.'
    },
    {
      id: '2',
      title: 'Mountain Path',
      subtitle: 'NATURE',
      image: '/assets/blog2.jpeg',
      content:
        'Mountain journeys are about patience and preparation. Learn what to pack, how to pace your route, and how to capture the best views while staying safe. This guide covers essentials for beginner and intermediate travelers.'
    },
    {
      id: '3',
      title: 'Ocean View',
      subtitle: 'BEACH',
      image: '/assets/blog3.jpeg',
      content:
        'If you love calm waters and coastal vibes, here are the best ways to plan a beach escape: where to stay, what to do beyond the shoreline, and how to find authentic food spots. Perfect for families and couples alike.'
    },
    {
      id: '4',
      title: 'City Streets',
      subtitle: 'CULTURE',
      image: '/assets/blog4.jpeg',
      content:
        'City travel is all about discovering hidden neighborhoods, local markets, and culture-rich streets. Get practical tips on transport, budgeting, and must-visit experiences that make a city trip feel premium and memorable.'
    }
  ]

  useEffect(() => {
    const fetchBlog = async () => {
      const effectiveId = blogId || (() => {
        try {
          return sessionStorage.getItem('selectedBlogId')
        } catch (e) {
          return null
        }
      })()

      if (!effectiveId) {
        setBlog(null)
        setIsLoading(false)
        return
      }

      try {
        setIsLoading(true)
        let data = null
        try {
          const res = await api.get(`/blogs/${effectiveId}`)
          data = res?.data || null
        } catch (e) {
          // fallback below
        }

        if (!data) {
          try {
            const listRes = await api.get('/blogs')
            const list = Array.isArray(listRes?.data) ? listRes.data : []
            const match = list.find(b => String(b?._id || b?.id) === String(effectiveId))
            data = match || null
          } catch (e) {
            // ignore and use local fallback
          }
        }

        if (!data) {
          const fallbackMatch = fallbackBlogs.find(b => String(b.id) === String(effectiveId))
          data = fallbackMatch || fallbackBlogs[0] || null
        }

        setBlog(data)
        try {
          sessionStorage.setItem('selectedBlogId', String(effectiveId))
        } catch (e) {
          // ignore
        }
      } catch (error) {
        console.error('Error fetching blog:', error)
        const fallbackMatch = fallbackBlogs.find(b => String(b.id) === String(blogId))
        setBlog(fallbackMatch || fallbackBlogs[0] || null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBlog()
  }, [blogId])

  const title = blog?.title || 'Blog'
  const image = blog?.image || blog?.imageUrl || blog?.coverImage || blog?.Picture || blog?.images?.[0] || '/assets/blog1.jpeg'
  const subtitle = blog?.subtitle || blog?.category || ''
  const content = blog?.content || blog?.description || blog?.body || blog?.details || ''

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
