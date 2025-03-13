import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Customer, Product, Order } from '../models';
import { IOrderProduct } from '../interfaces';

dotenv.config();
const connectDB = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
    await mongoose.connect(mongoURI);

    console.log('MongoDB Connected...');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    if (err instanceof Error) {
      console.error('Error details:', {
        name: err.name,
        message: err.message,
        stack: err.stack
      });
    }
    process.exit(1);
  }
};

const parseCSV = async (filePath: string): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const results: any[] = [];

    fs.createReadStream(filePath)
      .pipe(parse({ columns: true, trim: true }))
      .on('data', (data: any) => results.push(data))
      .on('error', (error: Error) => reject(error))
      .on('end', () => resolve(results));
  });
};

const importCustomers = async (filePath: string): Promise<void> => {
  try {
    const customers = await parseCSV(filePath);
    await Customer.deleteMany({});
    const customerData = customers.map(customer => ({
      _id: customer._id,
      name: customer.name,
      email: customer.email,
      age: parseInt(customer.age, 10) || undefined,
      location: customer.location,
      gender: customer.gender
    }));

    await Customer.insertMany(customerData);
    console.log(`${customerData.length} customers imported successfully`);
  } catch (error) {
    console.error('Error importing customers:', error);
    process.exit(1);
  }
};

const importProducts = async (filePath: string): Promise<void> => {
  try {
    const products = await parseCSV(filePath);
    await Product.deleteMany({});
    const productData = products.map(product => ({
      _id: product._id,
      name: product.name,
      category: product.category,
      price: parseFloat(product.price),
      stock: parseInt(product.stock, 10)
    }));

    await Product.insertMany(productData);

    console.log(`${productData.length} products imported successfully`);
  } catch (error) {
    console.error('Error importing products:', error);
    process.exit(1);
  }
};

const importOrders = async (filePath: string): Promise<void> => {
  try {
    const orders = await parseCSV(filePath);
    await Order.deleteMany({});
    const orderData = orders.map(order => {
      let products: IOrderProduct[] = [];
      try {
        const productsString = order.products.replace(/'/g, '"');
        const parsedProducts = JSON.parse(productsString);

        products = parsedProducts.map((product: any) => ({
          productId: product.productId,
          quantity: parseInt(product.quantity, 10),
          priceAtPurchase: parseFloat(product.priceAtPurchase)
        }));
      } catch (e) {
        console.error('Error parsing products for order:', order._id, e);
      }
      let status = order.status;
      if (status === 'canceled') {
        status = 'cancelled';
      }

      return {
        _id: order._id,
        customerId: order.customerId,
        products,
        totalAmount: parseFloat(order.totalAmount),
        orderDate: new Date(order.orderDate),
        status
      };
    });
    await Order.insertMany(orderData);
    console.log(`${orderData.length} orders imported successfully`);
  } catch (error) {
    console.error('Error importing orders:', error);
    process.exit(1);
  }
};

const importData = async (): Promise<void> => {
  try {
    await connectDB();
    const dataDir = path.join(__dirname, '../../data');
    const customersFile = path.join(dataDir, 'customers.csv');
    const productsFile = path.join(dataDir, 'products.csv');
    const ordersFile = path.join(dataDir, 'orders.csv');
    if (!fs.existsSync(dataDir)) {
      console.error('Data directory not found.');
      process.exit(1);
    }

    await importCustomers(customersFile);
    await importProducts(productsFile);
    await importOrders(ordersFile);

    console.log('All data imported successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error importing data:', error);
    process.exit(1);
  }
};

importData(); 