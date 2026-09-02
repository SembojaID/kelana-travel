"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function AssistantPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<{ answer: string; source: string } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
    }
  }, [router]);

  const handleAsk = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    setResponse(null);

    const token = localStorage.getItem("token");

    try {
      const res = await fetch(`${API_URL}/ask`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ question })
      });

      if (!res.ok) throw new Error("Failed to get response");

      const data = await res.json();
      setResponse({ answer: data.answer, source: data.source });
    } catch (err) {
      console.error(err);
      alert("Error reaching the AI Assistant.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 text-black">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <Link href="/trips" className="text-blue-600 font-medium hover:underline">
            ← Back to Trips
          </Link>
          <span className="text-sm font-semibold text-gray-500">Travel Assistant</span>
        </div>

        <div className="bg-white p-8 rounded-xl shadow space-y-6 border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-blue-600">Ask KelanaAI</h1>
            <p className="text-gray-500 mt-1">Powered by your trusted travel documents</p>
          </div>

          <form onSubmit={handleAsk} className="flex gap-3">
            <input
              type="text"
              placeholder="e.g. Do I need a visa to visit Japan?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 disabled:bg-blue-300"
            >
              {loading ? "Searching..." : "Ask >"}
            </button>
          </form>

          {response && (
            <div className="bg-emerald-800 text-white p-6 rounded-lg space-y-4 shadow-sm">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-200 mb-2">
                  AI Answer
                </h3>
                {/* whitespace-pre-line ensures bullet points and newlines render cleanly */}
                <div className="text-base leading-relaxed whitespace-pre-line font-sans">
                  {response.answer}
                </div>
              </div>
              <div className="border-t border-emerald-700 pt-3">
                <p className="text-xs text-emerald-200 font-mono">
                  SOURCE: <span className="underline">{response.source}</span>
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}