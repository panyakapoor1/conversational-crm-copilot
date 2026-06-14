import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * An AI-generated or manually-created customer segment.
 * Stores both the natural language query (what the user typed)
 * and the resulting MongoDB query (what Claude generated).
 */
export interface ISegment extends Document {
  _id: Types.ObjectId;
  name: string;
  description?: string;
  mongoQuery: string;
  naturalLanguageQuery?: string;
  customerCount: number;
  customerIds: Types.ObjectId[];
  aiGenerated: boolean;
  aiReasoning?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const segmentSchema = new Schema<ISegment>(
  {
    name: {
      type: String,
      required: [true, 'Segment name is required'],
      trim: true,
    },
    description: { type: String, trim: true },
    mongoQuery: {
      type: String,
      default: '{}',
    },
    naturalLanguageQuery: { type: String, trim: true },
    customerCount: { type: Number, default: 0 },
    customerIds: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Customer',
      },
    ],
    aiGenerated: { type: Boolean, default: true },
    aiReasoning: { type: String },
    tags: { type: [String], default: [] },
  },
  {
    timestamps: true,
  }
);

segmentSchema.index({ createdAt: -1 });

const Segment = mongoose.model<ISegment>('Segment', segmentSchema);

export default Segment;
