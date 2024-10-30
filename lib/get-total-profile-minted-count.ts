import {NFT_CONTRACT_ADDRESS} from "@/constants";
import axios from "axios";

export const getTotalProfileNFTsMintedCount = async (pageKey?: string) => {
  let url = `https://base-${
    process.env.NEXT_PUBLIC_APP_ENV === "prod" ? "mainnet" : "sepolia"
  }.g.alchemy.com/nft/v3/${
    process.env.NEXT_PUBLIC_ALCHEMY_KEY
  }/getNFTsForContract?contractAddress=${NFT_CONTRACT_ADDRESS}&withMetadata=false`;

  if (pageKey) {
    url += `&pageKey=${pageKey}`;
  }

  // TODO: Can implement react-query here
  // WAITING: Make the thing run first - viewing alignment page isn't working
  try {
    const {data} = await axios.get(url);

    const count = data.nfts.length;

    if (data.pageKey) {
      // Call the API again with the new pageKey
      const totalCount: Number =
        count + (await getTotalProfileNFTsMintedCount(data.pageKey));
      return totalCount;
    }

    return count;
  } catch (error) {
    console.error("Error fetching total profile NFTs minted count", error);
    return -1;
  }
};

// * This function will return the total number of NFTs minted for the profile contract.