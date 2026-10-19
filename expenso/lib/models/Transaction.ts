import mongoose, { Schema, Document, Model } from "mongoose";

export type TransactionType = "income" | "expense" | "transfer";
export type PaymentMethod = "upi" | "card" | "netbanking" | "cash" | "cheque" | "other";

export interface ITransaction extends Document {
  userId: string;
  accountId: mongoose.Types.ObjectId;
  type: TransactionType;
  amountInPaise: number;
  date: Date;
  category: string;
  subcategory?: string;
  description: string;
  merchant?: string;
  paymentMethod: PaymentMethod;
  tags: string[];
  destinationAccountId?: mongoose.Types.ObjectId;
  transferPairId?: mongoose.Types.ObjectId;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const TransactionSchema = new Schema<ITransaction>(
  {
    userId: { type: String, required: true, index: true },
    accountId: { type: Schema.Types.ObjectId, ref: "BankAccount", required: true, index: true },
    type: {
      type: String,
      required: true,
      enum: ["income", "expense", "transfer"],
      index: true,
    },
    amountInPaise: {
      type: Number,
      required: true,
      min: [1, "Transaction amount must be greater than 0 paise"],
      validate: {
        validator: Number.isInteger,
        message: "Transaction amount must be an integer (in paise)",
      },
    },
    date: { type: Date, required: true, default: Date.now, index: true },
    category: { type: String, required: true, trim: true, index: true },
    subcategory: { type: String, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 255 },
    merchant: { type: String, trim: true, maxlength: 100 },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["upi", "card", "netbanking", "cash", "cheque", "other"],
      default: "upi",
    },
    tags: [{ type: String, trim: true }],
    destinationAccountId: { type: Schema.Types.ObjectId, ref: "BankAccount" },
    transferPairId: { type: Schema.Types.ObjectId, ref: "Transaction" },
    notes: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

TransactionSchema.index({ userId: 1, date: -1 });
TransactionSchema.index({ userId: 1, type: 1, date: -1 });
TransactionSchema.index({ userId: 1, category: 1 });

export const Transaction: Model<ITransaction> =
  mongoose.models.Transaction || mongoose.model<ITransaction>("Transaction", TransactionSchema);
