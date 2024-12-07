import mongoose, {models, Schema} from "mongoose";

const trustPoolSchema = new Schema({
  // * General Info
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
  // * Culture Book
  cultureBook: {
    type: Schema.Types.ObjectId,
    ref: "CultureBook",
  },
  // * Community
  cultureBotCommunity: {
    type: Schema.Types.ObjectId,
    ref: "CultureBotCommunity",
  },
  // * Culture Token
  cultureToken: {
    type: Schema.Types.ObjectId,
    ref: "CultureToken",
  }
  // createdAt: {
  //   type: Date,
  //   default: Date.now,
  //   index: true,
  // },
}, { timestamps: true }); // remove this and uncomment the above code if error occurs

const TrustPools = models.TrustPools || mongoose.model("TrustPools", trustPoolSchema);
export default TrustPools