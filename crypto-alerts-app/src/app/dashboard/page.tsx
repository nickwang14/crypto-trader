// src/app/dashboard/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabaseClient';
import { Alert } from '@/lib/database.types';


export default function DashboardPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAlerts = async () => {
      const { data, error } = await supabase
        .from('alerts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching alerts:', error.message);
      } else {
        setAlerts(data as Alert[]);
      }

      setLoading(false);
    };

    fetchAlerts();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Crypto Alerts Dashboard</h1>

      {loading ? (
        <p>Loading...</p>
      ) : alerts.length === 0 ? (
        <p>No alerts found.</p>
      ) : (
        <div className="overflow-auto">
          <table className="w-full text-sm text-left border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border px-4 py-2">Coin</th>
                <th className="border px-4 py-2">Price</th>
                <th className="border px-4 py-2">Funding</th>
                <th className="border px-4 py-2">OI Change</th>
                <th className="border px-4 py-2">Rec</th>
                <th className="border px-4 py-2">SL</th>
                <th className="border px-4 py-2">TP</th>
                <th className="border px-4 py-2">Time</th>
              </tr>
            </thead>
            <tbody>
              {alerts.map((alert) => (
                <tr key={alert.id} className="border-t">
                  <td className="border px-4 py-2">{alert.coin}</td>
                  <td className="border px-4 py-2">{alert.price ?? '-'}</td>
                  <td className="border px-4 py-2">{alert.funding ?? '-'}</td>
                  <td className="border px-4 py-2">{alert.oi_change ?? '-'}</td>
                  <td className="border px-4 py-2">{alert.recommendation ?? '-'}</td>
                  <td className="border px-4 py-2">{alert.stop_loss ?? '-'}</td>
                  <td className="border px-4 py-2">{alert.take_profit ?? '-'}</td>
                  <td className="border px-4 py-2">{new Date(alert.created_at).toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
