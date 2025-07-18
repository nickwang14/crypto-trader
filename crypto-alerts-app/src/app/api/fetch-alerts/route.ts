import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import { Alert } from "@/lib/database.types";
import { logEvent } from "./utils";

const coins = ["bitcoin", "ethereum", "chainlink"];
const COINGECKO_URL = "https://api.coingecko.com/api/v3/simple/price";
const COINCAP_URL = "https://api.coincap.io/v2/assets";
const CRYPTOCOMPARE_URL = "https://min-api.cryptocompare.com/data/price";
const COINPAPRIKA_URL = "https://api.coinpaprika.com/v1/tickers";

async function handleRateLimit(res: Response) {
  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get("Retry-After") || "2", 10);
    console.warn(`Rate limited, retrying in ${retryAfter} seconds...`);
    await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
  }
}

async function fetchPrice(coin: string): Promise<{ price: number, error?: string }> {
  const symbolMap: Record<string, string> = {
    bitcoin: "BTC",
    ethereum: "ETH",
    chainlink: "LINK"
  };

  const vsCurrency = "USD";
  const symbol = symbolMap[coin];

  // 1. CoinGecko
  try {
    const res = await fetch(`${COINGECKO_URL}?ids=${coin}&vs_currencies=${vsCurrency}`, {
      headers: {
        'User-Agent': 'CryptoAlertsApp/1.0 https://crypto-trader.vercel.app/',
        'Accept': 'application/json'
      }
    });
    if (res.status === 429) await handleRateLimit(res);
    const json = await res.json();
    if (json[coin]) return { price: json[coin][vsCurrency.toLowerCase()] };
    throw new Error("CoinGecko malformed data");
  } catch {
    console.warn(`🟡 CoinGecko failed for ${coin}, trying CoinCap...`);
  }

  // 2. CoinCap
  try {
    const res = await fetch(`${COINCAP_URL}/${coin}`);
    if (res.status === 429) await handleRateLimit(res);
    const json = await res.json();
    return { price: parseFloat(json.data.priceUsd) };
  } catch {
    console.warn(`🟠 CoinCap failed for ${coin}, trying CryptoCompare...`);
  }

  // 3. CryptoCompare
  try {
    const res = await fetch(`${CRYPTOCOMPARE_URL}?fsym=${symbol}&tsyms=${vsCurrency}`);
    if (res.status === 429) await handleRateLimit(res);
    const json = await res.json();
    if (json[vsCurrency]) return { price: json[vsCurrency] };
  } catch {
    console.warn(`🔴 CryptoCompare failed for ${coin}, trying CoinPaprika...`);
  }

  // 4. CoinPaprika
  try {
    const res = await fetch(`${COINPAPRIKA_URL}/${coin}`);
    if (res.status === 429) await handleRateLimit(res);
    const json = await res.json();
    return { price: parseFloat(json.quotes[vsCurrency].price) };
  } catch (err) {
    console.error(`❌ All sources failed for ${coin}: ${err}`);
    return { price: 0, error: "All sources failed" };
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
  // Load settings from Supabase
  const { data: settings, error } = await supabase
    .from("alert_settings")
    .select("*")
    .eq("enabled", true);

  if (error || !settings || settings.length === 0) {
    console.error("⚠️ Failed to fetch alert settings:", error);
    return NextResponse.json({ status: "error", message: "No alert settings found" });
  }

  for (const { coin } of settings) {
    if (!coin) {
        console.warn(`🔕 Skipping empty coin setting`);
        continue;
      }
    const { price, error } = await fetchPrice(coin);
    if (error) {
        console.error(`❌ Failed to fetch price for ${coin}:`, error);
        continue;
    }

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

  for (const coin of coins) {
    const { price, error } = await fetchPrice(coin);
    if (error) {
      console.error(`❌ Failed to fetch price for ${coin}:`, error);
      await logEvent("error", `Failed to fetch price for ${coin}`, coin, { error });
      continue;
    }

    if (!price || price <= 0) {
      await logEvent("error", `Price for ${coin} is null or -0`, coin, { error: "Price is null or -0" });
      await supabase.from("alerts").insert([
        {
          coin,
          price: 0,
          funding: 0,
          oi_change: 0,
          recommendation: "DATA_ERROR",
          stop_loss: 0,
          take_profit: 0,
          note: error || "Unknown error"
        }
      ]);
      continue;
    }

    console.log(`✅ Fetched price for ${coin}: $${price}`);
    await logEvent("info", `Fetched price for ${coin}`, coin, { price });

    const { recommendation, stop_loss, take_profit } = generateRecommendation(price);
    await supabase.from("alerts").insert([
      {
        coin,
        price,
        funding: 0,
        oi_change: 0,
        recommendation,
        stop_loss,
        take_profit
      } as Alert
    ]);
  }

  return NextResponse.json({ status: "success" });
}
