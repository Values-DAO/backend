import { model, models, Schema } from "mongoose";

const cultureTokenSchema = new Schema(
  {
    // * Trust Pool
    trustPool: {
      type: Schema.Types.ObjectId,
      ref: "TrustPools",
    },
    // * Culture Book
    cultureBook: {
      type: Schema.Types.ObjectId,
      ref: "CultureBook",
    },
    // * Token Fields
    name: {
      // from user
      type: String,
      required: true,
    },
    symbol: {
      // from user
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    tokenAddress: {
      type: String,
      required: true,
    },
    bondingCurveAddress: {
      type: String,
      required: true,
    },
    allocationAddress: {
      type: [
        {
          curatorTreasuryAllocation: { type: String, required: true }, // from user
          treasuryAllocation: {
            type: String,
            required: true,
            default: "0x78db1057A9A1102C3E831E5086B75E9a58e7730c",
          },
          adminTreasuryAllocation: {
            type: String,
            required: true,
            default: "0x78db1057A9A1102C3E831E5086B75E9a58e7730c",
          },
        },
      ],
    },
    allocationAmount: {
      type: [
        {
          curatorTreasuryAllocation: { type: Number, required: true, default: 5000000000 },
          treasuryAllocation: { type: Number, required: true, default: 4000000000 },
          adminTreasuryAllocation: { type: Number, required: true, default: 1000000000 },
        },
      ],
    },
    maximumSupply: {
      type: Number,
      required: true,
      default: 100000000000, // 100 billion
    },
  },
  { timestamps: true }
);

const CultureToken = models.CultureToken || model("CultureToken", cultureTokenSchema);

export default CultureToken;