import { Schema, model } from 'mongoose';
import { IProduct } from '../interfaces';

const productSchema = new Schema<IProduct>({
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  stock: {
    type: Number,
    required: true,
    default: 0
  }
}, { timestamps: true });

productSchema.index({ category: 1 });

export default model<IProduct>('Product', productSchema); 