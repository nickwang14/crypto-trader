"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Alert = {
  id: string;
  coin: string;
  price: number;
  funding: number;
  oi_change: number;
  recommendation: string;
  created_at: string;
};

export default function Dashboard() {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    const fetchAlerts = async () => {
      const { data, error } = await supabase
        .from("alerts")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20);

      if (error) console.error(error);
      else setAlerts(data || []);
    };

    fetchAlerts();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-2xl font-bold mb-4">Recent Alerts</h1>
      <div className="grid grid-cols-1 gap-4">
        {alerts.map((alert) => (
          <div key={alert.id} className="p-4 border rounded-lg shadow">
            <div className="flex justify-between font-semibold">
              <span className="text-blue-600">{alert.coin.toUpperCase()}</span>
              <span>{new Date(alert.created_at).toLocaleTimeString()}</span>
            </div>
            <div className="text-sm mt-1">
              Price: ${alert.price.toLocaleString()} <br />
              Funding Rate: {alert.funding} <br />
              OI Change: {alert.oi_change}% <br />
              <span className={`font-bold ${alert.recommendation === "LONG" ? "text-green-600" : "text-red-600"}`}>
                {alert.recommendation}
              </span>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
