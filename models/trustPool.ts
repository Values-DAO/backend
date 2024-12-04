import mongoose, {models, Schema} from "mongoose";

const trustPoolSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
  },
  logo: {
    type: String,
  },
  communityLink: {
    type: String,
  },
  twitterHandle: {
    type: String,
  },
  farcasterHandle: {
    type: String,
  },
  organizerTwitterHandle: {
    type: String,
  },
  owners: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    required: true,
  },
  members: {
    type: [
      {
        type: Schema.Types.ObjectId,
        ref: "Users",
      },
    ],
    default: [],
  },
  // * New version: Addition of values to communities
  core_values: {
    type: Map,
    of: Number, // Each core value is a key with a number as its value
    default: {},
  },
  spectrum: [
    {
      type: {
        name: { type: String, required: true },
        description: { type: String, required: true },
        score: { type: Number, required: true, min: 1, max: 100 },
      },
      default: [],
    },
  ],
  value_aligned_posts: [
    {
      type: {
        id: { type: String, required: true },
        posterUsername: { type: String, required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, required: true },
        values: [{ type: String, required: true }],
        title: { type: String, required: true },
        source: { type: String, enum: ["Twitter", "Youtube", "Farcaster", "Telegram"], required: true },
      },
      default: [],
    },
  ],
  top_posters: [
    {
      type: {
        username: { type: String, required: true },
      },
      default: [],
    }
  ],
  updateDescription: {
    type: {
      content: { type: String, required: true },
      timestamp: { type: Date, default: Date.now },
    }
  },
  // TODO: Add tokenomics fields
  ticker: {
    type: String,
  },
  tokenAddress: {
    type: String,
  },
  tokenDecimals: {
    type: Number,
  },
  tokenSupply: {
    type: Number,
  },
  tokenPrice: {
    type: Number,
  },
  tokenHolders: {
    type: Number,
  },
  tokenMarketCap: {
    type: Number,
  },
  // createdAt: {
  //   type: Date,
  //   default: Date.now,
  //   index: true,
  // },
}, { timestamps: true }); // remove this and uncomment the above code if error occurs

const TrustPools = models.TrustPools || mongoose.model("TrustPools", trustPoolSchema);
export default TrustPools