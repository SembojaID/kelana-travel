"use client";
import { useState, useEffect } from "react";
import { getTrips } from "@/services/tripService";
import TripCard from "@/components/TripCard";
import Link from "next/link";

export default function TripsPage() {
  const [trips, setTrips] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("latest");
  const [loading, setLoading] = useState(true);

  // Fetch data on initial load
  useEffect(() => {
    getTrips()
      .then((data) => setTrips(data))
      .catch((err) => console.error("Error loading trips:", err))
      .finally(() => setLoading(false));
  }, []);

  // 1. Filter trips based on the search term (Destination or Style)
  const filteredTrips = trips.filter((trip) => {
    const destMatch = trip.destination.toLowerCase().includes(search.toLowerCase());
    const style = trip.travel_style || trip.category || "";
    const styleMatch = style.toLowerCase().includes(search.toLowerCase());
    return destMatch || styleMatch;
  });

  // 2. Sort the filtered array
  const sortedTrips = [...filteredTrips].sort((a, b) => {
    if (sortBy === "highest_budget") return b.budget - a.budget;
    if (sortBy === "oldest") return a.id - b.id; // Assuming lower ID is older
    return Number(b.id) - Number(a.id); // Latest First: highest ID first
   
  });

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 text-black">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-4xl font-extrabold text-blue-600">Trip History</h1>
            <p className="text-gray-500 mt-1">{trips.length} saved itineraries</p>
          </div>
          {/* Link belongs here inside the JSX return */}
            <Link href="/trips/new" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
          + New Trip
          </Link>
        </div>

        {/* Search and Sort Controls */}
        <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <input
            type="text"
            placeholder="Search by destination or style..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="latest">Latest First</option>
            <option value="oldest">Oldest First</option>
            <option value="highest_budget">Highest Budget</option>
          </select>
        </div>

        {/* Results */}
        {loading ? (
          <div className="text-center py-12 text-gray-500">Loading trips...</div>
        ) : sortedTrips.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg shadow space-y-4 border border-gray-100">
            <p className="text-gray-500 text-lg">No trips found matching your search.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedTrips.map((trip: any) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}