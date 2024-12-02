import { Schema, model, Document, models } from "mongoose";

// Define the Message interface
interface Message extends Document {
  text: string;
  senderUsername: string;
  createdAt: Date;
  senderTgId: string;
  transactionHash?: string;
  ipfsHash?: string;
  community: string;
}

// Base Community interface (without populated fields)
interface CommunityBase {
  trustPoolId: string;
  trustPoolName: string;
  communityName: string;
  chatId: string;
  initiator: string;
  initiatorTgId: string;
  isWatching: boolean;
  privateKey?: string;
  publicKey?: string;
  balance: number;
  messages: Schema.Types.ObjectId[] | Message[];
  cultureBook: Schema.Types.ObjectId
  createdAt: Date;
  updatedAt: Date;
}

// Interface for the Community document (without populated fields)
interface Community extends CommunityBase, Document {}

// Interface for populated Community document
interface PopulatedCommunity extends Omit<Community, "messages"> {
  messages: Message[];
}

// Define the schema for the Community
export const cultureBotCommunitySchema = new Schema<Community>(
  {
    trustPoolId: {
      type: String,
      required: true,
      unique: true,
    },
    trustPoolName: {
      type: String,
      required: true,
    },
    communityName: {
      type: String,
      required: true,
    },
    chatId: {
      type: String,
      required: true,
    },
    initiator: {
      // the user who entered the community in the telegram bot
      type: String,
      required: true,
    },
    initiatorTgId: {
      type: String,
      required: true,
    },
    isWatching: {
      type: Boolean,
      default: true,
    },
    privateKey: {
      type: String,
    },
    publicKey: {
      type: String,
    },
    balance: {
      type: Number,
      default: 0,
    },
    messages: [
      {
        type: Schema.Types.ObjectId,
        ref: "CultureBotMessage",
      },
    ],
    cultureBook: {
      type: Schema.Types.ObjectId,
      ref: "CultureBook",
    }
  },
  { timestamps: true }
);

export const CultureBotCommunity = models.CultureBotCommunity ||  model<Community>("CultureBotCommunity", cultureBotCommunitySchema);

export type { Community, PopulatedCommunity, Message };
