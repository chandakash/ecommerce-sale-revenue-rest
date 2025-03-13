import { Schema, model } from 'mongoose';
import { IOrder, IOrderProduct } from '../interfaces';

const orderProductSchema = new Schema<IOrderProduct>({
  productId: {
    type: String,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  priceAtPurchase: {
    type: Number,
    required: true
  }
}, { _id: false });

const orderSchema = new Schema<IOrder>({
  _id: {
    type: String,
    required: true
  },
  customerId: {
    type: String,
    ref: 'Customer',
    required: true
  },
  products: {
    type: [orderProductSchema],
    required: true,
  },
  totalAmount: {
    type: Number,
    required: true
  },
  orderDate: {
    type: Date,
    required: true,
    default: Date.now
  },
  status: {
    type: String,
    required: true,
    enum: ['pending', 'processing', 'completed', 'cancelled'],
    default: 'pending'
  }
}, { timestamps: true });

orderSchema.index({ customerId: 1 });  
orderSchema.index({ orderDate: 1 });     
orderSchema.index({ status: 1 });         
orderSchema.index({ 'products.productId': 1 }); 

export default model<IOrder>('Order', orderSchema); 