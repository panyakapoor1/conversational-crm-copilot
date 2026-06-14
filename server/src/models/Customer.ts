import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Channel interaction timestamps — tracks when the customer last
 * interacted on each messaging channel.
 */
export interface ILastChannelInteraction {
  whatsapp?: Date;
  sms?: Date;
  email?: Date;
}

/**
 * Core customer document stored in MongoDB.
 * Represents a Keventers CRM customer with spend metrics,
 * behavioural tags, and channel engagement data.
 */
export interface ICustomer extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  city: string;
  totalSpend: number;
  orderCount: number;
  lastOrderDate?: Date;
  firstOrderDate?: Date;
  averageOrderValue: number;
  favouriteProduct?: string;
  favouriteCategory?: string;
  tags: string[];
  channelPreference: 'whatsapp' | 'sms' | 'email';
  engagementScore: number;
  lastChannelInteraction: ILastChannelInteraction;
  createdAt: Date;
  updatedAt: Date;
}

const lastChannelInteractionSchema = new Schema(
  {
    whatsapp: { type: Date },
    sms: { type: Date },
    email: { type: Date },
  },
  { _id: false }
);

const customerSchema = new Schema<ICustomer>(
  {
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      enum: {
        values: [
          'Mumbai',
          'Delhi',
          'Bengaluru',
          'Hyderabad',
          'Chennai',
          'Pune',
          'Noida',
          'Gurgaon',
        ],
        message: '{VALUE} is not a supported city',
      },
    },
    totalSpend: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 },
    lastOrderDate: { type: Date },
    firstOrderDate: { type: Date },
    averageOrderValue: { type: Number, default: 0 },
    favouriteProduct: { type: String },
    favouriteCategory: { type: String },
    tags: {
      type: [String],
      default: [],
    },
    channelPreference: {
      type: String,
      enum: ['whatsapp', 'sms', 'email'],
      default: 'whatsapp',
    },
    engagementScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    lastChannelInteraction: {
      type: lastChannelInteractionSchema,
      default: () => ({}),
    },
  },
  {
    timestamps: true,
  }
);

// Text index for search functionality
customerSchema.index({ name: 'text', email: 'text', phone: 'text' });
customerSchema.index({ city: 1 });
customerSchema.index({ tags: 1 });
customerSchema.index({ totalSpend: 1 });
customerSchema.index({ engagementScore: 1 });

const Customer = mongoose.model<ICustomer>('Customer', customerSchema);

export default Customer;
