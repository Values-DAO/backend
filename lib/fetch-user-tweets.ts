// This function fetches tweets from a user's timeline using the Twitter API

export const fetchUserTweets = async (
  twitter_userId: string,
  pageLimit: number
) => {
  const tweets = [];
  let pagination_token: string | null = null;
  let pageCount = 0;
  const errorLog: any[] = [];

  try {
    do { // This loop continues fetching tweets until either the pageLimit is reached or the API response indicates that there are no more tweets to fetch (i.e., pagination_token is null).
      if (pageCount >= pageLimit) break;

      const queryParam: string = pagination_token
        ? `pagination_token=${pagination_token}`
        : "";

      const response = await fetch(
        `https://api.twitter.com/2/users/${twitter_userId}/tweets?max_results=100&${queryParam}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        const data = await response.json();
        errorLog.push({
          status: response.status || data.status,
          message: data?.title || "Unknown error",
          url: response.url,
        });
        console.error("Error fetching user tweets:", errorLog);
        return {
          error: data || "Error fetching user tweets",
        };
      }
      const {data, meta} = await response.json();

      if (data) {
        tweets.push(...data.map((tweet: any) => tweet.text));
      }

      pagination_token = meta.next_token ? meta.next_token : null;
      pageCount++; // Increment the page counter after each successful fetch
    } while (pagination_token);

    return tweets;
  } catch (error) {
    console.error("Error fetching user tweets:", error);
    return {
      error: error || "Error fetching user tweets. See fetch-user-tweets.ts",
    };
  }
};