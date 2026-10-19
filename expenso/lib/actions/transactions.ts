"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Transaction } from "@/lib/models/Transaction";
import { BankAccount } from "@/lib/models/BankAccount";
import { AuditLog } from "@/lib/models/AuditLog";
import { toPaise } from "@/lib/utils/currency";

const createTransactionSchema = z.object({
  type: z.enum(["income", "expense", "transfer"]),
  amountRupees: z.number().min(0.01, "Amount must be at least ₹0.01"),
  date: z.string().min(1, "Date is required"),
  accountId: z.string().min(1, "Account is required"),
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  description: z.string().min(1, "Description is required").max(255),
  merchant: z.string().max(100).optional(),
  paymentMethod: z.enum(["upi", "card", "netbanking", "cash", "cheque", "other"]).default("upi"),
  destinationAccountId: z.string().optional(),
  tags: z.array(z.string()).default([]),
  notes: z.string().max(500).optional(),
});

export async function createTransaction(data: z.infer<typeof createTransactionSchema>) {
  const session = await requireAuth();
  const validated = createTransactionSchema.parse(data);

  await connectToDatabase();

  const amountInPaise = toPaise(validated.amountRupees);
  const txDate = new Date(validated.date);

  // Verify source account ownership
  const sourceAccount = await BankAccount.findOne({
    _id: validated.accountId,
    userId: session.user.id,
  });

  if (!sourceAccount) {
    throw new Error("Source bank account not found or access denied.");
  }

  if (validated.type === "transfer") {
    if (!validated.destinationAccountId) {
      throw new Error("Destination account is required for transfers.");
    }
    if (validated.destinationAccountId === validated.accountId) {
      throw new Error("Source and destination accounts cannot be the same.");
    }

    const destAccount = await BankAccount.findOne({
      _id: validated.destinationAccountId,
      userId: session.user.id,
    });

    if (!destAccount) {
      throw new Error("Destination bank account not found or access denied.");
    }

    // Debit source, Credit destination
    sourceAccount.currentBalanceInPaise -= amountInPaise;
    destAccount.currentBalanceInPaise += amountInPaise;

    await sourceAccount.save();
    await destAccount.save();

    const transaction = await Transaction.create({
      userId: session.user.id,
      accountId: sourceAccount._id,
      destinationAccountId: destAccount._id,
      type: "transfer",
      amountInPaise,
      date: txDate,
      category: "Transfer",
      description: validated.description,
      paymentMethod: validated.paymentMethod,
      tags: validated.tags,
      notes: validated.notes,
    });

    await AuditLog.create({
      userId: session.user.id,
      entityType: "transaction",
      entityId: transaction._id.toString(),
      action: "create",
      newState: {
        type: "transfer",
        amountInPaise,
        from: sourceAccount.name,
        to: destAccount.name,
      },
      reason: `Transfer between accounts: ${validated.description}`,
    });

    revalidatePath("/dashboard");
    revalidatePath("/accounts");
    revalidatePath("/transactions");

    return { success: true, transactionId: transaction._id.toString() };
  }

  // Handle standard Income or Expense
  if (validated.type === "income") {
    sourceAccount.currentBalanceInPaise += amountInPaise;
  } else if (validated.type === "expense") {
    sourceAccount.currentBalanceInPaise -= amountInPaise;
  }

  await sourceAccount.save();

  const transaction = await Transaction.create({
    userId: session.user.id,
    accountId: sourceAccount._id,
    type: validated.type,
    amountInPaise,
    date: txDate,
    category: validated.category,
    subcategory: validated.subcategory,
    description: validated.description,
    merchant: validated.merchant,
    paymentMethod: validated.paymentMethod,
    tags: validated.tags,
    notes: validated.notes,
  });

  await AuditLog.create({
    userId: session.user.id,
    entityType: "transaction",
    entityId: transaction._id.toString(),
    action: "create",
    newState: {
      type: validated.type,
      amountInPaise,
      account: sourceAccount.name,
      category: validated.category,
    },
    reason: `${validated.type.toUpperCase()}: ${validated.description}`,
  });

  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  revalidatePath("/transactions");

  return { success: true, transactionId: transaction._id.toString() };
}

export async function deleteTransaction(transactionId: string) {
  const session = await requireAuth();

  await connectToDatabase();

  const transaction = await Transaction.findOne({
    _id: transactionId,
    userId: session.user.id,
  });

  if (!transaction) {
    throw new Error("Transaction not found or access denied.");
  }

  const sourceAccount = await BankAccount.findOne({
    _id: transaction.accountId,
    userId: session.user.id,
  });

  // Revert balance impact
  if (sourceAccount) {
    if (transaction.type === "income") {
      sourceAccount.currentBalanceInPaise -= transaction.amountInPaise;
      await sourceAccount.save();
    } else if (transaction.type === "expense") {
      sourceAccount.currentBalanceInPaise += transaction.amountInPaise;
      await sourceAccount.save();
    } else if (transaction.type === "transfer" && transaction.destinationAccountId) {
      sourceAccount.currentBalanceInPaise += transaction.amountInPaise;
      await sourceAccount.save();

      const destAccount = await BankAccount.findOne({
        _id: transaction.destinationAccountId,
        userId: session.user.id,
      });

      if (destAccount) {
        destAccount.currentBalanceInPaise -= transaction.amountInPaise;
        await destAccount.save();
      }
    }
  }

  await Transaction.deleteOne({ _id: transaction._id });

  await AuditLog.create({
    userId: session.user.id,
    entityType: "transaction",
    entityId: transactionId,
    action: "delete",
    previousState: {
      type: transaction.type,
      amountInPaise: transaction.amountInPaise,
      description: transaction.description,
    },
    reason: "Transaction deleted and balance impact reverted",
  });

  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  revalidatePath("/transactions");

  return { success: true };
}
