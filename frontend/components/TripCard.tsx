import Link from "next/link";

export default function TripCard({ trip }: { trip: any }) {
  return (
    <div className="bg-white p-6 shadow rounded-lg border border-gray-100 flex flex-col justify-between space-y-4">
      <div>
        <h3 className="text-xl font-bold text-gray-800">{trip.destination}</h3>
        <p className="text-sm text-gray-500 capitalize">{trip.travel_style || trip.category || "Standard"} Style</p>
      </div>
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>⏱️ {trip.days} Days</span>
        <span className="font-semibold text-blue-600">USD {trip.budget}</span>
      </div>
      <Link 
        href={`/trips/${trip.id}`} 
        className="text-center bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white py-2 rounded font-medium transition-colors"
      >
        View Details →
      </Link>
    </div>
  );
}