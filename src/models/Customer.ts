import { Schema, model } from 'mongoose';
import { ICustomer } from '../interfaces';

const customerSchema = new Schema<ICustomer>({
  _id: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  age: {
    type: Number
  },
  location: {
    type: String
  },
  gender: {
    type: String
  }
}, { timestamps: true });

export default model<ICustomer>('Customer', customerSchema); 