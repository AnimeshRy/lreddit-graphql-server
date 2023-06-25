import { MikroORM } from '@mikro-orm/core';
import express from 'express';
import microOrmConfig from './mikro-orm.config';
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/Post';
import { UserResolver } from './resolvers/User';
import Redis from 'ioredis';
import session from 'express-session';
import { COOKIE_NAME, __prod__ } from './constants';
import { MyContext } from './types';
import cors from 'cors';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';
import RedisStore from 'connect-redis';

const main = async () => {
  const orm = await MikroORM.init<PostgreSqlDriver>(microOrmConfig);
  await orm.getMigrator().up();

  const app = express();
  const redis = new Redis('redis://127.0.0.1:6379');

  const redisStore = new RedisStore({
    client: redis,
    disableTouch: true,
  });

  app.set('trust proxy', 1);

  // Apply Cors to All Routes
  app.use(
    cors({
      origin: 'https://studio.apollographql.com',
      credentials: true,
    }),
  );

  app.use(
    session({
      name: COOKIE_NAME,
      store: redisStore,
      cookie: {
        maxAge: 1000 * 60 * 60 * 24 * 30, // 30 days in ms
        httpOnly: true,
        sameSite: __prod__ ? 'lax' : 'none', //csrf
        secure: true, // cookie only works in https
      },
      saveUninitialized: false,
      secret: 'asdasdasdasdasdasdasd',
      resave: false,
    }),
  );

  const apolloServer = new ApolloServer({
    schema: await buildSchema({
      resolvers: [HelloResolver, PostResolver, UserResolver],
      //   authChecker: ({ context: { req } }) => {
      //     return !!req.session.userId;
      //   },
      validate: false, // turn off class validation
    }),
    context: ({ req, res }): MyContext => ({ em: orm.em, req, res, redis }),
  });
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, cors: false });

  app.listen(4000, () => {
    console.log('server started on http://localhost:4000');
  });
};

main().catch(err => {
  console.error(err);
});
