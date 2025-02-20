import connectToDatabase from "@/lib/connect-to-database";
import CultureToken from "@/models/cultureToken";
import { NextResponse } from "next/server";
import { ethers } from "ethers";
import { bondingCurveABI } from "@/tokenContracts/bondingCurveABI";

const MARKET_CAP_THRESHOLD = 69420;
const UNISWAP_CONFIG = {
  fee: 3000, // 0.3% fee tier
  tickSpacing: 60, // Corresponding tick spacing for 0.3% fee
  wethAddress: process.env.WETH_ADDRESS!,
  positionManager: process.env.UNISWAP_POSITION_MANAGER!,
  poolFactory: process.env.UNISWAP_FACTORY!
};

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

    // Check if market cap has hit the threshold
    if (marketCap >= MARKET_CAP_THRESHOLD && !token.poolConfigured) {
      try {
        // Setup provider and signer
        const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
        const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
        
        // Get contract instance
        const bondingCurve = new ethers.Contract(
          process.env.BONDING_CURVE_ADDRESS!,
          bondingCurveABI,
          wallet
        );

        // Calculate initial tick based on current price
        // This is a simplified calculation - you might need to adjust based on your needs
        // Using natural logarithm conversion: log1.0001(price) = ln(price) / ln(1.0001)
        const tick = Math.floor(Math.log(tokenPrice) / Math.log(1.0001));

        // Call configurePool
        const tx = await bondingCurve.configurePool(
          UNISWAP_CONFIG.fee,
          tick,
          tokenAddress,
          UNISWAP_CONFIG.wethAddress,
          UNISWAP_CONFIG.tickSpacing,
          UNISWAP_CONFIG.positionManager,
          UNISWAP_CONFIG.poolFactory
        );

        // Wait for transaction to be mined
        const receipt = await tx.wait();
        console.log("Pool configured successfully:", receipt.transactionHash);

        // Update token to mark pool as configured
        // token.poolConfigured = true; // TODO: Uncomment this when we want to configure the pool
        // await token.save();
      } catch (error) {
        console.error("Error configuring pool:", error);
        // Note: We don't return here so we still return success for the price update
      }
    }
    
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