'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('http://localhost:8000/api/v1/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });

    if (res.ok) {
      alert('Registration successful! Please log in.');
      router.push('/login');
    } else {
      alert('Registration failed. Email might already be in use.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleRegister} className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl font-bold mb-6 text-center">Register for KelanaAI</h2>
        <input 
          type="text" placeholder="Name" required
          className="w-full mb-4 p-2 border rounded"
          value={name} onChange={(e) => setName(e.target.value)} 
        />
        <input 
          type="email" placeholder="Email" required
          className="w-full mb-4 p-2 border rounded"
          value={email} onChange={(e) => setEmail(e.target.value)} 
        />
        <input 
          type="password" placeholder="Password" required
          className="w-full mb-6 p-2 border rounded"
          value={password} onChange={(e) => setPassword(e.target.value)} 
        />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded hover:bg-blue-700">
          Sign Up
        </button>
        <p className="mt-4 text-center text-sm">
          Already have an account? <a href="/login" className="text-blue-600">Login here</a>
        </p>
      </form>
    </div>
  );
}