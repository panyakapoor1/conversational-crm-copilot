import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Campaign delivery statistics — tracks funnel from
 * queued → sent → delivered → opened → clicked, plus failures.
 */
export interface ICampaignStats {
  total: number;
  queued: number;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  failed: number;
}

/**
 * AI-recommended optimal send time with reasoning.
 */
export interface IAISuggestions {
  sendTime: string;
  reasoning: string;
}

/**
 * A marketing campaign targeting a specific segment.
 * Campaigns move through draft → sending → sent → completed.
 * Includes real-time stats, AI send-time suggestions,
 * and post-campaign intelligence reports.
 */
export interface ICampaign extends Document {
  _id: Types.ObjectId;
  name: string;
  segmentId: Types.ObjectId;
  messageTemplate: string;
  channel: 'whatsapp' | 'sms' | 'email' | 'mixed';
  status: 'draft' | 'sending' | 'sent' | 'completed';
  scheduledAt?: Date;
  sentAt?: Date;
  completedAt?: Date;
  stats: ICampaignStats;
  aiSuggestions?: IAISuggestions;
  intelligenceReport?: string;
  createdAt: Date;
  updatedAt: Date;
}

const campaignStatsSchema = new Schema<ICampaignStats>(
  {
    total: { type: Number, default: 0 },
    queued: { type: Number, default: 0 },
    sent: { type: Number, default: 0 },
    delivered: { type: Number, default: 0 },
    opened: { type: Number, default: 0 },
    clicked: { type: Number, default: 0 },
    failed: { type: Number, default: 0 },
  },
  { _id: false }
);

const aiSuggestionsSchema = new Schema<IAISuggestions>(
  {
    sendTime: { type: String },
    reasoning: { type: String },
  },
  { _id: false }
);

const campaignSchema = new Schema<ICampaign>(
  {
    name: {
      type: String,
      required: [true, 'Campaign name is required'],
      trim: true,
    },
    segmentId: {
      type: Schema.Types.ObjectId,
      ref: 'Segment',
      required: [true, 'Segment ID is required'],
    },
    messageTemplate: {
      type: String,
      required: [true, 'Message template is required'],
    },
    channel: {
      type: String,
      enum: ['whatsapp', 'sms', 'email', 'mixed'],
      default: 'mixed',
    },
    status: {
      type: String,
      enum: ['draft', 'sending', 'sent', 'completed'],
      default: 'draft',
    },
    scheduledAt: { type: Date },
    sentAt: { type: Date },
    completedAt: { type: Date },
    stats: {
      type: campaignStatsSchema,
      default: () => ({
        total: 0,
        queued: 0,
        sent: 0,
        delivered: 0,
        opened: 0,
        clicked: 0,
        failed: 0,
      }),
    },
    aiSuggestions: { type: aiSuggestionsSchema },
    intelligenceReport: { type: String },
  },
  {
    timestamps: true,
  }
);

campaignSchema.index({ createdAt: -1 });
campaignSchema.index({ status: 1 });

const Campaign = mongoose.model<ICampaign>('Campaign', campaignSchema);

export default Campaign;
