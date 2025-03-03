
// * This route will fetch all the data for the culture book required to display on the curate tab.

import connectToDatabase from "@/lib/connect-to-database";
import TrustPools from "@/models/trustPool";
import type { ValueAlignedPost } from "@/types";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const {searchParams} = new URL(req.url);
  const trustPoolId = searchParams.get("trustPoolId");
  
  if (!trustPoolId) {
    return NextResponse.json({
      status: 400,
      error: "Invalid input: 'trustPoolId' must be a string.",
      message: "Invalid input: 'trustPoolId' must be a string.",
    });
  }
  
  try {
    await connectToDatabase();
    const trustpool = await TrustPools.findById(trustPoolId).populate({
      path: "cultureBook",
      select: "value_aligned_posts"
    })
    
    
    if (!trustpool) {
      return NextResponse.json({
        status: 404,
        error: "Trustpool not found",
        message: "Trustpool not found",
      });
    }
    
    if (!trustpool.cultureBook) {
      return NextResponse.json({
        status: 404,
        error: "Culture Book not found",
        message: "Culture Book not found",
      });
    }
    
    // don't consider the posts that have a votingEndsAt field cause that is to be decided by the poll
    // posts that don't have votingEndsAt field are the posts that were extracted by AI
    // so this route is only for getting those posts that are extracted by AI and have to go onchain
    const value_aligned_posts = trustpool.cultureBook.value_aligned_posts.filter((post: ValueAlignedPost) => !post.onchain).filter((post: ValueAlignedPost) => post.eligibleForVoting).filter((post: ValueAlignedPost) => !post.votingEndsAt);
    
    return NextResponse.json({
      status: 200,
      data: {
        posts: value_aligned_posts,
      },
    });
  } catch (error) {
    console.error("Error fetching culture book data:", error);
    return NextResponse.json({
      status: 500,
      error: `Error fetching culture book data: ${error}`,
      message: "Error fetching culture book data",
    });
  }
}