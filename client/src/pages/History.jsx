import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import { ChevronLeft, RotateCcw, Clock, User, ChevronDown, ChevronUp, History as HistoryIcon } from "lucide-react";

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hrs < 24) return `${hrs}h ago`;
  return `${days}d ago`;
}

export default function History() {
  const { id, variantId } = useParams();
  const [variant, setVariant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [restoring, setRestoring] = useState(null);
  const [expanded, setExpanded] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api.get(`/sections/${id}`)
      .then((res) => {
        const v = res.data.variants.find((v) => v._id === variantId);
        setVariant(v);
      })
      .catch(() => setError("Failed to load history"))
      .finally(() => setLoading(false));
  }, [id, variantId]);

  const restore = async (index) => {
    if (!confirm("Restore this version? The current content will be saved to history.")) return;
    setRestoring(index);
    try {
      const res = await api.post(`/variants/${variantId}/restore/${index}`);
      setVariant(res.data);
      setExpanded(null);
    } catch {
      setError("Failed to restore version");
    } finally {
      setRestoring(null);
    }
  };

  if (loading) return (
    <Layout>
      <div className="flex justify-center py-24">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-violet-600 border-t-transparent" />
      </div>
    </Layout>
  );

  if (!variant) return (
    <Layout>
      <div className="text-center py-24 text-gray-400">Variant not found.</div>
    </Layout>
  );

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <div className="mb-8">
          <Link to={`/sections/${id}`} className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-violet-600 mb-4 transition-colors font-medium">
            <ChevronLeft size={15} /> Back to variants
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-violet-100 flex items-center justify-center">
              <HistoryIcon size={20} className="text-violet-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Edit History</h1>
              <p className="text-gray-500 text-sm mt-0.5">
                <span className="font-semibold text-gray-700">{variant.title}</span>
                {" "}· {variant.editHistory?.length || 0} saved version{variant.editHistory?.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl px-4 py-3 mb-6">{error}</div>
        )}

        {/* Current version */}
        <div className="bg-gradient-to-br from-violet-50 to-indigo-50 border-2 border-violet-200 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xs font-bold text-violet-700 bg-violet-100 border border-violet-200 px-3 py-1 rounded-full uppercase tracking-wide">
              Current Version
            </span>
          </div>
          <p className="text-sm text-gray-700 whitespace-pre-wrap leading-[1.8]">{variant.body}</p>
        </div>

        {/* History timeline */}
        {variant.editHistory?.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-gray-200">
            <Clock size={36} className="mx-auto text-gray-200 mb-3" />
            <p className="text-gray-500 font-semibold">No edit history yet</p>
            <p className="text-gray-400 text-sm mt-1">History is saved automatically every time you edit this variant.</p>
          </div>
        ) : (
          <div>
            <h2 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Previous Versions</h2>
            <div className="relative">
              <div className="absolute left-5 top-4 bottom-4 w-0.5 bg-gradient-to-b from-violet-200 to-gray-100" />
              <div className="space-y-4">
                {variant.editHistory.map((entry, idx) => (
                  <div key={idx} className="relative pl-14">
                    <div className="absolute left-[14px] top-5 w-3 h-3 rounded-full bg-white border-2 border-violet-400 shadow-sm" />
                    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-violet-200 hover:shadow-md transition-all">
                      {/* Entry header */}
                      <div className="px-5 py-4 flex items-center justify-between gap-3 bg-gray-50 border-b border-gray-100">
                        <div className="flex items-center gap-4 text-xs text-gray-500 flex-wrap">
                          <span className="flex items-center gap-1.5 font-semibold text-gray-700">
                            <User size={13} className="text-violet-400" />
                            @{entry.editedBy || "unknown"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <Clock size={13} />
                            {timeAgo(entry.editedAt)}
                          </span>
                          <span className="text-gray-400">
                            {new Date(entry.editedAt).toLocaleDateString("en-IN", {
                              day: "numeric", month: "short", year: "numeric",
                              hour: "2-digit", minute: "2-digit"
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => restore(idx)}
                            disabled={restoring === idx}
                            className="flex items-center gap-1.5 text-xs px-3 py-1.5 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors disabled:opacity-60 font-medium"
                          >
                            <RotateCcw size={12} />
                            {restoring === idx ? "Restoring..." : "Restore"}
                          </button>
                          <button
                            onClick={() => setExpanded(expanded === idx ? null : idx)}
                            className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-200 rounded-lg transition-colors"
                          >
                            {expanded === idx ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                          </button>
                        </div>
                      </div>
                      {/* Entry body */}
                      <div className="px-5 py-4">
                        <p className={`text-sm text-gray-600 whitespace-pre-wrap leading-[1.8] ${expanded === idx ? "" : "line-clamp-3"}`}>
                          {entry.body}
                        </p>
                        {!expanded && entry.body.length > 200 && (
                          <button onClick={() => setExpanded(idx)} className="text-xs text-violet-600 hover:underline mt-2">
                            Show full content
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
