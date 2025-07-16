import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const coins = ["bitcoin", "ethereum", "chainlink"];
const COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price";
const COINCAP_URL = "https://api.coincap.io/v2/assets";

async function fetchPrice(coin: string): Promise<number> {
  try {
    const res = await fetch(`${COINGECKO_URL}?ids=${coin}&vs_currencies=usd`);
    const json = await res.json();
    if (json[coin]) return json[coin].usd;
    throw new Error("CoinGecko failed");
  } catch (e) {
    console.warn(`CoinGecko failed for ${coin}, falling back to CoinCap...`);
    try {
      const res2 = await fetch(`${COINCAP_URL}/${coin}`);
      const json2 = await res2.json();
      return parseFloat(json2.data.priceUsd);
    } catch {
      console.error(`CoinCap failed for ${coin}`);
      return 0;
    }
  }
}

function generateRecommendation(price: number) {
  const volatility = price * 0.03;
  const direction = Math.random() > 0.5 ? "LONG" : "SHORT";
  const stop_loss = direction === "LONG" ? price - volatility : price + volatility;
  const take_profit = direction === "LONG" ? price + volatility * 2 : price - volatility * 2;
  return { recommendation: direction, stop_loss, take_profit };
}

export async function POST() {
  for (const coin of coins) {
    const price = await fetchPrice(coin);
    if (!price || price <= 0) continue;

    const { recommendation, stop_loss, take_profit } = generateRecommendation(price);

    await supabase.from("alerts").insert([
      {
        coin,
        price,
        funding: 0,
        oi_change: 0,
        recommendation,
        stop_loss,
        take_profit,
      }
    ]);
  }

  return NextResponse.json({ status: "success" });
}

