import connectToDatabase from "@/lib/connect-to-database";
import TrustPools from "@/models/trustPool";
import { NextResponse } from "next/server";
import type { IUser, ValueAlignedPost } from "@/types";

export async function POST(req: Request) {
  const { userId, trustPoolId, postId, vote } = await req.json();
  const voteInt = parseInt(vote);
  
  if (!trustPoolId || !postId || !vote) {
    return NextResponse.json({
      status: 400,
      error: "Invalid input: 'trustPoolId', 'postId', and 'vote' must be strings.",
      message: "Invalid input: 'trustPoolId', 'postId', and 'vote' must be strings.",
    });
  }
  
  console.log(postId)
  
  try {
    await connectToDatabase();
    const trustpool = await TrustPools.findById(trustPoolId).populate({
      path: "cultureBook",
      select: "value_aligned_posts",
    });
    
    const post = trustpool.cultureBook.value_aligned_posts.find((post: ValueAlignedPost) => post._id.toString() === postId);
    
    if (!post) {
      return NextResponse.json({
        status: 404,
        error: "Post not found",
        message: "Post not found",
      });
    }
    
    if (post.onchain) {
      return NextResponse.json({
        status: 400,
        error: "Post is already onchain",
        message: "Post is already onchain",
      });
    }
    
    if (!post.eligibleForVoting) {
      return NextResponse.json({
        status: 400,
        error: "Time exceeded for voting for this post",
        message: "Time exceeded for voting for this post",
      });
    }
    
    if (post.votes.alignedUsers.some((user: IUser) => user.userId === userId) || post.votes.notAlignedUsers.some((user: IUser) => user.userId === userId)) {
      return NextResponse.json({
        status: 400,
        error: "User has already voted for this post",
        message: "User has already voted for this post",
      });
    }
    
    // TODO: Add validation for time constraints (24 hour)
    post.votes.count += voteInt;
    
    if (voteInt < 0) {
      post.votes.notAlignedUsers.push({ userId });
    } else {
      post.votes.alignedUsers.push({ userId });
    }
    
    await trustpool.cultureBook.save();
    
    return NextResponse.json({
      status: 200,
      message: "Successfully voted for post",
    });
  } catch (error) {
    console.error("Error voting for post (POST /cultureBook/pre-onchain/vote):", error);
    return NextResponse.json({
      status: 500,
      error: `Error voting for post: ${error}`,
      message: "Error voting for post",
    });
  }
}