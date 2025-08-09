import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { signup } from '../api/client.js';

export default function Signup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [params] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Pre-fill name for demo
    setName('New User');
  }, []);

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signup({ email, password, name, referralCode: params.get('ref') || undefined });
      navigate('/dashboard');
    } catch (e) {
      setError('Failed to signup');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Signup</h1>
      {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
      <form className="space-y-3" onSubmit={onSubmit}>
        <input className="w-full border rounded px-3 py-2" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full bg-indigo-600 text-white rounded px-3 py-2">Create Account</button>
      </form>
      <div className="text-sm mt-3">Already have an account? <Link to="/login" className="text-indigo-600">Login</Link></div>
    </div>
  );
}


