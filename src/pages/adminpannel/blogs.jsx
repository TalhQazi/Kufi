import React, { useEffect, useMemo, useState } from "react";
import { ArrowRight, Eye, Pencil, Search, Trash2 } from "lucide-react";
import api from "../../api";
import AddBlog from "./add-blog";

const Blogs = ({ onAddNew }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [listingData, setListingData] = useState([]);

  const [viewingBlog, setViewingBlog] = useState(null);
  const [viewLoading, setViewLoading] = useState(false);

  const [editingBlog, setEditingBlog] = useState(null);
  const [editLoading, setEditLoading] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.get("/blogs");
      const data = Array.isArray(response.data)
        ? response.data
        : response.data?.blogs || [];

      const transformed = data.map((item) => ({
        id: item._id || item.id,
        title: item.title || "Untitled",
        image: item.image || "",
        category: item.category || "",
        description: item.description || "",
        createdAt: item.createdAt,
      }));

      setListingData(transformed);
    } catch (error) {
      console.error("Error fetching blogs:", error);
      setListingData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleView = async (id) => {
    try {
      setViewLoading(true);
      const res = await api.get(`/blogs/${id}`);
      setViewingBlog(res.data);
    } catch (error) {
      console.error("Error fetching blog details:", error);
      alert("Failed to load blog details");
    } finally {
      setViewLoading(false);
    }
  };

  const handleEdit = async (id) => {
    try {
      setEditLoading(true);
      const res = await api.get(`/blogs/${id}`);
      setEditingBlog(res.data);
    } catch (error) {
      console.error("Error fetching blog for edit:", error);
      alert("Failed to load blog for edit");
    } finally {
      setEditLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await api.delete(`/blogs/${id}`);
        fetchBlogs();
      } catch (error) {
        console.error("Error deleting blog:", error);
        alert("Failed to delete blog");
      }
    }
  };

  const filteredBlogs = useMemo(() => {
    const q = String(searchQuery || "").trim().toLowerCase();
    if (!q) return listingData;
    return listingData.filter((b) => {
      return (
        String(b.title || "").toLowerCase().includes(q) ||
        String(b.category || "").toLowerCase().includes(q) ||
        String(b.description || "").toLowerCase().includes(q)
      );
    });
  }, [listingData, searchQuery]);

  if (viewingBlog) {
    const image = viewingBlog?.image || "/assets/activity1.jpeg";

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">View Blog</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Review blog content</p>
          </div>
          <button
            className="inline-flex items-center justify-center gap-2 bg-gray-100 text-gray-700 text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2.5 rounded-lg hover:bg-gray-200 transition-colors"
            onClick={() => setViewingBlog(null)}
          >
            Back
          </button>
        </div>

        <div className="bg-white rounded-2xl card-shadow border border-gray-100 p-5 space-y-4">
          <div className="flex flex-col md:flex-row gap-5">
            <img src={image} alt={viewingBlog?.title} className="w-full md:w-72 h-44 md:h-56 rounded-xl object-cover border border-gray-200" />
            <div className="flex-1 space-y-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-[#c18c4d] font-semibold">Title</p>
                <p className="text-sm font-semibold text-slate-900 mt-1">{viewingBlog?.title}</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-[#c18c4d] font-semibold">Category</p>
                <p className="text-sm font-medium text-slate-700 mt-1">{viewingBlog?.category || "—"}</p>
              </div>
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-[#c18c4d] font-semibold">Description</p>
            <p className="text-sm text-slate-700 mt-2 whitespace-pre-wrap">{viewingBlog?.description || ""}</p>
          </div>
        </div>
      </div>
    );
  }

  if (editingBlog) {
    return (
      <AddBlog
        onBack={() => {
          setEditingBlog(null);
        }}
        initialData={editingBlog}
        blogId={editingBlog?._id || editingBlog?.id}
        onSaved={() => {
          setEditingBlog(null);
          fetchBlogs();
        }}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">Blogs</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage blog posts and content</p>
        </div>
        <button
          className="inline-flex items-center justify-center gap-2 bg-[#a26e35] text-white text-xs sm:text-sm font-semibold px-4 sm:px-6 py-2.5 rounded-lg shadow-sm hover:bg-[#8b5c2a] transition-colors w-full sm:w-auto"
          onClick={onAddNew}
        >
          <ArrowRight className="w-4 h-4" />
          Add New Blog
        </button>
      </div>

      <div className="bg-white rounded-2xl card-shadow border border-gray-100 p-5 space-y-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-[#c18c4d] font-semibold">Blogs</p>
          <div className="mt-4 flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex items-center bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 text-sm text-gray-500 ml-0 md:ml-auto w-full md:w-auto">
              <Search className="w-4 h-4 mr-2 text-gray-400 shrink-0" />
              <input
                type="text"
                placeholder="Search blogs..."
                className="bg-transparent outline-none text-sm placeholder:text-gray-400 w-full md:w-60"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="md:hidden space-y-4">
          {loading ? (
            <div className="py-20 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-brown"></div>
            </div>
          ) : filteredBlogs.length === 0 ? (
            <div className="py-10 text-center text-sm text-gray-500 bg-gray-50/30 rounded-xl border border-gray-100">
              No blogs found.
            </div>
          ) : (
            filteredBlogs.map((item) => (
              <div key={item.id} className="bg-gray-50/50 rounded-xl p-4 border border-gray-100 space-y-3">
                <div className="flex justify-between items-start gap-3">
                  <div className="flex items-start gap-3 min-w-0">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-900 text-sm truncate">{item.title}</p>
                      <p className="text-xs text-gray-500 mt-0.5 truncate">{item.category || "—"}</p>
                    </div>
                  </div>
                </div>

                <div className="text-[11px] border-y border-gray-100 py-3">
                  <p className="text-gray-400 font-bold uppercase tracking-wider mb-0.5">Description</p>
                  <p className="text-slate-700 font-medium line-clamp-3">{item.description || ""}</p>
                </div>

                <div className="flex items-center justify-between gap-3 pt-1">
                  <button
                    className="flex-1 py-1.5 rounded-lg bg-gray-100 text-gray-600 text-xs font-bold flex items-center justify-center gap-1 hover:bg-gray-200 transition-colors"
                    onClick={() => handleView(item.id)}
                    disabled={viewLoading}
                  >
                    <Eye className="w-3.5 h-3.5" /> View
                  </button>
                  <button
                    className="flex-1 py-1.5 rounded-lg bg-[#f7f1e7] text-[#704b24] text-xs font-bold flex items-center justify-center gap-1 hover:bg-[#efe2cf] transition-colors"
                    onClick={() => handleEdit(item.id)}
                    disabled={editLoading}
                  >
                    <Pencil className="w-3.5 h-3.5" /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex-1 py-1.5 rounded-lg bg-gray-900 text-white text-xs font-bold flex items-center justify-center gap-1 hover:bg-black transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="hidden md:block overflow-hidden rounded-xl border border-gray-100">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Description</th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="3" className="py-14 text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-brown mx-auto"></div>
                  </td>
                </tr>
              ) : filteredBlogs.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-12 text-center text-gray-500">
                    No blogs found.
                  </td>
                </tr>
              ) : (
                filteredBlogs.map((item) => (
                  <tr key={item.id} className="bg-white hover:bg-gray-50/50 transition-colors">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        {item.image ? (
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-100 border border-gray-200" />
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{item.title}</p>
                          <p className="text-xs text-gray-500 truncate">{item.category || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-slate-600 max-w-[520px]">
                      <p className="text-xs text-slate-600 line-clamp-2">
                        {item.description || '—'}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                          onClick={() => handleView(item.id)}
                          title="View"
                          type="button"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg bg-[#f7f1e7] text-[#704b24] hover:bg-[#efe2cf] transition-colors"
                          onClick={() => handleEdit(item.id)}
                          title="Edit"
                          type="button"
                          disabled={editLoading}
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-lg bg-gray-900 text-white hover:bg-black transition-colors"
                          onClick={() => handleDelete(item.id)}
                          title="Delete"
                          type="button"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Blogs;
