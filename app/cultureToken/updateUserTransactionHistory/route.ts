import connectToDatabase from "@/lib/connect-to-database";
import Users from "@/models/user";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const {userId, tokenAddress, amount, num} = await req.json();
  
  if (!userId || !tokenAddress || !amount || !num) {
    return NextResponse.json({
      status: 400,
      error: "Please provide all required fields",
      message: "Please provide all required fields",
    })
  }
  
  try {
    await connectToDatabase();
    const user = await Users.findOne({userId});
    user.tokenBuyHistory.push({
      tokenAddress,
      amount,
      num
    });
    await user.save();
    
    return NextResponse.json({
      status: 200,
      message: "User transaction history updated successfully",
    });
  } catch (error) {
    console.log("Error updating user transaction history (POST /cultureToken/updateUserTransactionHistory):", error);
    return NextResponse.json({
      status: 500,
      error: `Error updating user transaction history: ${error}`,
      message: "Error updating user transaction history",
    });
  }
}