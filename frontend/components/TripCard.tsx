import Link from "next/link";

export default function TripCard({ trip }: { trip: any }) {
  // Format the budget with commas
  const formattedBudget = new Intl.NumberFormat("en-US").format(trip.budget);
  
  // Determine category and dynamic badge color
  const styleName = trip.travel_style || trip.category || "Standard";
  const styleLower = styleName.toLowerCase();
  
  let badgeColor = "bg-blue-100 text-blue-700"; // Default Standard
  
  if (styleLower.includes("luxury")) badgeColor = "bg-purple-100 text-purple-700";
  if (styleLower.includes("backpacker")) badgeColor = "bg-green-100 text-green-700";
  if (styleLower.includes("family")) badgeColor = "bg-yellow-100 text-yellow-700";
  if (styleLower.includes("solo")) badgeColor = "bg-teal-100 text-teal-700";
  if (styleLower.includes("couple")) badgeColor = "bg-pink-100 text-pink-700";

  return (
    <div className="bg-white p-6 shadow rounded-lg border border-gray-100 flex flex-col justify-between space-y-4 hover:shadow-lg transition-shadow">
      <div>
        <h3 className="text-xl font-bold text-gray-800">📍 {trip.destination}</h3>
        <span className={`inline-block mt-2 text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${badgeColor}`}>
          {styleName}
        </span>
      </div>
      <div className="flex justify-between items-center text-sm text-gray-600">
        <span>⏱️ {trip.days} Days</span>
        <span className="font-semibold text-gray-900">USD {formattedBudget}</span>
      </div>
      <Link 
        href={`/trips/${trip.id}`} 
        className="text-center bg-gray-50 text-blue-600 hover:bg-blue-600 hover:text-white py-2 rounded font-medium transition-colors"
      >
        View Details →
      </Link>
    </div>
  );
}