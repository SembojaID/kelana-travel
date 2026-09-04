const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || "https://kelana-travel-production.up.railway.app/api/v1";
const API_URL = rawBaseUrl.replace(/\/+$/, "");

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
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch trips");
  }
  return res.json();
}

export async function getTrip(id: string | number) {
  const res = await fetch(`${API_URL}/trips/${id}`, {
    cache: "no-store",
    headers: getAuthHeaders(),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to fetch trip details");
  }
  return res.json();
}

export async function generateTrip(data: {
  destination: string;
  days: number;
  budget: number;
  travel_month: string;
  travel_style: string;
}) {
  // Step 1: Create the trip record in PostgreSQL
  const tripRes = await fetch(`${API_URL}/trips`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(data),
  });

  if (!tripRes.ok) {
    const err = await tripRes.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to create trip in database");
  }

  const tripData = await tripRes.json();

  // Step 2: Trigger AI generation (Amazon Bedrock)
  try {
    const aiRes = await fetch(`${API_URL}/trips/${tripData.id}/generate`, {
      method: "POST",
      headers: getAuthHeaders(),
    });

    if (!aiRes.ok) {
      console.warn("AI generation failed, but trip record was saved successfully.");
    } else {
      return await aiRes.json();
    }
  } catch (aiErr) {
    console.error("AI service error:", aiErr);
  }

  // Return the created trip data even if AI generation failed/timed out
  return tripData;
}