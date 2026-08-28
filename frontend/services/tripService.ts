const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function getTrips() {
  const res = await fetch(`${API_URL}/trips`, { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch trips");
  return res.json();
}

export async function getTrip(id: number) {
  const res = await fetch(`${API_URL}/trips/${id}`);
  if (!res.ok) throw new Error(`Failed to fetch trip with ID ${id}`);
  return res.json();
}

export async function generateTrip(data: any) {
  const tripRes = await fetch(`${API_URL}/trips`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!tripRes.ok) throw new Error("Failed to create trip");
  const tripData = await tripRes.json();

  const aiRes = await fetch(`${API_URL}/trips/${tripData.id}/generate`, {
    method: "POST",
  });
  if (!aiRes.ok) throw new Error("Failed to generate AI itinerary");
  return aiRes.json();
}