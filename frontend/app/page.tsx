"use client";
import { useState } from "react";

import ReactMarkdown from "react-markdown";

export default function Home() {
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState("");

  const handleGenerateTrip = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setRecommendation("");

    try {
      const tripRes = await fetch("http://localhost:8000/api/v1/trips", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ destination, budget: parseFloat(budget), days: parseInt(days), travel_style: travelStyle }),
      });
      const tripData = await tripRes.json();

      const aiRes = await fetch(`http://localhost:8000/api/v1/trips/${tripData.id}/generate`, { method: "POST" });
      const aiData = await aiRes.json();
      setRecommendation(aiData.recommendation);
    } catch (err) {
      alert("Error generating trip. Make sure the backend is running!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 text-black">
      <div className="max-w-3xl mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold text-blue-600 text-center">KelanaAI</h1>
        <form onSubmit={handleGenerateTrip} className="bg-white shadow p-6 rounded-lg space-y-4">
          <input className="w-full border border-gray-300 p-2 rounded" required placeholder="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} />
          <input className="w-full border border-gray-300 p-2 rounded" required type="number" placeholder="Budget (USD)" value={budget} onChange={(e) => setBudget(e.target.value)} />
          <input className="w-full border border-gray-300 p-2 rounded" required type="number" placeholder="Days" value={days} onChange={(e) => setDays(e.target.value)} />
          <input className="w-full border border-gray-300 p-2 rounded" required placeholder="Travel Style" value={travelStyle} onChange={(e) => setTravelStyle(e.target.value)} />
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 disabled:bg-gray-400">
            {loading ? "Generating..." : "Generate AI Trip"}
          </button>
        </form>
       
        {recommendation && (
        <div className="bg-white p-6 shadow rounded prose max-w-none">
         <ReactMarkdown>{recommendation}</ReactMarkdown>
        </div>
)}
      </div>
    </main>
  );
}