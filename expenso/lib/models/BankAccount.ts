import mongoose, { Schema, Document, Model } from "mongoose";

export type AccountType = "savings" | "current" | "cash" | "wallet" | "credit" | "other";
export type AccountStatus = "active" | "archived";

export interface IBankAccount extends Document {
  userId: string;
  name: string;
  accountType: AccountType;
  accountColor: string;
  nickname?: string;
  maskedIdentifier?: string;
  openingBalanceInPaise: number;
  currentBalanceInPaise: number;
  isPrimary?: boolean;
  notes?: string;
  status: AccountStatus;
  createdAt: Date;
  updatedAt: Date;
}

const BankAccountSchema = new Schema<IBankAccount>(
  {
    userId: { type: String, required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 100 },
    accountType: {
      type: String,
      required: true,
      enum: ["savings", "current", "cash", "wallet", "credit", "other"],
      default: "savings",
    },
    accountColor: { type: String, required: true, default: "#0F766E" },
    nickname: { type: String, trim: true, maxlength: 50 },
    maskedIdentifier: { type: String, trim: true, maxlength: 20 },
    openingBalanceInPaise: {
      type: Number,
      required: true,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: "Opening balance must be an integer (in paise)",
      },
    },
    currentBalanceInPaise: {
      type: Number,
      required: true,
      default: 0,
      validate: {
        validator: Number.isInteger,
        message: "Current balance must be an integer (in paise)",
      },
    },
    isPrimary: { type: Boolean, default: false },
    notes: { type: String, trim: true, maxlength: 500 },
    status: {
      type: String,
      required: true,
      enum: ["active", "archived"],
      default: "active",
      index: true,
    },
  },
  { timestamps: true }
);

BankAccountSchema.index({ userId: 1, status: 1 });

export const BankAccount: Model<IBankAccount> =
  mongoose.models.BankAccount || mongoose.model<IBankAccount>("BankAccount", BankAccountSchema);
