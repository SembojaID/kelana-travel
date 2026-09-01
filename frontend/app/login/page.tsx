'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:8000/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.access_token) {
        localStorage.setItem('token', data.access_token);
        router.push('/trips');
      } else {
        alert(`Login failed: ${data.detail || 'Invalid credentials'}`);
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('Network or server error during login.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleLogin} className="bg-white p-8 rounded shadow-md w-96 text-black">
        <h2 className="text-2xl font-bold mb-6 text-center">Welcome Back</h2>
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
        <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
          Login
        </button>
        <p className="mt-4 text-center text-sm">
          Don't have an account? <a href="/register" className="text-blue-600">Register</a>
        </p>
      </form>
    </div>
  );
}