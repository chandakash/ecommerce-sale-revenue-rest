import { Customer, Product, Order } from '../models';
import { CustomerSpending, TopProduct, SalesAnalytics, CategoryRevenue, IOrderProduct } from '../interfaces';
import { v4 as uuidv4 } from 'uuid';

const resolvers = {
  Query: {
    getCustomerSpending: async (_: any, { customerId }: { customerId: string }): Promise<CustomerSpending | null> => {
      const result = await Order.aggregate([
        { $match: { customerId: customerId } },
        {
          $group: {
            _id: '$customerId',
            totalSpent: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 },
            lastOrderDate: { $max: '$orderDate' }
          }
        },
        {
          $project: {
            customerId: '$_id',
            totalSpent: 1,
            averageOrderValue: { $divide: ['$totalSpent', '$orderCount'] },
            lastOrderDate: 1,
            _id: 0
          }
        }
      ]);

      if (result.length === 0) {
        return null;
      }

      return {
        customerId,
        totalSpent: result[0].totalSpent,
        averageOrderValue: result[0].averageOrderValue,
        lastOrderDate: result[0].lastOrderDate.toISOString()
      };
    },
    
    getTopSellingProducts: async (_: any, { limit }: { limit: number }): Promise<TopProduct[]> => {
      const result = await Order.aggregate([
        // { $match: { status: { $ne: 'cancelled' } } },
        { $unwind: '$products' },
        {
          $group: {
            _id: '$products.productId',
            totalSold: { $sum: '$products.quantity' }
          }
        },
        { $sort: { totalSold: -1 } },
        { $limit: limit },
        {
          $lookup: {
            from: 'products',
            localField: '_id',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        { $unwind: '$productDetails' },
        {
          $project: {
            productId: '$_id',
            name: '$productDetails.name',
            totalSold: 1,
            _id: 0
          }
        }
      ]);

      return result as unknown as TopProduct[];
    },

    getSalesAnalytics: async (_: any, { startDate, endDate }: { startDate: string, endDate: string }): Promise<SalesAnalytics> => {
      const start = new Date(startDate);
      const end = new Date(endDate);

      const revenueResult = await Order.aggregate([
        {
          $match: {
            orderDate: { $gte: start, $lte: end },
          }
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$totalAmount' },
            completedOrders: {
              $sum: {
                $cond: [{ $eq: ['$status', 'completed'] }, 1, 0]
              }
            }
          }
        }
      ]);

      const categoryBreakdown = await Order.aggregate([
        {
          $match: {
            orderDate: { $gte: start, $lte: end },
          }
        },
        { $unwind: '$products' },
        {
          $lookup: {
            from: 'products',
            localField: 'products.productId',
            foreignField: '_id',
            as: 'productDetails'
          }
        },
        { $unwind: '$productDetails' },
        {
          $project: {
            category: '$productDetails.category',
            productRevenue: { $multiply: ['$products.quantity', '$products.priceAtPurchase'] }
          }
        },
        {
          $group: {
            _id: '$category',
            revenue: { $sum: '$productRevenue' }
          }
        },
        {
          $project: {
            category: '$_id',
            revenue: 1,
            _id: 0
          }
        }
      ]);

      const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
      const completedOrders = revenueResult.length > 0 ? revenueResult[0].completedOrders : 0;

      return {
        totalRevenue,
        completedOrders,
        categoryBreakdown: categoryBreakdown as CategoryRevenue[]
      };
    },

    getCustomer: async (_: any, { id }: { id: string }) => {
      return await Customer.findById(id);
    },
    
    getAllCustomers: async () => {
      return await Customer.find();
    },

    getProduct: async (_: any, { id }: { id: string }) => {
      return await Product.findById(id);
    },
    
    getAllProducts: async () => {
      return await Product.find();
    },

    getOrder: async (_: any, { id }: { id: string }) => {
      return await Order.findById(id);
    },
    
    getAllOrders: async () => {
      return await Order.find();
    },
    
    getCustomerOrders: async (_: any, { customerId }: { customerId: string }) => {
      return await Order.find({ customerId });
    },
    
  },

  Mutation: {
    placeOrder: async (_: any, { customerId, products }: { customerId: string, products: { productId: string, quantity: number }[] }) => {
      const customer = await Customer.findById(customerId);
      if (!customer) {
        throw new Error('Customer not found');
      }

      let totalAmount = 0;
      const orderProducts: IOrderProduct[] = [];

      for (const item of products) {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product with ID ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }
        orderProducts.push({
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: product.price
        });
        totalAmount += product.price * item.quantity;
        await Product.findByIdAndUpdate(item.productId, {
          $inc: { stock: -item.quantity }
        });
      }

      const newOrder = new Order({
        _id: uuidv4(),
        customerId,
        products: orderProducts,
        totalAmount,
        orderDate: new Date(),
        status: 'pending'
      });

      return await newOrder.save();
    },

    updateOrderStatus: async (_: any, { orderId, status }: { orderId: string, status: string }) => {
      if (!['pending', 'processing', 'completed', 'cancelled'].includes(status)) {
        throw new Error('Invalid order status');
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      );

      if (!updatedOrder) {
        throw new Error('Order not found');
      }

      return updatedOrder;
    }
  }
};

export default resolvers; 