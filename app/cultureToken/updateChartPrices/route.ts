import connectToDatabase from "@/lib/connect-to-database";
import CultureToken from "@/models/cultureToken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { tokenPrice, marketCap, tokenAddress } = await req.json();
  
  if (!tokenPrice || !marketCap || !tokenAddress) {
    return NextResponse.json({
      status: 400,
      error: "Please provide all required fields",
      message: "Please provide all required fields",
    })
  }
  
  try {
    await connectToDatabase();
    
    const token = await CultureToken.findOne({ tokenAddress });
    
    if (!token) {
      return NextResponse.json({
        status: 404,
        error: "Token not found",
        message: "Token not found",
      })
    }
    
    const latestEntry = token.chartPrices.at(-1);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log("Today:", today);
    console.log("Latest Entry:", latestEntry);
    
    // the chartPrices stores the final price for a day
    // if the latest entry is from today, update the price
    // otherwise, add a new entry
    // this is to prevent multiple entries for the same day
    
    if (latestEntry) {
      const latestEntryDate = new Date(latestEntry.timestamp);
      latestEntryDate.setHours(0, 0, 0, 0); 

      if (latestEntryDate.getTime() === today.getTime()) {
        // If the latest entry is from today, update the price
        latestEntry.price = tokenPrice;
      } else {
        // Otherwise, add a new entry for today
        token.chartPrices.push({ price: tokenPrice, timestamp: today });
      }
    } else {
      // If no entries exist, add the first entry
      // unreachable code
      token.chartPrices.push({ price: tokenPrice, timestamp: today });
    }
    
    // same with market cap
    const latestMarketCapEntry = token.chartMarketCaps.at(-1);
    
    if (latestMarketCapEntry) {
      const latestMarketCapEntryDate = new Date(latestMarketCapEntry.timestamp);
      latestMarketCapEntryDate.setHours(0, 0, 0, 0);
      
      if (latestMarketCapEntryDate.getTime() === today.getTime()) {
        latestMarketCapEntry.marketCap = marketCap;
      } else {
        token.chartMarketCaps.push({ marketCap, timestamp: today });
      }
    } else {
      token.chartMarketCaps.push({ marketCap, timestamp: today });
    }
    
    await token.save();
    
    return NextResponse.json({
      status: 200,
      message: "Token price and market cap updated for charts successfully",
    });
  } catch (error) {
    console.log("Error updating token price and market cap (POST /cultureToken/updateTokenPriceAndMarketCap):", error);
  }

}