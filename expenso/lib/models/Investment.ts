import mongoose, { Schema, Document, Model } from "mongoose";

export type AssetType =
  | "mutual_funds"
  | "stocks"
  | "fixed_deposit"
  | "gold"
  | "provident_fund"
  | "crypto"
  | "real_estate"
  | "other";

export interface IInvestment extends Document {
  userId: string;
  name: string;
  assetType: AssetType;
  institution?: string;
  investedAmountInPaise: number;
  currentValueInPaise: number;
  lastValuationDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const InvestmentSchema = new Schema<IInvestment>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    assetType: {
      type: String,
      required: true,
      enum: [
        "mutual_funds",
        "stocks",
        "fixed_deposit",
        "gold",
        "provident_fund",
        "crypto",
        "real_estate",
        "other",
      ],
      index: true,
    },
    institution: { type: String, trim: true, maxlength: 100 },
    investedAmountInPaise: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Invested amount must be an integer (in paise)",
      },
    },
    currentValueInPaise: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Current valuation must be an integer (in paise)",
      },
    },
    lastValuationDate: { type: Date, required: true, default: Date.now },
    notes: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

InvestmentSchema.index({ userId: 1, assetType: 1 });

export const Investment: Model<IInvestment> =
  mongoose.models.Investment || mongoose.model<IInvestment>("Investment", InvestmentSchema);
