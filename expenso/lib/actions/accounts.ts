"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { BankAccount } from "@/lib/models/BankAccount";
import { Transaction } from "@/lib/models/Transaction";
import { AuditLog } from "@/lib/models/AuditLog";
import { toPaise } from "@/lib/utils/currency";

const createAccountSchema = z.object({
  name: z.string().min(1, "Account name is required").max(100),
  accountType: z.enum(["savings", "current", "cash", "wallet", "credit", "other"]),
  accountColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color code").default("#0F766E"),
  nickname: z.string().max(50).optional(),
  maskedIdentifier: z.string().max(20).optional(),
  openingBalanceRupees: z.number().min(0, "Opening balance cannot be negative").default(0),
  notes: z.string().max(500).optional(),
});

const updateAccountSchema = z.object({
  accountId: z.string().min(1, "Account ID is required"),
  name: z.string().min(1, "Account name is required").max(100),
  accountType: z.enum(["savings", "current", "cash", "wallet", "credit", "other"]),
  accountColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid color code"),
  nickname: z.string().max(50).optional(),
  maskedIdentifier: z.string().max(20).optional(),
  currentBalanceRupees: z.number().min(0, "Current balance cannot be negative").optional(),
  notes: z.string().max(500).optional(),
});

const adjustBalanceSchema = z.object({
  accountId: z.string().min(1, "Account ID is required"),
  actionType: z.enum(["deposit", "withdrawal", "reconcile"]),
  amountRupees: z.number().min(0, "Amount cannot be negative"),
  purpose: z.string().min(1, "Purpose or reason is required").max(500),
});

export async function createAccount(data: z.infer<typeof createAccountSchema>) {
  const session = await requireAuth();
  const validated = createAccountSchema.parse(data);

  await connectToDatabase();

  const balanceInPaise = toPaise(validated.openingBalanceRupees);

  const account = await BankAccount.create({
    userId: session.user.id,
    name: validated.name,
    accountType: validated.accountType,
    accountColor: validated.accountColor,
    nickname: validated.nickname,
    maskedIdentifier: validated.maskedIdentifier,
    openingBalanceInPaise: balanceInPaise,
    currentBalanceInPaise: balanceInPaise,
    notes: validated.notes,
    status: "active",
  });

  // Record audit log for account creation
  await AuditLog.create({
    userId: session.user.id,
    entityType: "bank_account",
    entityId: account._id.toString(),
    action: "create",
    newState: {
      name: account.name,
      openingBalanceInPaise: balanceInPaise,
      currentBalanceInPaise: balanceInPaise,
    },
    reason: "Initial account creation with opening balance",
  });

  revalidatePath("/dashboard");
  revalidatePath("/accounts");

  return { success: true, accountId: account._id.toString() };
}

export async function updateAccount(data: z.infer<typeof updateAccountSchema>) {
  const session = await requireAuth();
  const validated = updateAccountSchema.parse(data);

  await connectToDatabase();

  const account = await BankAccount.findOne({
    _id: validated.accountId,
    userId: session.user.id,
  });

  if (!account) {
    throw new Error("Account not found or access denied.");
  }

  const previousState = {
    name: account.name,
    accountType: account.accountType,
    accountColor: account.accountColor,
    nickname: account.nickname,
    maskedIdentifier: account.maskedIdentifier,
    currentBalanceInPaise: account.currentBalanceInPaise,
    notes: account.notes,
  };

  account.name = validated.name;
  account.accountType = validated.accountType;
  account.accountColor = validated.accountColor;
  account.nickname = validated.nickname;
  account.maskedIdentifier = validated.maskedIdentifier;
  account.notes = validated.notes;

  if (validated.currentBalanceRupees !== undefined) {
    account.currentBalanceInPaise = toPaise(validated.currentBalanceRupees);
  }

  await account.save();

  await AuditLog.create({
    userId: session.user.id,
    entityType: "bank_account",
    entityId: account._id.toString(),
    action: "update",
    previousState,
    newState: {
      name: account.name,
      accountType: account.accountType,
      accountColor: account.accountColor,
      nickname: account.nickname,
      maskedIdentifier: account.maskedIdentifier,
      currentBalanceInPaise: account.currentBalanceInPaise,
      notes: account.notes,
    },
    reason: "Account profile and balance updated",
  });

  revalidatePath("/dashboard");
  revalidatePath("/accounts");

  return { success: true };
}

export async function adjustBalance(data: z.infer<typeof adjustBalanceSchema>) {
  const session = await requireAuth();
  const validated = adjustBalanceSchema.parse(data);

  await connectToDatabase();

  const account = await BankAccount.findOne({
    _id: validated.accountId,
    userId: session.user.id,
  });

  if (!account) {
    throw new Error("Account not found or access denied.");
  }

  const oldBalance = account.currentBalanceInPaise;
  const deltaPaise = toPaise(validated.amountRupees);
  let newBalance = oldBalance;

  if (validated.actionType === "deposit") {
    newBalance = oldBalance + deltaPaise;
  } else if (validated.actionType === "withdrawal") {
    newBalance = oldBalance - deltaPaise;
  } else if (validated.actionType === "reconcile") {
    newBalance = deltaPaise;
  }

  account.currentBalanceInPaise = newBalance;
  await account.save();

  await AuditLog.create({
    userId: session.user.id,
    entityType: "bank_account",
    entityId: account._id.toString(),
    action: validated.actionType === "reconcile" ? "reconciliation" : "balance_adjustment",
    previousState: { currentBalanceInPaise: oldBalance },
    newState: { currentBalanceInPaise: newBalance },
    reason: `${validated.actionType.toUpperCase()}: ${validated.purpose}`,
  });

  revalidatePath("/dashboard");
  revalidatePath("/accounts");

  return { success: true, newBalance };
}

export async function toggleArchiveAccount(accountId: string) {
  const session = await requireAuth();

  await connectToDatabase();

  const account = await BankAccount.findOne({
    _id: accountId,
    userId: session.user.id,
  });

  if (!account) {
    throw new Error("Account not found or access denied.");
  }

  account.status = account.status === "active" ? "archived" : "active";
  await account.save();

  await AuditLog.create({
    userId: session.user.id,
    entityType: "bank_account",
    entityId: account._id.toString(),
    action: "update",
    newState: { status: account.status },
    reason: `Account ${account.status}`,
  });

  revalidatePath("/dashboard");
  revalidatePath("/accounts");

  return { success: true, status: account.status };
}

export async function deleteAccount(accountId: string) {
  const session = await requireAuth();
  await connectToDatabase();

  const account = await BankAccount.findOne({
    _id: accountId,
    userId: session.user.id,
  });

  if (!account) {
    throw new Error("Account not found or access denied.");
  }

  // Delete all associated transactions to avoid broken references
  await Transaction.deleteMany({
    userId: session.user.id,
    $or: [{ accountId: account._id }, { destinationAccountId: account._id }],
  });

  await BankAccount.deleteOne({ _id: account._id });

  await AuditLog.create({
    userId: session.user.id,
    entityType: "bank_account",
    entityId: account._id.toString(),
    action: "delete",
    previousState: {
      name: account.name,
      currentBalanceInPaise: account.currentBalanceInPaise,
    },
    reason: `Permanently deleted account "${account.name}" and cleared associated ledger entries`,
  });

  revalidatePath("/dashboard");
  revalidatePath("/accounts");
  revalidatePath("/transactions");
  revalidatePath("/reports");

  return { success: true };
}

