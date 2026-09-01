'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { generateTrip } from '@/services/tripService';

export default function NewTripPage() {
  const [destination, setDestination] = useState('');
  const [days, setDays] = useState(''); // Clear default
  const [budget, setBudget] = useState(''); // Clear default
  const [travelMonth, setTravelMonth] = useState(''); // Clear default
  const [travelStyle, setTravelStyle] = useState(''); // Clear default
  const router = useRouter();

const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await generateTrip({
        destination,
        days: days ? Number(days) : 0,
        budget: budget ? Number(budget) : 0,
        travel_month: travelMonth,
        travel_style: travelStyle,
      });
      router.push('/trips');
    } catch (err) {
      console.error(err);
      alert('Failed to create trip');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-black">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-96 space-y-4">
  <h2 className="text-2xl font-bold mb-6 text-center">Plan a New Trip</h2>
  
  <input 
    type="text" placeholder="Destination" required
    className="w-full p-2 border rounded text-black"
    value={destination} onChange={(e) => setDestination(e.target.value)} 
  />
  <input 
    type="number" placeholder="Days" required
    className="w-full p-2 border rounded text-black"
    value={days} onChange={(e) => setDays(e.target.value)} 
  />
  <input 
    type="number" placeholder="Budget" required
    className="w-full p-2 border rounded text-black"
    value={budget} onChange={(e) => setBudget(e.target.value)} 
  />
  <input 
    type="text" placeholder="Travel Month (e.g., December)" required
    className="w-full p-2 border rounded text-black"
    value={travelMonth} onChange={(e) => setTravelMonth(e.target.value)} 
  />
  <input 
    type="text" placeholder="Travel Style (e.g., Luxury, Budget)" required
    className="w-full p-2 border rounded text-black"
    value={travelStyle} onChange={(e) => setTravelStyle(e.target.value)} 
  />
  
  <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700 font-medium">
    Generate Itinerary
  </button>
</form>
    </div>
  );
}