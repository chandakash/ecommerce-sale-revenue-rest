export interface ICustomer {
  _id: string;
  name: string;
  email: string;
  age?: number;
  location?: string;
  gender?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IProduct {
  _id: string;
  name: string;
  category: string;
  price: number;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IOrderProduct {
  productId: string;
  quantity: number;
  priceAtPurchase: number;
}

export interface IOrder {
  _id: string;
  customerId: string;
  products: IOrderProduct[];
  totalAmount: number;
  orderDate: Date;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerSpending {
  customerId: string;
  totalSpent: number;
  averageOrderValue: number;
  lastOrderDate: string;
}

export interface TopProduct {
  productId: string;
  name: string;
  totalSold: number;
}

export interface CategoryRevenue {
  category: string;
  revenue: number;
}

export interface SalesAnalytics {
  totalRevenue: number;
  completedOrders: number;
  categoryBreakdown: CategoryRevenue[];
} 