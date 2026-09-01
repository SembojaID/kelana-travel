const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const getAuthHeaders = (): Record<string, string> => {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : "";
  return token ? {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
  } : {
    "Content-Type": "application/json",
  };
};

export async function getTrips() {
  const res = await fetch(`${API_URL}/trips`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch trips");
  return res.json();
}

export async function getTrip(id: string | number) {
  const res = await fetch(`${API_URL}/trips/${id}`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch trip details");
  return res.json();
}

export async function generateTrip(data: {
  destination: string;
  days: number;
  budget: number;
  travel_month: string;
  travel_style: string;
}) {
  const tripRes = await fetch(`${API_URL}/trips`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!tripRes.ok) throw new Error("Failed to create trip");
  const tripData = await tripRes.json();

  const aiRes = await fetch(`${API_URL}/trips/${tripData.id}/generate`, {
    method: "POST",
    headers: getAuthHeaders(),
  });

  if (!aiRes.ok) throw new Error("Failed to generate trip content");
  return aiRes.json();
}