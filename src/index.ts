import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import dotenv from 'dotenv';
import { typeDefs, resolvers } from './graphql';
import connectDB from './config/db';
dotenv.config();

async function startServer() {
  try {
    await connectDB();
    const app = express();
    app.use(cors());
    app.use(express.json());
    
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: ({ req }) => ({ req }),
      introspection: process.env.NODE_ENV !== 'production',
    });
    await server.start();
    server.applyMiddleware({ app: app as any });
    
    const PORT = process.env.PORT || 4000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`GraphQL endpoint: http://localhost:${PORT}${server.graphqlPath}`);
    });

  } catch (err) {
    console.error('Error starting server:', err);
    process.exit(1);
  }
}

startServer();