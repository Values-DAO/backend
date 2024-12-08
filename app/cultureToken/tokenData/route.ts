import connectToDatabase from "@/lib/connect-to-database";
import TrustPools from "@/models/trustPool";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const {searchParams} = new URL(req.url);
  const trustPoolId = searchParams.get("trustPoolId");
  
  if (!trustPoolId) {
    return NextResponse.json({
      status: 400,
      error: "trustPoolid is required",
      message: "trustPoolId is required",
    });
  }
  
  try {
    await connectToDatabase()
    
    const trustPool = await TrustPools.findById(trustPoolId).populate("cultureToken");
    
    if (!trustPool) {
      return NextResponse.json({
        status: 404,
        error: "Trustpool not found",
        message: "Trustpool not found",
      });
    }
    
    return NextResponse.json({
      status: 200,
      data: {
        tokenData: {
          tokenName: trustPool.cultureToken.name,
          tokenSymbol: trustPool.cultureToken.symbol,
        },
      },
    });
    
  } catch (error) {
    console.error("Error fetching culture token data (GET /cultureToken/tokenData):", error);
    return NextResponse.json({
      status: 500,
      error: `Error fetching culture token data: ${error}`,
      message: "Error fetching culture botokenok data",
    });
  }
}