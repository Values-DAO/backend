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
  createdAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
});

const TrustPools = models.TrustPools || mongoose.model("TrustPools", trustPoolSchema);
export default TrustPools