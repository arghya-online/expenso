import mongoose, { Schema, Document, Model } from "mongoose";

export type LoanType = "lent" | "borrowed";
export type LoanStatus = "active" | "settled" | "defaulted";

export interface IRepayment {
  amountInPaise: number;
  date: Date;
  note?: string;
  accountId?: string;
}

export interface ILoanDebt extends Document {
  userId: string;
  personName: string;
  type: LoanType;
  originalAmountInPaise: number;
  remainingAmountInPaise: number;
  dueDate?: Date;
  status: LoanStatus;
  repayments: IRepayment[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RepaymentSchema = new Schema<IRepayment>(
  {
    amountInPaise: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Repayment amount must be an integer (in paise)",
      },
    },
    date: { type: Date, required: true, default: Date.now },
    note: { type: String, trim: true, maxlength: 200 },
    accountId: { type: String },
  },
  { _id: true }
);

const LoanDebtSchema = new Schema<ILoanDebt>(
  {
    userId: { type: String, required: true, index: true },
    personName: { type: String, required: true, trim: true, maxlength: 100 },
    type: {
      type: String,
      required: true,
      enum: ["lent", "borrowed"],
      index: true,
    },
    originalAmountInPaise: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Original amount must be an integer (in paise)",
      },
    },
    remainingAmountInPaise: {
      type: Number,
      required: true,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Remaining amount must be an integer (in paise)",
      },
    },
    dueDate: { type: Date },
    status: {
      type: String,
      required: true,
      enum: ["active", "settled", "defaulted"],
      default: "active",
      index: true,
    },
    repayments: [RepaymentSchema],
    notes: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

LoanDebtSchema.index({ userId: 1, type: 1, status: 1 });

export const LoanDebt: Model<ILoanDebt> =
  mongoose.models.LoanDebt || mongoose.model<ILoanDebt>("LoanDebt", LoanDebtSchema);
