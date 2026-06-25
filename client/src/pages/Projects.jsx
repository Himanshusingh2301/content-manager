import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import { Plus, FolderKanban, Trash2, Pencil, ChevronRight, X, Check, Layers } from "lucide-react";

const COLORS = [
  "#7c3aed", "#2563eb", "#059669", "#d97706", "#dc2626",
  "#db2777", "#0891b2", "#65a30d", "#6366f1", "#0f172a",
];

export default function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", color: COLORS[0] });
  const [submitting, setSubmitting] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({ name: "", description: "", color: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    api.get("/projects")
      .then((res) => setProjects(res.data))
      .catch(() => setError("Failed to load projects"))
      .finally(() => setLoading(false));
  }, []);

  const createProject = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSubmitting(true);
    try {
      const res = await api.post("/projects", form);
      setProjects([res.data, ...projects]);
      setForm({ name: "", description: "", color: COLORS[0] });
      setShowForm(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create project");
    } finally {
      setSubmitting(false);
    }
  };

  const saveEdit = async (id) => {
    try {
      const res = await api.put(`/projects/${id}`, editForm);
      setProjects(projects.map((p) => p._id === id ? { ...res.data, sectionCount: p.sectionCount } : p));
      setEditingId(null);
    } catch {
      setError("Failed to update project");
    }
  };

  const deleteProject = async (id) => {
    if (!confirm("Delete this project and all its content? This cannot be undone.")) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(projects.filter((p) => p._id !== id));
    } catch {
      setError("Failed to delete project");
    }
  };

  return (
    <Layout>
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
            <p className="text-gray-500 mt-1">Manage all your website content projects</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 bg-violet-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-violet-700 transition-colors shadow-sm"
          >
            {showForm ? <X size={16} /> : <Plus size={16} />}
            {showForm ? "Cancel" : "New Project"}
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6 flex items-center justify-between">
            {error} <button onClick={() => setError("")}><X size={14} /></button>
          </div>
        )}

        {/* Create form */}
        {showForm && (
          <form onSubmit={createProject} className="bg-white border-2 border-violet-200 rounded-2xl p-6 mb-8 shadow-lg shadow-violet-50">
            <div className="flex items-center gap-2 mb-5">
              <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                <FolderKanban size={15} className="text-violet-600" />
              </div>
              <h2 className="font-bold text-gray-800 text-lg">New Project</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Project Name</label>
                <input
                  autoFocus required
                  placeholder="e.g. Company Website, Product Landing Page"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description <span className="font-normal text-gray-400">(optional)</span></label>
                <input
                  placeholder="Brief description of this project"
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Project Color</label>
                <div className="flex gap-3 flex-wrap">
                  {COLORS.map((c) => (
                    <button
                      key={c} type="button"
                      onClick={() => setForm({ ...form, color: c })}
                      className={`w-8 h-8 rounded-full transition-all ${form.color === c ? "scale-125 ring-3 ring-offset-2 ring-gray-400 shadow-md" : "hover:scale-110"}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-2 border-t border-gray-100">
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-5 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" disabled={submitting}
                  className="px-6 py-2.5 bg-violet-600 text-white text-sm font-semibold rounded-xl hover:bg-violet-700 disabled:opacity-60 transition-colors shadow-sm">
                  {submitting ? "Creating..." : "Create Project"}
                </button>
              </div>
            </div>
          </form>
        )}

        {/* Projects grid */}
        {loading ? (
          <div className="flex justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-violet-600 border-t-transparent" />
          </div>
        ) : projects.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <FolderKanban size={52} className="mx-auto text-gray-200 mb-4" />
            <p className="text-gray-600 font-semibold text-lg">No projects yet</p>
            <p className="text-gray-400 text-sm mt-1">Create your first project to start managing content</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {projects.map((project) => (
              <div key={project._id}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-gray-300 transition-all duration-200 group">

                {/* Top color strip */}
                <div className="h-2" style={{ backgroundColor: project.color }} />

                {editingId === project._id ? (
                  <div className="p-5 space-y-3">
                    <input autoFocus value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50"
                    />
                    <input value={editForm.description} placeholder="Description"
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 bg-gray-50"
                    />
                    <div className="flex gap-2 flex-wrap">
                      {COLORS.map((c) => (
                        <button key={c} type="button" onClick={() => setEditForm({ ...editForm, color: c })}
                          className={`w-6 h-6 rounded-full transition-all ${editForm.color === c ? "scale-125 ring-2 ring-offset-1 ring-gray-400" : "hover:scale-110"}`}
                          style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <div className="flex gap-2 justify-end pt-1">
                      <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                      <button onClick={() => saveEdit(project._id)} className="px-4 py-1.5 bg-violet-600 text-white text-sm font-semibold rounded-lg hover:bg-violet-700 flex items-center gap-1.5">
                        <Check size={13} /> Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-5">
                    <div className="flex items-start justify-between gap-2 mb-4">
                      <Link to={`/projects/${project._id}`} className="min-w-0 flex-1">
                        <h3 className="font-bold text-gray-900 group-hover:text-violet-700 transition-colors text-base leading-snug">
                          {project.name}
                        </h3>
                        {project.description && (
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2 leading-relaxed">{project.description}</p>
                        )}
                      </Link>
                      <div className="flex gap-0.5 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => { setEditingId(project._id); setEditForm({ name: project.name, description: project.description || "", color: project.color }); }}
                          className="p-1.5 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => deleteProject(project._id)}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                    <Link to={`/projects/${project._id}`}
                      className="flex items-center justify-between pt-3 border-t border-gray-100 text-sm text-gray-500 hover:text-violet-600 transition-colors group/link">
                      <span className="flex items-center gap-1.5">
                        <Layers size={14} />
                        {project.sectionCount} section{project.sectionCount !== 1 ? "s" : ""}
                      </span>
                      <span className="flex items-center gap-1 font-medium text-xs group-hover/link:translate-x-0.5 transition-transform">
                        Open <ChevronRight size={14} />
                      </span>
                    </Link>
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
