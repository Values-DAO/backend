// This route runs a day after the community values are generated/updated.
// It will take the exisitng posts on the curate tab and post them onchain if eligible.

import connectToDatabase from "@/lib/connect-to-database";
import { storeMessageOnChain } from "@/lib/store-on-chain";
import { storeMessageOnIpfs } from "@/lib/store-on-ipfs";
import TrustPools from "@/models/trustPool";
import type { ValueAlignedPost } from "@/types";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    await connectToDatabase();
    const trustpools = await TrustPools.find({}).populate({
      path: "cultureBook",
      select: "value_aligned_posts",
    });

    console.log("Length of trustpools: ", trustpools.length);

    if (!trustpools) {
      return NextResponse.json({
        status: 404,
        error: "No trust pool found",
        message: "No trust pool found",
      });
    }

    for (const trustpool of trustpools) {
      console.log("Processing trustpool: ", trustpool.name);
      if (!trustpool.cultureBook) {
        console.log("No culture book data found for trustpool: ", trustpool.name);
        continue;
      }

      // don't consider the posts that have a votingEndsAt field cause that is to be decided by the poll
      const value_aligned_posts = trustpool.cultureBook.value_aligned_posts
        .filter((post: ValueAlignedPost) => !post.onchain)
        .filter((post: ValueAlignedPost) => post.eligibleForVoting)
        .filter((post: ValueAlignedPost) => !post.votingEndsAt);

      for (const post of value_aligned_posts) {
        // first check if the post is eligible to be posted onchain
        if (post.votes.count < 0) {
          post.eligibleForVoting = false;
          console.log(`Post ${post._id} not eligible for voting. Skipping...`);
          continue;
        }

        // now the message is eligible for posting onchain
        // need to avoid duplication, so if the post already exists onchain, skip it
        // onchain posts have onchain field set to true
        // check messages by messageTgId
        const existingPost = trustpool.cultureBook.value_aligned_posts.find(
          (p: ValueAlignedPost) => p?.messageTgId && p?.messageTgId === post?.messageTgId && p.onchain
        );

        if (existingPost) {
          post.onchain = false;
          post.eligibleForVoting = false;
          console.log(`Post ${post._id} already exists onchain. Skipping...`);
          continue;
        }

        // now store it on ipfs and then onchain
        const response = await storeMessageOnIpfs(post.content);

        if (!response) {
          console.error("Error storing message on IPFS. Please try again.");
          return NextResponse.json({
            status: 500,
            error: "Error storing message on IPFS. Please try again.",
            message: "Error storing message on IPFS. Please try again.",
          });
        }

        const txHash = await storeMessageOnChain(response.IpfsHash);

        post.transactionHash = txHash;
        post.ipfsHash = response.IpfsHash;
        post.onchain = true;
        post.eligibleForVoting = false;

        console.log(`Post ${post._id} successfully posted onchain`);
      }

      await trustpool.cultureBook.save();
      console.log(`Culture book data for trustpool ${trustpool.name} successfully updated`);
    }

    return NextResponse.json({
      status: 200,
      message: "Successfully posted culture book data onchain",
    });
  } catch (error) {
    console.error("Error posting culture book data onchain:", error);
    return NextResponse.json({
      status: 500,
      error: `Error posting culture book data onchain: ${error}`,
      message: "Error posting culture book data onchain",
    });
  }
}
