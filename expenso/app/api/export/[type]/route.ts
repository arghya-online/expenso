import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "@/lib/auth/session";
import { connectToDatabase } from "@/lib/db/mongoose";
import { Transaction } from "@/lib/models/Transaction";
import { BankAccount } from "@/lib/models/BankAccount";
import { LoanDebt } from "@/lib/models/LoanDebt";
import { Investment } from "@/lib/models/Investment";
import { toRupees } from "@/lib/utils/currency";

function escapeCSV(field: unknown): string {
  if (field === null || field === undefined) return '""';
  const str = String(field).replace(/"/g, '""');
  return `"${str}"`;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ type: string }> }
) {
  const session = await getServerSession();
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { type } = await context.params;
  await connectToDatabase();
  const userId = session.user.id;

  if (type === "transactions") {
    const transactions = await Transaction.find({ userId })
      .populate("accountId", "name")
      .populate("destinationAccountId", "name")
      .sort({ date: -1 })
      .lean();

    const headers = [
      "Date",
      "Type",
      "Category",
      "Subcategory",
      "Description",
      "Merchant",
      "Account",
      "Destination Account",
      "Amount (INR)",
      "Payment Method",
      "Notes",
    ];

    interface ExportTx {
      date: Date;
      type: string;
      category: string;
      subcategory?: string;
      description: string;
      merchant?: string;
      accountId?: { name?: string };
      destinationAccountId?: { name?: string };
      amountInPaise: number;
      paymentMethod?: string;
      notes?: string;
    }

    const rows = (transactions as unknown as ExportTx[]).map((tx) => [
      escapeCSV(new Date(tx.date).toISOString().split("T")[0]),
      escapeCSV(tx.type.toUpperCase()),
      escapeCSV(tx.category),
      escapeCSV(tx.subcategory || ""),
      escapeCSV(tx.description),
      escapeCSV(tx.merchant || ""),
      escapeCSV(tx.accountId?.name || "Account"),
      escapeCSV(tx.destinationAccountId?.name || ""),
      escapeCSV(toRupees(tx.amountInPaise).toFixed(2)),
      escapeCSV(tx.paymentMethod?.toUpperCase() || "UPI"),
      escapeCSV(tx.notes || ""),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="expenso_transactions_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  if (type === "accounts") {
    const accounts = await BankAccount.find({ userId }).sort({ name: 1 }).lean();

    const headers = [
      "Account Name",
      "Account Type",
      "Masked Identifier",
      "Nickname",
      "Opening Balance (INR)",
      "Current Balance (INR)",
      "Status",
    ];

    interface ExportAccount {
      name: string;
      accountType: string;
      maskedIdentifier?: string;
      nickname?: string;
      openingBalanceInPaise: number;
      currentBalanceInPaise: number;
      status: string;
    }

    const rows = (accounts as unknown as ExportAccount[]).map((acc) => [
      escapeCSV(acc.name),
      escapeCSV(acc.accountType.toUpperCase()),
      escapeCSV(acc.maskedIdentifier || ""),
      escapeCSV(acc.nickname || ""),
      escapeCSV(toRupees(acc.openingBalanceInPaise).toFixed(2)),
      escapeCSV(toRupees(acc.currentBalanceInPaise).toFixed(2)),
      escapeCSV(acc.status.toUpperCase()),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="expenso_accounts_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  if (type === "loans") {
    const loans = await LoanDebt.find({ userId }).sort({ createdAt: -1 }).lean();

    const headers = [
      "Person / Entity",
      "Type",
      "Original Amount (INR)",
      "Remaining Amount (INR)",
      "Repaid Amount (INR)",
      "Due Date",
      "Status",
      "Notes",
    ];

    interface ExportLoan {
      personName: string;
      type: string;
      originalAmountInPaise: number;
      remainingAmountInPaise: number;
      dueDate?: Date;
      status: string;
      notes?: string;
    }

    const rows = (loans as unknown as ExportLoan[]).map((l) => [
      escapeCSV(l.personName),
      escapeCSV(l.type === "lent" ? "MONEY LENT" : "MONEY BORROWED"),
      escapeCSV(toRupees(l.originalAmountInPaise).toFixed(2)),
      escapeCSV(toRupees(l.remainingAmountInPaise).toFixed(2)),
      escapeCSV(toRupees(l.originalAmountInPaise - l.remainingAmountInPaise).toFixed(2)),
      escapeCSV(l.dueDate ? new Date(l.dueDate).toISOString().split("T")[0] : ""),
      escapeCSV(l.status.toUpperCase()),
      escapeCSV(l.notes || ""),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="expenso_loans_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  if (type === "investments") {
    const investments = await Investment.find({ userId }).sort({ currentValueInPaise: -1 }).lean();

    const headers = [
      "Asset Name",
      "Asset Category",
      "Platform / Broker",
      "Invested (INR)",
      "Current Value (INR)",
      "P&L Gain/Loss (INR)",
      "Return %",
      "Last Valuation Date",
    ];

    interface ExportInvestment {
      name: string;
      assetType: string;
      institution?: string;
      investedAmountInPaise: number;
      currentValueInPaise: number;
      lastValuationDate: Date;
    }

    const rows = (investments as unknown as ExportInvestment[]).map((inv) => {
      const invested = toRupees(inv.investedAmountInPaise);
      const current = toRupees(inv.currentValueInPaise);
      const gainLoss = current - invested;
      const retPct = invested > 0 ? ((gainLoss / invested) * 100).toFixed(2) : "0.00";

      return [
        escapeCSV(inv.name),
        escapeCSV(inv.assetType.toUpperCase()),
        escapeCSV(inv.institution || ""),
        escapeCSV(invested.toFixed(2)),
        escapeCSV(current.toFixed(2)),
        escapeCSV(gainLoss.toFixed(2)),
        escapeCSV(`${retPct}%`),
        escapeCSV(new Date(inv.lastValuationDate).toISOString().split("T")[0]),
      ];
    });

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\r\n");

    return new NextResponse(csvContent, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="expenso_investments_${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  }

  return new NextResponse("Invalid export type", { status: 400 });
}
