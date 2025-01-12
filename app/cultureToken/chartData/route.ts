import connectToDatabase from "@/lib/connect-to-database"
import TrustPools from "@/models/trustPool"
import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const {searchParams} = new URL(req.url)
  const trustPoolId = searchParams.get("trustPoolId")
  
  if (!trustPoolId) {
    return NextResponse.json({
      status: 400,
      error: "trustPoolid is required",
      message: "trustPoolId is required",
    })
  }
  
  try {
    await connectToDatabase();
    
    const trustPool = await TrustPools.findById(trustPoolId).populate("cultureToken");
    
    if (!trustPool) {
      return NextResponse.json({
        status: 404,
        error: "Trustpool not found",
        message: "Trustpool not found",
      })
    }
    
    const chartPrices = trustPool.cultureToken.chartPrices;
    const chartMarketCaps = trustPool.cultureToken.chartMarketCaps;
    
    const { filledChartPrices, filledChartMarketCaps } = fillMissingEntries(chartPrices, chartMarketCaps);
    
    // finalData should be an array of objects where each object contains date (YYYY-MM-DD), price, and marketCap
    // combine the filledChartPrices and filledChartMarketCaps arrays to create finalData
    const finalData = filledChartPrices.map((priceEntry, index) => {
      const marketCapEntry = filledChartMarketCaps[index];
      return {
        date: new Date(priceEntry.timestamp).toISOString().split("T")[0],
        price: priceEntry.price,
        marketCap: marketCapEntry.marketCap,
      };
    });

    return NextResponse.json({
      status: 200,
      data: {
        finalData
      },
    });
  } catch (error) {
    console.error("Error fetching culture token data (GET /cultureToken/tokenData):", error)
    return NextResponse.json({
      status: 500,
      error: `Error fetching culture token data: ${error}`,
      message: "Error fetching culture botokenok data",
    })
  }
}

type ChartEntry = {
  timestamp: string;
  price?: number | null;
  marketCap?: number | null;
};

function fillMissingEntries(
  chartPrices: ChartEntry[],
  chartMarketCaps: ChartEntry[]
): { filledChartPrices: ChartEntry[]; filledChartMarketCaps: ChartEntry[] } {
  const filledChartPrices: ChartEntry[] = [];
  const filledChartMarketCaps: ChartEntry[] = [];

  const getDateRange = (startDate: Date, endDate: Date): string[] => {
    const dates: string[] = [];
    let currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      dates.push(currentDate.toISOString().split("T")[0]); // Format as YYYY-MM-DD
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  };

  const startDate = new Date(chartPrices[0].timestamp);
  const endDate = new Date(chartPrices[chartPrices.length - 1].timestamp);
  const allDates = getDateRange(startDate, new Date(new Date().setHours(0, 0, 0, 0)));
  
  let priceIndex = 0;
  let marketCapIndex = 0;
  let lastPrice: number | null = null;
  let lastMarketCap: number | null = null;

  allDates.forEach((date) => {
    const dateISO = new Date(date).toISOString().split("T")[0];
    
    // Check for a price entry
    if (priceIndex < chartPrices.length && new Date(chartPrices[priceIndex].timestamp).toISOString().startsWith(dateISO)) {
      lastPrice = chartPrices[priceIndex].price ?? lastPrice;
      filledChartPrices.push({ timestamp: chartPrices[priceIndex].timestamp, price: lastPrice });
      priceIndex++;
    } else if (lastPrice !== null) {
      // Fill the gap with the last known price
      filledChartPrices.push({ timestamp: `${date}`, price: lastPrice });
    }

    // Check for a market cap entry
    if (marketCapIndex < chartMarketCaps.length && new Date(chartMarketCaps[marketCapIndex].timestamp).toISOString().startsWith(dateISO)) {
      lastMarketCap = chartMarketCaps[marketCapIndex].marketCap ?? lastMarketCap;
      filledChartMarketCaps.push({ timestamp: chartMarketCaps[marketCapIndex].timestamp, marketCap: lastMarketCap });
      marketCapIndex++;
    } else if (lastMarketCap !== null) {
      // Fill the gap with the last known market cap
      filledChartMarketCaps.push({ timestamp: `${date}`, marketCap: lastMarketCap });
    }
  });

  return { filledChartPrices, filledChartMarketCaps };
}