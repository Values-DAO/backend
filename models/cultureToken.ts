import { model, models, Schema } from "mongoose";

const cultureTokenSchema = new Schema({
  // * Trust Pool
  trustPool: {
    type: Schema.Types.ObjectId,
    ref: "TrustPools",
    required: true,
  },
  // * Culture Book
  cultureBook: {
    type: Schema.Types.ObjectId,
    ref: "CultureBook",
    required: true,
  },
  // * Token Fields
  name: { // from user
    type: String,
    required: true,
  },
  symbol: { // from user
    type: String,
    required: true,
  },
  allocationAddress: {
    type: [
      {
        curatorTreasuryAllocation: { type: String, required: true }, // from user
        treasuryAllocation: { type: String, required: true }, // from user
        adminTreasuryAllocation: {
          type: String,
          required: true,
          default: "0x1B5AbF17eD9df067fC69F8047BfF3964BC06cc23",
        },
      },
    ],
  },
  allocationAmount: {
    type: [
      {
        curatorTreasuryAllocation: { type: Number, required: true, default: 4500000000 },
        treasuryAllocation: { type: Number, required: true, default: 4500000000 },
        adminTreasuryAllocation: { type: Number, required: true, default: 1000000000 },
      },
    ],
  },
  maximumSupply: {
    type: Number,
    required: true,
    default: 100000000000, // 1 billion
  },
}, {timestamps: true});

const CultureToken = models.CultureToken || model("CultureToken", cultureTokenSchema);

export default CultureToken;