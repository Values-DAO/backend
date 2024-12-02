import {Schema} from "mongoose";

export interface IUser {
  userId: string;
  email?: string;
  fid?: number;
  twitterUsername?: string;
  twitterId?: string;
  wallets: string[];
  profileMinted: boolean;
  profileNft?: number;
  generatedValues: {
    twitter: string[];
    warpcast: string[];
  };
  generatedValuesWithWeights: {
    twitter: {
      [key: string]: number;
    };
    warpcast: {
      [key: string]: number;
    };
  };
  spectrum: {
    warpcast: {
      name: string;
      description: string;
      score: number;
    }[];
    twitter: {
      name: string;
      description: string;
      score: number;
    }[];
  };
  userContentRemarks: {
    warpcast?: string;
    twitter?: string;
  };
  mintedValues: {
    value: Schema.Types.ObjectId;
    weightage: number;
  }[];
  balance: number;
  userTxHashes: {
    txHash: string;
    createdAt: Date;
  }[];
  communitiesMinted: Schema.Types.ObjectId[];
  attestations: string[];
  referrer?: string;
  socialValuesMinted: string[];
}

export type FarcasterSearchUserType = {
  Socials: {
    Social: {
      fid: string;
      username: string;
    }[];
  };
};

export type SpectrumItem = {
  name: string;
  score: number;
  description: string;
};

export interface CoreValue {
	[key: string]: number;
}

export enum SourceEnum {
	Twitter = "Twitter",
	Youtube = "Youtube",
	Farcaster = "Farcaster",
	Telegram = "Telegram",
}

export interface ValueAlignedPost {
	posterUsername: string;
	content: string;
	timestamp: Date;
	values: string[];
	title: string;
	source: SourceEnum;
}

export interface TopPoster {
	username: string;
}

export interface GenerateCommunityValuesResponse {
	core_values: CoreValue;
	spectrum: SpectrumItem[];
	value_aligned_posts: ValueAlignedPost[];
	top_posters: TopPoster[];
  description: string;
	error?: string;
}

export interface CultureBotMessage {
	text: string;
	senderUsername: string;
	createdAt: Date;
}