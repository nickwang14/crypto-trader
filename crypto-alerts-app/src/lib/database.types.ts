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
