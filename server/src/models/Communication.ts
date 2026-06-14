import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * An individual communication sent to a single customer
 * as part of a campaign. Tracks the full lifecycle from
 * queued → sent → delivered → opened → clicked (or failed).
 */
export interface ICommunication extends Document {
  _id: Types.ObjectId;
  campaignId: Types.ObjectId;
  customerId: Types.ObjectId;
  channel: 'whatsapp' | 'sms' | 'email';
  channelReason?: string;
  personalizedMessage: string;
  status: 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'failed';
  sentAt?: Date;
  deliveredAt?: Date;
  openedAt?: Date;
  clickedAt?: Date;
  failedAt?: Date;
  failureReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const communicationSchema = new Schema<ICommunication>(
  {
    campaignId: {
      type: Schema.Types.ObjectId,
      ref: 'Campaign',
      required: [true, 'Campaign ID is required'],
    },
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer ID is required'],
    },
    channel: {
      type: String,
      enum: ['whatsapp', 'sms', 'email'],
      required: [true, 'Channel is required'],
    },
    channelReason: {
      type: String,
    },
    personalizedMessage: {
      type: String,
      required: [true, 'Personalized message is required'],
    },
    status: {
      type: String,
      enum: ['queued', 'sent', 'delivered', 'opened', 'clicked', 'failed'],
      default: 'queued',
    },
    sentAt: { type: Date },
    deliveredAt: { type: Date },
    openedAt: { type: Date },
    clickedAt: { type: Date },
    failedAt: { type: Date },
    failureReason: { type: String },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient querying
communicationSchema.index({ campaignId: 1, status: 1 });
communicationSchema.index({ customerId: 1 });
communicationSchema.index({ status: 1 });

const Communication = mongoose.model<ICommunication>(
  'Communication',
  communicationSchema
);

export default Communication;
