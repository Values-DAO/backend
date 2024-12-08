import connectToDatabase from "@/lib/connect-to-database";
import TrustPools from "@/models/trustPool";
import { keccak256, encodeAbiParameters, parseAbiParameters } from "viem";
import { NextResponse } from "next/server";
import { createPublicClient, http } from "viem";
import { baseSepolia, mainnet, sepolia } from "viem/chains";
import { useInitialisedEvents } from "@/lib/utils";
import Users from "@/models/user";



export async function POST(req: Request) {
  const {trustPoolId, amount, userId} = await req.json();
  
  if (!trustPoolId) {
    return NextResponse.json({
      status: 400,
      error: "trustPoolId is required",
      message: "trustPoolId is required",
    });
  }
  
  try {
    await connectToDatabase()
    
    const trustPool = await TrustPools.findOne({trustPoolId}).populate("cultureToken");
    
    if (!trustPool) {
      return NextResponse.json({
        status: 404,
        error: "Trust pool not found",
        message: "Trust pool not found",
      });
    }
    
    const user = await Users.findOne({userId})
    
    if (!user) {
      return NextResponse.json({
        status: 404,
        error: "User not found",
        message: "User not found",
      });
    }
    
    console.log("User found:", user);
    
    const cultureToken = trustPool.cultureToken;
    
    // if the user already has that token then increase the amount or else create a new entry
    // @ts-ignore
    const existingToken = user.rewards.find(token => token.token.toString() === cultureToken._id.toString());
    
    if (existingToken) {
      existingToken.amount += amount;
    } else {
      user.rewards.push({
        token: cultureToken._id,
        amount,
      });
    }
    
    await user.save();
    
    return NextResponse.json({
      status: 200,
      message: "Successfully minted culture token",
    });
  } catch (error) {
    console.error("Error fetching culture token price (GET /cultureToken/tokenPrice):", error);
    return NextResponse.json({
      status: 500,
      error: `Error fetching culture token price: ${error}`,
      message: "Error fetching culture token price",
    });
  }
}