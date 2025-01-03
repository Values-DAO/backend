import {AIRSTACK_API_URL} from "@/constants";
import axios from "axios";

export const fetchCastsForUser = async (
  fid: number | string,
  limit: number
) => {
  const query = `
    query MyQuery {
        FarcasterCasts(
            input: {blockchain: ALL, filter: {castedBy: {_eq: "fc_fid:${fid}"}}, limit: ${limit}}
        ) {
            Cast {
            rawText
            }
        }
    }`;

  try {
    const airstackResponse = await axios.post(
      AIRSTACK_API_URL,
      {
        query,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: process.env.NEXT_PUBLIC_AIRSTACK_API_KEY || "",
        },
      }
    );

    return airstackResponse.data.data.FarcasterCasts.Cast.map((cast: any) => {
      return cast.rawText;
    });
  } catch (error) {
    return {
      error: error || "Error fetching user casts",
    };
  }
};
