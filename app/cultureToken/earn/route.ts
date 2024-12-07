import connectToDatabase from "@/lib/connect-to-database";
import TrustPools from "@/models/trustPool";
import axios from "axios";
import { NextResponse } from "next/server";

// Platform-specific URL patterns
const TWITTER_PATTERNS = [
  /^https?:\/\/(?:www\.)?twitter\.com\/\w+\/status\/\d+/,
  /^https?:\/\/(?:www\.)?x\.com\/\w+\/status\/\d+/,
];
const FARCASTER_PATTERN = /^https?:\/\/(?:www\.)?warpcast\.com\/\w+\/.+/;

// Helper to determine the platform
function detectPlatform(url: string): "twitter" | "farcaster" | null {
  if (TWITTER_PATTERNS.some((pattern) => pattern.test(url))) {
    return "twitter";
  }
  if (FARCASTER_PATTERN.test(url)) {
    return "farcaster";
  }
  return null;
}

// Fetch Twitter post content
async function fetchTwitterPost(url: string) {
  // Extract tweet ID from URL
  const tweetId = url.split("/").pop();

  // This is a placeholder for the actual API call
  const response = await axios.get(`https://twitter154.p.rapidapi.com/tweet/details?tweet_id=${tweetId}`, {
    headers: {
      "x-rapidapi-key": process.env.RAPID_TWITTER_API_KEY || "",
      "x-rapidapi-host": process.env.RAPID_TWITTER_API_HOST || "",
    },
  });

  if (response.status !== 200) {
    throw new Error("Failed to fetch tweet");
  }
  
  const text = response.data.text;
  
  console.log(text);
  
  if (!text) {
    throw new Error("No tweet text found");
  }

  return text;
}

// Fetch Farcaster post content
async function fetchFarcasterPost(url: string) {
  // Extract cast hash or ID from URL
  const castId = url.split("/").pop();

  // This is a placeholder for the actual Farcaster API call
  // You might want to use the Neynar API or Hub API
  const response = await fetch(`https://api.neynar.com/v1/farcaster/cast/${castId}`, {
    headers: {
      "Api-Key": process.env.NEYNAR_API_KEY as string,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch cast");
  }

  return response.json();
}

export async function POST(req: Request) {
  const { trustPoolId, socialPostLink, username } = await req.json();

  if (!trustPoolId || !socialPostLink) {
    return NextResponse.json({
      status: 400,
      error: "Missing required parameters",
      message: "Both trustPoolId and socialPostLink are required",
    });
  }

  try {
    // Detect the platform
    // const platform = detectPlatform(socialPostLink);

    // if (!platform) {
    //   return NextResponse.json({
    //     status: 400,
    //     error: "Invalid platform",
    //     message: "URL must be from Twitter/X or Farcaster",
    //   });
    // }

    // Fetch post content based on platform
    // const postContent = await (platform === "twitter"
    //   ? fetchTwitterPost(socialPostLink)
    //   : fetchFarcasterPost(socialPostLink));
    
    const postContent = await fetchTwitterPost(socialPostLink);
    
    await connectToDatabase();
    
    const trustPool = await TrustPools.findById(trustPoolId).populate("cultureBook");
    
    if (!trustPool) {
      return NextResponse.json({
        status: 404,
        error: "Trustpool not found",
        message: "Trustpool not found",
      });
    }
    
    // TODO: Add an AI layer of filtering to ensure the post is aligned with the trust pool's values
    // TODO: Add a check to ensure the post is actually from the user who submitted it
    
    trustPool.cultureBook.value_aligned_posts.push({
      content: postContent,
      timestamp: new Date(),
      title: "Twitter Post",
      source: "Twitter",
      posterUsername: username,
    });
    
    await trustPool.cultureBook.save();

    // Return the processed data
    return NextResponse.json({
      status: 200,
      message: "Successfully stored post for voting",
    });
  } catch (error) {
    console.error("Error earning culture tokens (POST /cultureToken/earn):", error);
    return NextResponse.json({
      status: 500,
      error: `Error earning culture tokens: ${error}`,
      message: "Error earning culture tokens",
    });
  }
}
