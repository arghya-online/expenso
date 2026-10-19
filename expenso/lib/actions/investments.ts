"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Investment } from "@/lib/models/Investment";
import { toPaise } from "@/lib/utils/currency";

const assetTypeSchema = z.enum([
  "mutual_funds",
  "stocks",
  "fixed_deposit",
  "gold",
  "provident_fund",
  "crypto",
  "real_estate",
  "other",
]);

const createInvestmentSchema = z.object({
  name: z.string().min(1, "Asset name is required").max(100),
  assetType: assetTypeSchema,
  institution: z.string().max(100).optional(),
  investedAmountRupees: z.number().min(0, "Invested amount cannot be negative"),
  currentValueRupees: z.number().min(0, "Current valuation cannot be negative"),
  notes: z.string().max(500).optional(),
});

export async function createInvestment(data: z.infer<typeof createInvestmentSchema>) {
  const session = await requireAuth();
  const validated = createInvestmentSchema.parse(data);

  await connectToDatabase();

  const investment = await Investment.create({
    userId: session.user.id,
    name: validated.name.trim(),
    assetType: validated.assetType,
    institution: validated.institution?.trim() || undefined,
    investedAmountInPaise: toPaise(validated.investedAmountRupees),
    currentValueInPaise: toPaise(validated.currentValueRupees),
    lastValuationDate: new Date(),
    notes: validated.notes?.trim() || undefined,
  });

  revalidatePath("/investments");
  revalidatePath("/dashboard");

  return { success: true, investmentId: investment._id.toString() };
}

const updateValuationSchema = z.object({
  investmentId: z.string().min(1, "Investment ID is required"),
  currentValueRupees: z.number().min(0, "Current valuation cannot be negative"),
});

export async function updateInvestmentValuation(data: z.infer<typeof updateValuationSchema>) {
  const session = await requireAuth();
  const validated = updateValuationSchema.parse(data);

  await connectToDatabase();

  const investment = await Investment.findOne({
    _id: validated.investmentId,
    userId: session.user.id,
  });

  if (!investment) {
    throw new Error("Investment asset not found or access denied.");
  }

  investment.currentValueInPaise = toPaise(validated.currentValueRupees);
  investment.lastValuationDate = new Date();
  await investment.save();

  revalidatePath("/investments");
  revalidatePath("/dashboard");

  return { success: true, currentValueInPaise: investment.currentValueInPaise };
}

const updateInvestmentSchema = z.object({
  investmentId: z.string().min(1, "Investment ID is required"),
  name: z.string().min(1, "Asset name is required").max(100),
  assetType: assetTypeSchema,
  institution: z.string().max(100).optional(),
  investedAmountRupees: z.number().min(0, "Invested amount cannot be negative"),
  currentValueRupees: z.number().min(0, "Current valuation cannot be negative"),
  notes: z.string().max(500).optional(),
});

export async function updateInvestment(data: z.infer<typeof updateInvestmentSchema>) {
  const session = await requireAuth();
  const validated = updateInvestmentSchema.parse(data);

  await connectToDatabase();

  const investment = await Investment.findOne({
    _id: validated.investmentId,
    userId: session.user.id,
  });

  if (!investment) {
    throw new Error("Investment asset not found or access denied.");
  }

  investment.name = validated.name.trim();
  investment.assetType = validated.assetType;
  investment.institution = validated.institution?.trim() || undefined;
  investment.investedAmountInPaise = toPaise(validated.investedAmountRupees);
  investment.currentValueInPaise = toPaise(validated.currentValueRupees);
  investment.lastValuationDate = new Date();
  investment.notes = validated.notes?.trim() || undefined;

  await investment.save();

  revalidatePath("/investments");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function deleteInvestment(investmentId: string) {
  const session = await requireAuth();

  await connectToDatabase();

  const investment = await Investment.findOneAndDelete({
    _id: investmentId,
    userId: session.user.id,
  });

  if (!investment) {
    throw new Error("Investment asset not found or access denied.");
  }

  revalidatePath("/investments");
  revalidatePath("/dashboard");

  return { success: true };
}
