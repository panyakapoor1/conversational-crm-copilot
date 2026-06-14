import mongoose, { Schema, Document, Types } from 'mongoose';

/**
 * Individual line item in an order — maps to a product
 * from the Keventers catalog with quantity.
 */
export interface IOrderProduct {
  name: string;
  category: string;
  price: number;
  quantity: number;
}

/**
 * A completed order placed by a customer.
 * Links back to the customer who placed it and stores
 * product-level detail for analytics.
 */
export interface IOrder extends Document {
  _id: Types.ObjectId;
  customerId: Types.ObjectId;
  products: IOrderProduct[];
  totalAmount: number;
  orderDate: Date;
  city?: string;
  createdAt: Date;
  updatedAt: Date;
}

const orderProductSchema = new Schema<IOrderProduct>(
  {
    name: { type: String, required: true },
    category: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    customerId: {
      type: Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Customer ID is required'],
    },
    products: {
      type: [orderProductSchema],
      required: true,
      validate: {
        validator: (v: IOrderProduct[]) => v.length > 0,
        message: 'Order must contain at least one product',
      },
    },
    totalAmount: {
      type: Number,
      required: [true, 'Total amount is required'],
      min: 0,
    },
    orderDate: {
      type: Date,
      required: [true, 'Order date is required'],
    },
    city: { type: String },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient querying
orderSchema.index({ customerId: 1, orderDate: -1 });
orderSchema.index({ orderDate: -1 });

const Order = mongoose.model<IOrder>('Order', orderSchema);

export default Order;
