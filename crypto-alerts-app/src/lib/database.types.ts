export type Alert = {
  id: string;
  user_id: string;
  coin: string;
  price: number | null;
  funding: number | null;
  oi_change: number | null;
  recommendation: string | null;
  stop_loss: number | null;
  take_profit: number | null;
  created_at: string;
};

export type alert_settings = {
  id: string;
  user_id: string;
  coin: string;
  price_threshold: number | null;
  // funding_threshold: number | null;
  // oi_change_threshold: number | null;
  created_at: string;
  enabled: boolean;
}

export type Log = {
  id: string;
  level: "info" | "warn" | "error";
  message: string;
  coin?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  details?: any;
  created_at: string;
};

export type User = {
  id: string;
  email: string;
  created_at: string;
};


