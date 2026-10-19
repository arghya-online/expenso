"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAuth } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { LoanDebt } from "@/lib/models/LoanDebt";
import { BankAccount } from "@/lib/models/BankAccount";
import { AuditLog } from "@/lib/models/AuditLog";
import { toPaise } from "@/lib/utils/currency";

const createLoanSchema = z.object({
  personName: z.string().min(1, "Person or Entity name is required").max(100),
  type: z.enum(["lent", "borrowed"]),
  amountRupees: z.number().min(0.01, "Amount must be at least ₹0.01"),
  dueDate: z.string().optional(),
  notes: z.string().max(500).optional(),
});

export async function createLoanDebt(data: z.infer<typeof createLoanSchema>) {
  const session = await requireAuth();
  const validated = createLoanSchema.parse(data);

  await connectToDatabase();

  const originalAmountInPaise = toPaise(validated.amountRupees);

  const loan = await LoanDebt.create({
    userId: session.user.id,
    personName: validated.personName.trim(),
    type: validated.type,
    originalAmountInPaise,
    remainingAmountInPaise: originalAmountInPaise,
    dueDate: validated.dueDate ? new Date(validated.dueDate) : undefined,
    status: "active",
    repayments: [],
    notes: validated.notes?.trim() || undefined,
  });

  revalidatePath("/loans");
  revalidatePath("/dashboard");

  return { success: true, loanId: loan._id.toString() };
}

const recordRepaymentSchema = z.object({
  loanId: z.string().min(1, "Loan ID is required"),
  amountRupees: z.number().min(0.01, "Repayment amount must be at least ₹0.01"),
  date: z.string().optional(),
  note: z.string().max(200).optional(),
  accountId: z.string().optional(),
});

export async function recordLoanRepayment(data: z.infer<typeof recordRepaymentSchema>) {
  const session = await requireAuth();
  const validated = recordRepaymentSchema.parse(data);

  await connectToDatabase();

  const loan = await LoanDebt.findOne({
    _id: validated.loanId,
    userId: session.user.id,
  });

  if (!loan) {
    throw new Error("Loan/Debt record not found or access denied.");
  }

  if (loan.status === "settled") {
    throw new Error("This loan/debt is already fully settled.");
  }

  const repaymentPaise = toPaise(validated.amountRupees);

  if (repaymentPaise > loan.remainingAmountInPaise) {
    throw new Error("Repayment amount cannot exceed remaining outstanding amount.");
  }

  const paymentDate = validated.date ? new Date(validated.date) : new Date();

  // If a bank account is specified, mutate the balance and log audit
  if (validated.accountId) {
    const account = await BankAccount.findOne({
      _id: validated.accountId,
      userId: session.user.id,
    });

    if (!account) {
      throw new Error("Selected bank account was not found.");
    }

    const previousBalance = account.currentBalanceInPaise;
    let newBalance = previousBalance;

    if (loan.type === "lent") {
      // User lent money; someone paid user back -> account credited
      newBalance = previousBalance + repaymentPaise;
    } else {
      // User borrowed money; user pays them back -> account debited
      newBalance = previousBalance - repaymentPaise;
    }

    account.currentBalanceInPaise = newBalance;
    await account.save();

    await AuditLog.create({
      userId: session.user.id,
      entityType: "bank_account",
      entityId: account._id.toString(),
      action: "balance_adjustment",
      previousState: { currentBalanceInPaise: previousBalance },
      newState: { currentBalanceInPaise: newBalance },
      reason: `Debt repayment: ${loan.type === "lent" ? "Received from" : "Paid to"} ${loan.personName}`,
    });
  }

  // Push repayment to loan
  loan.repayments.push({
    amountInPaise: repaymentPaise,
    date: paymentDate,
    note: validated.note?.trim() || undefined,
    accountId: validated.accountId || undefined,
  });

  loan.remainingAmountInPaise -= repaymentPaise;
  if (loan.remainingAmountInPaise <= 0) {
    loan.remainingAmountInPaise = 0;
    loan.status = "settled";
  }

  await loan.save();

  revalidatePath("/loans");
  revalidatePath("/accounts");
  revalidatePath("/dashboard");

  return {
    success: true,
    remainingAmountInPaise: loan.remainingAmountInPaise,
    isSettled: loan.status === "settled",
  };
}

export async function deleteLoanDebt(loanId: string) {
  const session = await requireAuth();

  await connectToDatabase();

  const loan = await LoanDebt.findOneAndDelete({
    _id: loanId,
    userId: session.user.id,
  });

  if (!loan) {
    throw new Error("Loan/Debt record not found or access denied.");
  }

  revalidatePath("/loans");
  revalidatePath("/dashboard");

  return { success: true };
}

export async function toggleLoanSettled(loanId: string) {
  const session = await requireAuth();

  await connectToDatabase();

  const loan = await LoanDebt.findOne({
    _id: loanId,
    userId: session.user.id,
  });

  if (!loan) {
    throw new Error("Loan/Debt record not found or access denied.");
  }

  if (loan.status === "settled") {
    loan.status = "active";
    if (loan.remainingAmountInPaise === 0) {
      loan.remainingAmountInPaise = loan.originalAmountInPaise;
    }
  } else {
    loan.status = "settled";
    loan.remainingAmountInPaise = 0;
  }

  await loan.save();

  revalidatePath("/loans");
  revalidatePath("/dashboard");

  return { success: true, status: loan.status };
}
