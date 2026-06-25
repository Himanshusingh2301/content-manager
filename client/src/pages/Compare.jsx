import { useState, useEffect } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import api from "../api/axios";
import Layout from "../components/Layout";
import { ChevronLeft, ArrowLeftRight } from "lucide-react";

function diffWords(oldStr, newStr) {
  const oldWords = oldStr.split(/(\s+)/);
  const newWords = newStr.split(/(\s+)/);
  const result = [];
  const maxLen = Math.max(oldWords.length, newWords.length);

  for (let i = 0; i < maxLen; i++) {
    const oldWord = oldWords[i] || "";
    const newWord = newWords[i] || "";
    if (oldWord === newWord) {
      result.push({ type: "same", value: newWord });
    } else {
      if (oldWord) result.push({ type: "removed", value: oldWord });
      if (newWord) result.push({ type: "added", value: newWord });
    }
  }
  return result;
}

function DiffView({ textA, textB }) {
  const diff = diffWords(textA, textB);
  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap">
      {diff.map((part, i) => {
        if (part.type === "removed") return null;
        if (part.type === "added")
          return (
            <mark key={i} className="bg-green-100 text-green-800 rounded px-0.5">
              {part.value}
            </mark>
          );
        return <span key={i}>{part.value}</span>;
      })}
    </p>
  );
}

function RemovedView({ textA, textB }) {
  const diff = diffWords(textA, textB);
  return (
    <p className="text-sm leading-relaxed whitespace-pre-wrap">
      {diff.map((part, i) => {
        if (part.type === "added") return null;
        if (part.type === "removed")
          return (
            <mark key={i} className="bg-red-100 text-red-800 rounded px-0.5 line-through">
              {part.value}
            </mark>
          );
        return <span key={i}>{part.value}</span>;
      })}
    </p>
  );
}

export default function Compare() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const [variants, setVariants] = useState({ a: null, b: null });
  const [loading, setLoading] = useState(true);
  const [swapped, setSwapped] = useState(false);

  const aId = searchParams.get("a");
  const bId = searchParams.get("b");

  useEffect(() => {
    const fetchBoth = async () => {
      try {
        const res = await api.get(`/sections/${id}`);
        const all = res.data.variants;
        const a = all.find((v) => v._id === aId);
        const b = all.find((v) => v._id === bId);
        setVariants({ a, b });
      } catch {
        // handle error
      } finally {
        setLoading(false);
      }
    };
    if (aId && bId) fetchBoth();
  }, [id, aId, bId]);

  const left = swapped ? variants.b : variants.a;
  const right = swapped ? variants.a : variants.b;

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-violet-600 border-t-transparent" />
        </div>
      </Layout>
    );
  }

  if (!left || !right) {
    return (
      <Layout>
        <div className="text-center py-20 text-gray-500">
          Could not load variants for comparison.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link to={`/sections/${id}`} className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-violet-600 mb-3 transition-colors">
            <ChevronLeft size={16} /> Back to variants
          </Link>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Side-by-Side Comparison</h1>
            <button
              onClick={() => setSwapped(!swapped)}
              className="flex items-center gap-2 text-sm text-gray-600 border border-gray-300 px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <ArrowLeftRight size={16} /> Swap
            </button>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            <span className="text-red-500 font-medium">Red strikethrough</span> = removed &nbsp;|&nbsp;
            <span className="text-green-600 font-medium">Green highlight</span> = added
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-red-50 border-b border-red-100 px-5 py-3 flex items-center justify-between">
              <span className="font-semibold text-gray-800">{left.title}</span>
              <span className="text-xs text-red-500 font-medium bg-red-100 px-2 py-1 rounded-full">A (Base)</span>
            </div>
            <div className="p-5">
              <RemovedView textA={left.body} textB={right.body} />
            </div>
          </div>

          {/* Right */}
          <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="bg-green-50 border-b border-green-100 px-5 py-3 flex items-center justify-between">
              <span className="font-semibold text-gray-800">{right.title}</span>
              <span className="text-xs text-green-600 font-medium bg-green-100 px-2 py-1 rounded-full">B (Compare)</span>
            </div>
            <div className="p-5">
              <DiffView textA={left.body} textB={right.body} />
            </div>
          </div>
        </div>

        {/* Raw side by side */}
        <div className="mt-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Full Text (Raw)</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">{left.title}</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{left.body}</p>
            </div>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5">
              <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">{right.title}</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">{right.body}</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
