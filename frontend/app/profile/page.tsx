'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        const rawBaseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://kelana-travel-production.up.railway.app/api/v1';
        const baseUrl = rawBaseUrl.replace(/\/+$/, '');

        const res = await fetch(`${baseUrl}/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const data = await res.json();
          setProfile(data);
        } else {
          localStorage.removeItem('token');
          router.push('/login');
        }
      } catch (err) {
        console.error('Profile fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  if (loading) {
    return <div className="p-8 text-center text-black">Loading profile...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8 text-black flex justify-center">
      <div className="bg-white p-6 rounded shadow-md w-full max-w-md h-fit">
        <h1 className="text-2xl font-bold mb-4 text-center">User Profile</h1>
        <div className="space-y-3">
          <p><strong>Name:</strong> {profile?.name}</p>
          <p><strong>Email:</strong> {profile?.email}</p>
          <p><strong>Total Trips Created:</strong> {profile?.total_trips}</p>
        </div>
        <button 
          onClick={() => {
            localStorage.removeItem('token');
            router.push('/login');
          }}
          className="mt-6 w-full bg-red-600 text-white p-2 rounded hover:bg-red-700 font-medium"
        >
          Logout
        </button>
      </div>
    </div>
  );
}