import { getTrips } from "@/services/tripService";
import TripCard from "@/components/TripCard";
import Link from "next/link";

export default async function TripsPage() {
  let trips = [];
  try {
    trips = await getTrips();
  } catch (error) {
    console.error("Error loading trips:", error);
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 text-black">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-extrabold text-blue-600">Trip History</h1>
            <p className="text-gray-500 mt-1">{trips.length} saved itineraries</p>
          </div>
          <Link href="/" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700">
            + New Trip
          </Link>
        </div>

        {trips.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-lg shadow space-y-4">
            <p className="text-gray-500 text-lg">No trips found. Create your first itinerary!</p>
            <Link href="/" className="inline-block bg-blue-600 text-white px-6 py-2 rounded font-medium">
              Generate a Trip →
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {trips.map((trip: any) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}