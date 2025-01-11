import connectToDatabase from "@/lib/connect-to-database";
import Users from "@/models/user";
import { NextResponse } from "next/server";
import { Alchemy, Network } from "alchemy-sdk";
import { ethers } from "ethers";

export async function GET(req: Request) {
  const {searchParams} = new URL(req.url);
  const userId = searchParams.get("userId");
  const walletAddress = searchParams.get("walletAddress");
  const tokenAddress = searchParams.get("tokenAddress");
  
  if (!userId || !walletAddress || !tokenAddress) {
    return NextResponse.json({
      status: 400,
      error: "userId, tokenAddress and walletAddress is required",
      message: "userId, tokenAddress and walletAddress is required",
    });
  }
  
  try {
    await connectToDatabase();
    
    const user = await Users.findOne({userId});
    
    if (!user) {
      return NextResponse.json({
        status: 404,
        error: "User not found",
        message: "User not found",
      });
    }
    
    const transactionHistory = user.tokenBuyHistory.filter((transaction: any) => transaction.tokenAddress === tokenAddress);
    console.log("Transaction History:", transactionHistory);
    
    const url = "https://base-sepolia.g.alchemy.com/v2/QW3tqg2zxiQHfZYT6aJgn1m5LXHhqpdN";
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    const body = JSON.stringify({
      id: 1,
      jsonrpc: "2.0",
      method: "alchemy_getTokenBalances",
      params: [walletAddress, [tokenAddress]],
    });

    const request = await fetch(url, {method: "POST", headers: headers, body: body })
    const {result} = await request.json();
    const tokenBalance = result.tokenBalances[0].tokenBalance // in hex
    const tokenBal = BigInt(tokenBalance);
    const formattedBalance = ethers.formatUnits(tokenBal, 18);
    console.log("Token Balance:", formattedBalance);
    console.log("Raw Token Balance:", tokenBal);
  
    return NextResponse.json({
      status: 200,
      data: {
        transactionHistory,
        tokenBalance: formattedBalance,
      },
    });
  } catch (error) {
    console.log("Error fetching user token data (GET /cultureToken/userTokenData):", error);
    
    return NextResponse.json({
      status: 500,
      error: `Error fetching user token data: ${error}`,
      message: "Error fetching user token data",
    });
  }
}