"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getTrip } from "@/services/tripService";
import Link from "next/link";
import ReactMarkdown from "react-markdown";

export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [trip, setTrip] = useState<any>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
      return;
    }

    const tripId = params.id as string;
    if (tripId) {
      getTrip(tripId)
        .then((data) => setTrip(data))
        .catch((err) => {
          console.error("Failed to fetch trip details:", err);
          setError(true);
        })
        .finally(() => setLoading(false));
    }
  }, [params.id, router]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-600">
        Trip not found or backend offline.
      </div>
    );
  }

  if (loading || !trip) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        Loading trip details...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 text-black">
      <div className="max-w-3xl mx-auto space-y-6">
        <Link href="/trips" className="text-blue-600 font-medium hover:underline">
          ← Back to Trips
        </Link>
        
        <div className="bg-white p-8 shadow rounded-lg space-y-4">
          <div className="flex justify-between items-start border-b pb-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-1 rounded">
                {trip.travel_style || trip.category || "Standard"}
              </span>
              <h1 className="text-3xl font-extrabold text-gray-900 mt-2">{trip.destination}</h1>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">USD {trip.budget}</p>
              <p className="text-sm text-gray-500">{trip.days} Days</p>
            </div>
          </div>

          <div className="prose max-w-none pt-4 whitespace-pre-line text-gray-700">
            <ReactMarkdown>{trip.recommendation || trip.ai_recommendation || "No recommendation generated yet."}</ReactMarkdown>
          </div>
        </div>
      </div>
    </main>
  );
}