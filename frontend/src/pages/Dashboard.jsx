import React, { useEffect, useMemo, useState } from 'react';
import { getAnalyticsSummary, getBestCTA, getMyReferralStats, getReferralLink, getTimeSeries } from '../api/client.js';
import CopyField from '../components/CopyField.jsx';
import StatsCard from '../components/StatsCard.jsx';
import ChartCard from '../components/ChartCard.jsx';
import Skeleton from '../components/Skeleton.jsx';
import QRCodeCard from '../components/QRCodeCard.jsx';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [summary, setSummary] = useState(null);
  const [series, setSeries] = useState([]);
  const [cta, setCta] = useState(null);
  const user = JSON.parse(localStorage.getItem('user') || 'null');

  useEffect(() => {
    (async () => {
      const s = await getMyReferralStats();
      setStats(s);
      const sum = await getAnalyticsSummary();
      setSummary(sum);
      const ts = await getTimeSeries(14);
      // Normalize into {date, CLICK, SIGNUP, CONVERSION}
      const grouped = {};
      ts.forEach((row) => {
        const date = row.date || row.dataValues?.date; // fallback depending on shape
        const event = row.eventType || row.dataValues?.eventType;
        const count = Number(row.count || row.dataValues?.count || 0);
        grouped[date] = grouped[date] || { date, CLICK: 0, SIGNUP: 0, CONVERSION: 0 };
        grouped[date][event] = count;
      });
      setSeries(Object.values(grouped));
      const c = await getBestCTA();
      setCta(c);
    })();
  }, []);

  if (!stats || !summary) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
        <Skeleton className="h-80" />
      </div>
    );
  }

  const referralUrl = getReferralLink(stats.referralCode);
  const metrics = [
    { title: 'Clicks', value: stats.clicks },
    { title: 'Signups', value: stats.signups },
    { title: 'Credits', value: stats.credits },
    { title: 'CTR', value: (summary.ctr * 100).toFixed(2) + '%' },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded shadow p-4">
        <div className="mb-2 font-medium">Welcome, {user?.name}</div>
        <CopyField label="Your referral link" value={referralUrl} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <StatsCard key={m.title} title={m.title} value={m.value} />
        ))}
      </div>

      <ChartCard data={series} />

      <QRCodeCard url={referralUrl} />

      {cta && (
        <div className="bg-white rounded shadow p-4">
          <div className="font-medium mb-1">CTA Optimization</div>
          <div>Best placement: <span className="font-semibold">{cta.bestPlacement}</span></div>
        </div>
      )}
    </div>
  );
}


