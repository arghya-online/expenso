import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAuditLog extends Document {
  userId: string;
  entityType: "bank_account" | "transaction" | "investment" | "loan";
  entityId: string;
  action: "create" | "update" | "delete" | "balance_adjustment" | "reconciliation";
  previousState?: Record<string, unknown>;
  newState?: Record<string, unknown>;
  reason?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    userId: { type: String, required: true, index: true },
    entityType: {
      type: String,
      required: true,
      enum: ["bank_account", "transaction", "investment", "loan"],
      index: true,
    },
    entityId: { type: String, required: true, index: true },
    action: {
      type: String,
      required: true,
      enum: ["create", "update", "delete", "balance_adjustment", "reconciliation"],
    },
    previousState: { type: Schema.Types.Mixed },
    newState: { type: Schema.Types.Mixed },
    reason: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

AuditLogSchema.index({ userId: 1, createdAt: -1 });

export const AuditLog: Model<IAuditLog> =
  mongoose.models.AuditLog || mongoose.model<IAuditLog>("AuditLog", AuditLogSchema);
