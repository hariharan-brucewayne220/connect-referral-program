import React from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function ChartCard({ data }) {
  return (
    <div className="bg-white rounded shadow p-4 h-80">
      <div className="mb-2 font-medium">Referral Performance</div>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <XAxis dataKey="date" />
          <YAxis allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="CLICK" stroke="#8884d8" dot={false} />
          <Line type="monotone" dataKey="SIGNUP" stroke="#82ca9d" dot={false} />
          <Line type="monotone" dataKey="CONVERSION" stroke="#ff7300" dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}


