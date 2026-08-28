"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { generateTrip } from "@/services/tripService";

export default function Home() {
  const [destination, setDestination] = useState("");
  const [budget, setBudget] = useState("");
  const [days, setDays] = useState("");
  const [month, setMonth] = useState("");
  const [travelStyle, setTravelStyle] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await generateTrip({
        destination,
        budget: parseFloat(budget),
        days: parseInt(days),
        travel_month: month, // Matches schemas
        travel_style: travelStyle, // Matches schemas
      });
      router.push("/trips");
    } catch (err: any) {
      alert("Error Details: " + err.message); // This will show us the real culprit!
      console.error("Full error:", err);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 text-black">
      <div className="max-w-xl mx-auto space-y-8">
        <h1 className="text-4xl font-extrabold text-blue-600 text-center">KelanaAI</h1>
        <form onSubmit={handleGenerate} className="bg-white shadow p-6 rounded-lg space-y-4">
          <input className="w-full border p-2 rounded" required placeholder="Destination" value={destination} onChange={(e) => setDestination(e.target.value)} />
          <input className="w-full border p-2 rounded" required type="number" placeholder="Budget (USD)" value={budget} onChange={(e) => setBudget(e.target.value)} />
          <input className="w-full border p-2 rounded" required type="number" placeholder="Days" value={days} onChange={(e) => setDays(e.target.value)} />
          <input className="w-full border p-2 rounded" required placeholder="Month (e.g., January, February)" value={month} onChange={(e) => setMonth(e.target.value)} />
          <input className="w-full border p-2 rounded" required placeholder="Travel Style (e.g., Standard, Luxury, Backpacker, Family, Solo, Couple)" value={travelStyle} onChange={(e) => setTravelStyle(e.target.value)} />
      
          <button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded font-medium disabled:bg-gray-400">
            {loading ? "Generating AI Itinerary..." : "Generate & Save Trip"}
          </button>
        </form>
      </div>
    </main>
  );
}