import {GraphQLClient} from "graphql-request";
import {AIRSTACK_API_URL} from "@/constants";
import {FarcasterSearchUserType} from "@/types";

const searchFarcasterUser = async ({
																		 username,
																	 }: {
	username: string;
}): Promise<{username: string; fid: string}[] | {error: any}> => {
	const query = `query SearchFarcasterUser {
        Socials(
          input: {filter: {profileName: {_regex: "${username.toLowerCase()}"}}, blockchain: ethereum, limit: 10, order: {farRank: ASC}}
        ) {
          Social {
            fid: userId
            username:profileName
          }
        }
      }`;

	const graphQLClient = new GraphQLClient(AIRSTACK_API_URL, {
		headers: {
			Authorization: process.env.NEXT_PUBLIC_AIRSTACK_API_KEY || "",
		},
	});

	try {
		const data: FarcasterSearchUserType = await graphQLClient.request(query);

		return data.Socials.Social || [];
	} catch (error) {
		return {error: error};
	}
};

export default searchFarcasterUser;