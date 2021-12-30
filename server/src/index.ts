import 'reflect-metadata';
import express from 'express';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { UserResolver } from './resolvers/UserResolver';
import { createConnection } from 'typeorm';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { verify } from 'jsonwebtoken';
import { User } from './entity/User';
import { generateRefreshToken, genrateAccessToken } from './auth';
import { sendRefreshToken } from './sendRefreshToken';
import cors from 'cors';
import { TodoResolver } from './resolvers/TodoResolver';

(async () => {
  const app = express();

  app.use(cookieParser());

  app.use(
    cors({
      origin: 'http://localhost:3000',
      credentials: true,
    }),
  );

  dotenv.config();

  app.get('/', (_, res) => res.send('Hello world'));

  app.post('/refreshToken', async (req, res) => {
    const token = req.cookies.cid;

    if (!token) {
      res.send({ ok: false, accessToken: '' });
    }
    let payload = null;
    try {
      payload = verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (error) {
      console.log(error);
      return res.send({ ok: false, accessToken: '' });
    }

    const user = await User.findOne({ id: payload.userId });

    if (user.tokenVersion !== payload.tokenVersion) {
      return res.send({ ok: false, accessToken: '' });
    }

    sendRefreshToken(res, generateRefreshToken(user));

    return res.send({ ok: true, accessToken: genrateAccessToken(user) });
  });

  await createConnection();

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [UserResolver, TodoResolver],
    }),
    context: ({ req, res }) => ({ req, res }),
  });

  await apolloServer.start();

  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => console.log('Serve is runnin on port 4000'));
})();
