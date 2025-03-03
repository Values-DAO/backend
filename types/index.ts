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

export interface TrustPool {
	_id: Schema.Types.ObjectId
	name: string;
	description?: string;
	logo?: string;
	communityLink?: string;
	twitterHandle?: string;
	farcasterHandle?: string;
	organizerTwitterHandle?: string;
	owners: IUser[];
	members: IUser[];
	cultureBook: Schema.Types.ObjectId;
	cultureBotCommunity: Schema.Types.ObjectId;
}

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
  _id: Schema.Types.ObjectId;
	posterUsername: string;
  messageTgId?: string;
	content: string;
	timestamp: Date;
	title: string;
	source: SourceEnum;
  onchain: boolean;
  eligibleForVoting: boolean;
  votes: {
    count: number;
    alignedUsers: {
      userId: string;
    }[];
    notAlignedUsers: {
      userId: string;
    }[];
  };
  transactionHash?: string;
  ipfsHash?: string;
  votingEndsAt?: Date;
  hasPhoto: boolean;
  photoUrl?: string;
  photoFileId?: string;
  status?: string;
  pollId?: string;
}

export interface TopPoster {
	username: string;
}

export interface GenerateCommunityValuesResponse {
  core_values: CoreValue;
  spectrum: SpectrumItem[];
  error?: string;
}

export interface UpdateCommunityValuesResponse {
  value_aligned_posts: ValueAlignedPost[];
  error?: string;
}

export interface CultureBotMessage {
	text: string;
	senderUsername: string;
	createdAt: Date;
}