import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import { Plus, Trash2, Pencil, History, GitCompare, Check, X, Star, ChevronLeft, Save, FileText } from "lucide-react";

export default function SectionDetail() {
  const { id } = useParams();
  const [section, setSection] = useState(null);
  const [variants, setVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newVariant, setNewVariant] = useState({ title: "", body: "" });
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ title: "", body: "" });
  const [compareIds, setCompareIds] = useState([]);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get(`/sections/${id}`)
      .then((res) => { setSection(res.data.section); setVariants(res.data.variants); })
      .catch(() => setError("Failed to load section"))
      .finally(() => setLoading(false));
  }, [id]);

  const addVariant = async (e) => {
    e.preventDefault();
    if (!newVariant.title.trim() || !newVariant.body.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post("/variants", { ...newVariant, sectionId: id });
      setVariants([res.data, ...variants]);
      setNewVariant({ title: "", body: "" });
      setShowAddForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add variant");
    } finally {
      setSubmitting(false);
    }
  };

  const saveEdit = async (variantId) => {
    try {
      const res = await api.put(`/variants/${variantId}`, editForm);
      setVariants(variants.map((v) => (v._id === variantId ? res.data : v)));
      setEditingId(null);
    } catch {
      setError("Failed to save changes");
    }
  };

  const deleteVariant = async (variantId) => {
    if (!confirm("Delete this variant? This cannot be undone.")) return;
    try {
      await api.delete(`/variants/${variantId}`);
      setVariants(variants.filter((v) => v._id !== variantId));
    } catch {
      setError("Failed to delete variant");
    }
  };

  const toggleActive = async (variantId, isActive) => {
    try {
      await api.patch(`/variants/${variantId}/activate`);
      setVariants(variants.map((v) => ({
        ...v,
        isActive: v._id === variantId ? !isActive : isActive ? v.isActive : false,
      })));
    } catch {
      setError("Failed to update active status");
    }
  };

  const toggleCompare = (variantId) => {
    setCompareIds((prev) => {
      if (prev.includes(variantId)) return prev.filter((x) => x !== variantId);
      if (prev.length >= 2) return [prev[1], variantId];
      return [...prev, variantId];
    });
  };

  if (loading) return (
    <Layout>
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-violet-600 border-t-transparent" />
      </div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">

        {/* Breadcrumb + header */}
        <div className="mb-8">
          <Link
            to={section?.project ? `/projects/${section.project._id || section.project}` : "/projects"}
            className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-violet-600 mb-4 transition-colors font-medium"
          >
            <ChevronLeft size={15} /> Back to project
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 leading-tight">{section?.name}</h1>
              {section?.description && (
                <p className="text-gray-500 mt-1.5">{section.description}</p>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap justify-end flex-shrink-0">
              {compareIds.length === 2 && (
                <Link
                  to={`/sections/${id}/compare?a=${compareIds[0]}&b=${compareIds[1]}`}
                  className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  <GitCompare size={15} /> Compare Selected
                </Link>
              )}
              {compareIds.length === 1 && (
                <span className="text-sm text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-2 rounded-xl font-medium">
                  Select 1 more to compare
                </span>
              )}
              <button
                onClick={() => { setShowAddForm(!showAddForm); setEditingId(null); }}
                className="flex items-center gap-2 bg-violet-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm"
              >
                {showAddForm ? <X size={15} /> : <Plus size={15} />}
                {showAddForm ? "Cancel" : "Add Variant"}
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
            {error}
            <button onClick={() => setError("")} className="ml-3 flex-shrink-0"><X size={15} /></button>
          </div>
        )}

        {/* Add variant form */}
        {showAddForm && (
          <form onSubmit={addVariant} className="bg-white border-2 border-violet-200 rounded-2xl p-6 mb-8 shadow-lg shadow-violet-50">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                <Plus size={15} className="text-violet-600" />
              </div>
              <h2 className="font-bold text-gray-800 text-lg">New Content Variant</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Variant Title</label>
                <input
                  autoFocus required
                  placeholder="e.g. Version A, Hero Short Copy, Formal Tone..."
                  value={newVariant.title}
                  onChange={(e) => setNewVariant({ ...newVariant, title: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Content</label>
                <textarea
                  required
                  rows={12}
                  placeholder="Write your content here. You can include headings, bullet points, descriptions, CTAs — anything that belongs in this section..."
                  value={newVariant.body}
                  onChange={(e) => setNewVariant({ ...newVariant, body: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent bg-gray-50 focus:bg-white transition-colors resize-y leading-relaxed"
                />
                <p className="text-xs text-gray-400 mt-1.5">{newVariant.body.length} characters</p>
              </div>
              <div className="flex gap-3 justify-end pt-1">
                <button type="button" onClick={() => setShowAddForm(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={submitting}
                  className="px-6 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-60 transition-colors shadow-sm flex items-center gap-2">
                  {submitting ? (
                    <><svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> Saving...</>
                  ) : <><Save size={14} /> Save Variant</>}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Compare tip */}
        {variants.length >= 2 && compareIds.length === 0 && (
          <div className="flex items-center gap-2.5 text-sm text-indigo-700 bg-indigo-50 border border-indigo-100 rounded-xl px-4 py-3 mb-6">
            <GitCompare size={16} className="text-indigo-500 flex-shrink-0" />
            <span>Tip: Click the <strong>compare</strong> icon on any two variants to compare them side by side</span>
          </div>
        )}

        {/* Variants */}
        {variants.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <FileText size={44} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500 font-semibold text-lg">No variants yet</p>
            <p className="text-gray-400 text-sm mt-1">Click "Add Variant" to write your first version of this section</p>
          </div>
        ) : (
          <div className="space-y-5">
            {variants.map((variant, index) => {
              const isSelected = compareIds.includes(variant._id);
              return (
                <div
                  key={variant._id}
                  className={`bg-white rounded-2xl transition-all duration-200 overflow-hidden ${
                    isSelected
                      ? "border-2 border-indigo-400 shadow-lg shadow-indigo-50"
                      : variant.isActive
                      ? "border-2 border-emerald-400 shadow-md shadow-emerald-50"
                      : "border border-gray-200 hover:border-violet-200 hover:shadow-md"
                  }`}
                >
                  {editingId === variant._id ? (
                    /* ── EDIT MODE ── */
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-5">
                        <div className="w-6 h-6 rounded-md bg-violet-100 flex items-center justify-center">
                          <Pencil size={13} className="text-violet-600" />
                        </div>
                        <span className="text-sm font-semibold text-gray-700">Editing variant</span>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Title</label>
                          <input
                            autoFocus
                            value={editForm.title}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 focus:bg-white transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">Content</label>
                          <textarea
                            rows={14}
                            value={editForm.body}
                            onChange={(e) => setEditForm({ ...editForm, body: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-y bg-gray-50 focus:bg-white transition-colors leading-relaxed"
                          />
                          <p className="text-xs text-gray-400 mt-1.5">{editForm.body.length} characters</p>
                        </div>
                        <div className="flex gap-3 justify-end pt-1 border-t border-gray-100">
                          <button onClick={() => setEditingId(null)}
                            className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
                            Cancel
                          </button>
                          <button onClick={() => saveEdit(variant._id)}
                            className="px-6 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 flex items-center gap-2 transition-colors shadow-sm">
                            <Save size={14} /> Save Changes
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* ── VIEW MODE ── */
                    <>
                      {/* Card header */}
                      <div className={`px-6 py-4 flex items-center justify-between gap-3 border-b ${
                        isSelected ? "bg-indigo-50 border-indigo-100"
                        : variant.isActive ? "bg-emerald-50 border-emerald-100"
                        : "bg-gray-50 border-gray-100"
                      }`}>
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-xs font-bold text-gray-400 bg-white border border-gray-200 px-2 py-0.5 rounded-md">
                            #{index + 1}
                          </span>
                          <h3 className="font-bold text-gray-900 text-base truncate">{variant.title}</h3>
                          {variant.isActive && (
                            <span className="text-xs bg-emerald-500 text-white px-2.5 py-0.5 rounded-full font-semibold flex-shrink-0">
                              ✓ Active
                            </span>
                          )}
                          {isSelected && (
                            <span className="text-xs bg-indigo-500 text-white px-2.5 py-0.5 rounded-full font-semibold flex-shrink-0">
                              Selected
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <button onClick={() => toggleCompare(variant._id)} title="Select for comparison"
                            className={`p-2 rounded-lg transition-colors ${isSelected ? "bg-indigo-100 text-indigo-600" : "text-gray-400 hover:text-indigo-600 hover:bg-indigo-50"}`}>
                            <GitCompare size={16} />
                          </button>
                          <button onClick={() => toggleActive(variant._id, variant.isActive)}
                            title={variant.isActive ? "Click to deactivate" : "Set as active"}
                            className={`p-2 rounded-lg transition-colors ${variant.isActive ? "text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50" : "text-gray-400 hover:text-yellow-500 hover:bg-yellow-50"}`}>
                            <Star size={16} fill={variant.isActive ? "currentColor" : "none"} />
                          </button>
                          <Link to={`/sections/${id}/history/${variant._id}`} title="View edit history"
                            className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                            <History size={16} />
                          </Link>
                          <button onClick={() => { setEditingId(variant._id); setEditForm({ title: variant.title, body: variant.body }); setShowAddForm(false); }}
                            title="Edit variant"
                            className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                            <Pencil size={16} />
                          </button>
                          <button onClick={() => deleteVariant(variant._id)} title="Delete variant"
                            className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Card body — content */}
                      <div className="px-6 py-5">
                        <p className="text-gray-700 text-sm whitespace-pre-wrap leading-[1.8] font-[15px]">{variant.body}</p>
                      </div>

                      {/* Card footer */}
                      <div className="px-6 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
                        <span>Created by <span className="font-semibold text-gray-600">@{variant.createdBy || "unknown"}</span></span>
                        <span>{variant.editHistory?.length || 0} edit{variant.editHistory?.length !== 1 ? "s" : ""} in history</span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}
