// This function fetches tweets from a user's timeline using the Twitter API

import axios from "axios";

export const fetchUserTweets = async (
  twitter_userId: string,
  twitter_username: string,
) => {
  const tweets = [];
  const errorLog: any[] = [];

  try {    
    const response = await axios.get(
      `https://twitter154.p.rapidapi.com/user/tweets?username=${twitter_username}&limit=100&user_id=${twitter_userId}&include_replies=false&include_pinned=true`,
      {
        headers: {
          "x-rapidapi-key": process.env.RAPID_TWITTER_API_KEY || "",
          "x-rapidapi-host": process.env.RAPID_TWITTER_API_HOST || "",
        },
      }
    );
    
    const {data} = response;
    
    if (!data) {
      errorLog.push({
        status: response.status || "Unknown error",
        message: "No data returned",
        url: response.config.url,
      });
      console.error("Error fetching user tweets:", errorLog);
      return {
        error: "No data returned",
      };
    }
    
    if (!data.results) {
      errorLog.push({
        status: response.status || "Unknown error",
        message: data.detail || "No results returned",
        url: response.config.url,
      });
      console.error("Error fetching user tweets:", errorLog);
      return {
        error: "Error in Rapid API response",
      };
    }

    tweets.push(...data.results.map((tweet: any) => tweet.text));
    // remove retweets which start with "RT"
    tweets.filter((tweet: string) => !tweet.startsWith("RT"));
    return tweets;
  } catch (error) {
    console.error("Error fetching user tweets:", error);
    return {
      error: error || "Error fetching user tweets. See fetch-user-tweets.ts",
    };
  }
};