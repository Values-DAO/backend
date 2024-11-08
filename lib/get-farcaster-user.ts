import {AIRSTACK_API_URL} from "@/constants";
import {GraphQLClient} from "graphql-request";
import rateLimit from "axios-rate-limit";
import axios from "axios";

type FarcasterSocialData = {
  Socials: {
    Social: {
      profileName: string;
      profileHandle: string;
    }[];
  };
};

type EngagementResult = {
  fid: number;
  username: string;
  rank: number;
  score: number;
  percentile: number;
}

export async function getFarcasterUser(fid: number) {
  const query = `query GetFarcasterUsername {
  Socials(
    input: {filter: {dappName: {_eq: farcaster}, userId: {_eq: "${fid}"}}, blockchain: ethereum}
  ) {
    Social {
      profileHandle
      profileName
    }
  }
}`;

  const graphQLClient = new GraphQLClient(AIRSTACK_API_URL, {
    headers: {
      Authorization: process.env.NEXT_PUBLIC_AIRSTACK_API_KEY || "",
    },
  });

  try {
    const data: FarcasterSocialData = await graphQLClient.request(query);

    return data.Socials.Social[0];
  } catch (error) {
    return {};
  }
}


const axiosInstance = rateLimit(axios.create(), {
  maxRequests: 2, // Maximum 3 requests per second
  perMilliseconds: 1000, // Reset limit every 1 second
});

// OpenRank
export async function getFarcasterUsernameFromFID(fid: number): Promise<string | null> {
  try {
    const response = await axiosInstance.post<{
      result: EngagementResult[];
    }>("https://graph.cast.k3l.io/scores/global/engagement/fids?engagement_type=1.0&lite=true", [fid]);

    const engagementData = response.data.result;
    if (engagementData && engagementData.length > 0) {
      return engagementData[0].username;
    }
    return null;
  } catch (error) {
    console.error("Error fetching Farcaster username:", error);
    return null;
  }
}

// Airstack
// export async function getFarcasterUsernameFromFID(fid: number): Promise<string | null> {
//   const query = `query GetFarcasterUsername {
//     Socials(
//       input: {filter: {dappName: {_eq: farcaster}, userId: {_eq: "${fid}"}}, blockchain: ethereum}
//     ) {
//       Social {
//         profileHandle
//         profileName
//       }
//     }
//   }`;

//   try {
//     const { data }: { data: FarcasterSocialData } = await axiosInstance.post(
//       AIRSTACK_API_URL,
//       {
//         query,
//       },
//       {
//         headers: {
//           Authorization: process.env.NEXT_PUBLIC_AIRSTACK_API_KEY || "",
//         },
//       }
//     );
    
//     console.log(data.Socials);

//     return data.Socials.Social[0].profileName;
//   } catch (error) {
//     return null;
//   }
// }