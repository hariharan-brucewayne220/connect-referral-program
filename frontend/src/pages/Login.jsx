import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { login } from '../api/client.js';

export default function Login() {
  const [email, setEmail] = useState('alice@example.com');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await login(email, password);
      const to = location.state?.from?.pathname || '/dashboard';
      navigate(to);
    } catch (e) {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-xl font-semibold mb-4">Login</h1>
      {error && <div className="mb-2 text-red-600 text-sm">{error}</div>}
      <form className="space-y-3" onSubmit={onSubmit}>
        <input className="w-full border rounded px-3 py-2" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <input className="w-full border rounded px-3 py-2" placeholder="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        <button className="w-full bg-indigo-600 text-white rounded px-3 py-2">Login</button>
      </form>
      <div className="text-sm mt-3">No account? <Link to="/signup" className="text-indigo-600">Signup</Link></div>
    </div>
  );
}


