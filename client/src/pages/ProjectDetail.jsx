import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import { Plus, Layers, Trash2, Pencil, ChevronRight, ChevronLeft, X, Check, FileText } from "lucide-react";

export default function ProjectDetail() {
  const { id } = useParams();
  const [project, setProject] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "" });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/projects/${id}`)
      .then((res) => { setProject(res.data.project); setSections(res.data.sections); })
      .catch(() => setError("Failed to load project"))
      .finally(() => setLoading(false));
  }, [id]);

  const addSection = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post("/sections", { ...form, projectId: id });
      setSections([...sections, res.data]);
      setForm({ name: "", description: "" });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to add section");
    } finally {
      setSubmitting(false);
    }
  };

  const saveEdit = async (sectionId) => {
    try {
      const res = await api.put(`/sections/${sectionId}`, editForm);
      setSections(sections.map((s) => s._id === sectionId ? { ...res.data, variantCount: s.variantCount } : s));
      setEditingId(null);
    } catch {
      setError("Failed to update section");
    }
  };

  const deleteSection = async (sectionId) => {
    if (!confirm("Delete this section and all its variants?")) return;
    try {
      await api.delete(`/sections/${sectionId}`);
      setSections(sections.filter((s) => s._id !== sectionId));
    } catch {
      setError("Failed to delete section");
    }
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
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link to="/projects" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-violet-600 mb-4 transition-colors font-medium">
            <ChevronLeft size={15} /> All Projects
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-4 h-14 rounded-full flex-shrink-0" style={{ backgroundColor: project?.color }} />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{project?.name}</h1>
                {project?.description && <p className="text-gray-500 mt-1">{project.description}</p>}
              </div>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm flex-shrink-0"
            >
              {showForm ? <X size={16} /> : <Plus size={16} />}
              {showForm ? "Cancel" : "Add Section"}
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
            {error} <button onClick={() => setError("")}><X size={14} /></button>
          </div>
        )}

        {/* Add section form */}
        {showForm && (
          <form onSubmit={addSection} className="bg-white border-2 border-violet-200 rounded-2xl p-6 mb-8 shadow-lg shadow-violet-50">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                <Layers size={15} className="text-violet-600" />
              </div>
              <h2 className="font-bold text-gray-800 text-lg">New Section</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Section Name</label>
                <input autoFocus required
                  placeholder="e.g. Hero Section, About Us, Services, FAQ"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description <span className="font-normal text-gray-400">(optional)</span></label>
                <input
                  placeholder="What content does this section hold?"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="px-6 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-60 transition-colors shadow-sm">
                  {submitting ? "Adding..." : "Add Section"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Sections list */}
        {sections.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <Layers size={44} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-600 font-semibold text-lg">No sections yet</p>
            <p className="text-gray-400 text-sm mt-1">Add sections like Hero, About, Services, FAQ...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((section, index) => (
              <div key={section._id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-violet-200 hover:shadow-md transition-all duration-200 group">
                {editingId === section._id ? (
                  <div className="p-5 space-y-3">
                    <input autoFocus value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50"
                    />
                    <input value={editForm.description} placeholder="Description"
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditingId(null)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-xl">Cancel</button>
                      <button onClick={() => saveEdit(section._id)} className="px-4 py-2 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 flex items-center gap-1.5">
                        <Check size={13} /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-4 p-5">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm text-white" style={{ backgroundColor: project?.color || "#7c3aed" }}>
                      {index + 1}
                    </div>
                    <Link to={`/sections/${section._id}`} className="flex-1 min-w-0">
                      <p className="font-bold text-gray-900 group-hover:text-violet-700 transition-colors">{section.name}</p>
                      {section.description && <p className="text-sm text-gray-500 truncate mt-0.5">{section.description}</p>}
                      <p className="text-xs text-gray-400 mt-1">
                        {section.variantCount} variant{section.variantCount !== 1 ? "s" : ""}
                      </p>
                    </Link>
                    <div className="flex items-center gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => { setEditingId(section._id); setEditForm({ name: section.name, description: section.description || "" }); }}
                        className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => deleteSection(section._id)}
                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 size={15} />
                      </button>
                      <Link to={`/sections/${section._id}`}
                        className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                        <ChevronRight size={15} />
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
