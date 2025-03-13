import { gql } from 'apollo-server-express';

const typeDefs = gql`
  type Customer {
    _id: ID!
    name: String!
    email: String!
    age: Int
    location: String
    gender: String
    createdAt: String
    updatedAt: String
  }

  type Product {
    _id: ID!
    name: String!
    category: String!
    price: Float!
    stock: Int!
    createdAt: String
    updatedAt: String
  }

  type OrderProduct {
    productId: ID!
    quantity: Int!
    priceAtPurchase: Float!
  }

  type Order {
    _id: ID!
    customerId: ID!
    products: [OrderProduct!]!
    totalAmount: Float!
    orderDate: String!
    status: String!
    createdAt: String
    updatedAt: String
  }

  type CustomerSpending {
    customerId: ID!
    totalSpent: Float!
    averageOrderValue: Float!
    lastOrderDate: String!
  }

  type TopProduct {
    productId: ID!
    name: String!
    totalSold: Int!
  }

  type CategoryRevenue {
    category: String!
    revenue: Float!
  }

  type SalesAnalytics {
    totalRevenue: Float!
    completedOrders: Int!
    categoryBreakdown: [CategoryRevenue!]!
  }

  type Query {
    getCustomer(id: ID!): Customer
    getAllCustomers: [Customer!]!
    getCustomerSpending(customerId: ID!): CustomerSpending

    getProduct(id: ID!): Product
    getAllProducts: [Product!]!
    getTopSellingProducts(limit: Int!): [TopProduct!]!

    getOrder(id: ID!): Order
    getAllOrders: [Order!]!
    getCustomerOrders(customerId: ID!): [Order!]!
    getSalesAnalytics(startDate: String!, endDate: String!): SalesAnalytics
  }

  input OrderProductInput {
    productId: ID!
    quantity: Int!
  }

  type Mutation {
    placeOrder(customerId: ID!, products: [OrderProductInput!]!): Order
    updateOrderStatus(orderId: ID!, status: String!): Order
  }
`;

export default typeDefs; 