import connectToDatabase from "@/lib/connect-to-database";
import CultureToken from "@/models/cultureToken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const {tokenPrice, marketCap, tokenAddress} = await req.json();
  
  if (!tokenPrice || !marketCap || !tokenAddress) {
    return NextResponse.json({
      status: 400,
      error: "Please provide all required fields",
      message: "Please provide all required fields",
    })
  }
  
  console.log("Updating token price and market cap:", tokenPrice, marketCap, tokenAddress);
  
  try {
    await connectToDatabase()
    const token = await CultureToken.findOne({tokenAddress})
    token.prices.push({price: tokenPrice})
    token.marketCaps.push({marketCap})
    await token.save()
    
    return NextResponse.json({
      status: 200,
      message: "Token price and market cap updated successfully",
    });
  } catch (error) {
    console.log("Error updating token price and market cap (POST /cultureToken/updateTokenPriceAndMarketCap):", error);
    return NextResponse.json({
      status: 500,
      error: `Error updating token price and market cap: ${error}`,
      message: "Error updating token price and market cap",
    });
  }
}