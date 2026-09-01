"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
      return;
    }

    fetch(`${API_URL}/auth/me`, {
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch profile");
        return res.json();
      })
      .then((data) => setProfile(data))
      .catch((err) => {
        console.error(err);
        localStorage.removeItem("token");
        router.push("/login");
      })
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-black">Loading profile...</div>;
  }

  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 text-black">
      <div className="max-w-xl mx-auto space-y-6">
        <Link href="/trips" className="text-blue-600 font-medium hover:underline">
          ← Back to Trips
        </Link>
        <div className="bg-white p-8 rounded-xl shadow space-y-4">
          <h1 className="text-3xl font-bold text-blue-600">Traveler Profile</h1>
          <div className="border-t pt-4 space-y-3 text-gray-700">
            <p><strong>Name:</strong> {profile?.name}</p>
            <p><strong>Email:</strong> {profile?.email}</p>
            <p><strong>Total Trips Generated:</strong> {profile?.total_trips}</p>
          </div>
        </div>
      </div>
    </main>
  );
}