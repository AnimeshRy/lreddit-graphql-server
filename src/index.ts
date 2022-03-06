import { MikroORM } from '@mikro-orm/core'
import express from 'express';
import microOrmConfig from './mikro-orm.config'
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/Post';
import { UserResolver } from './resolvers/User';
import Redis from "ioredis";
import session from 'express-session';
import connectRedis from 'connect-redis';
import { __prod__ } from './constants';
import { MyContext } from './types';
import cors from "cors";


const main = async () => {
    const orm = await MikroORM.init(microOrmConfig);
    await orm.getMigrator().up()

    const app = express();
    const RedisStore = connectRedis(session)
    const redis = new Redis('redis://127.0.0.1:6379');

    app.set("trust proxy", 1);

    // Apply Cors to All Routes
    app.use(cors({
        origin: 'http://localhost:3000',
        credentials: true
    }))

    app.use(
        session({
            name: 'qid',
            store: new RedisStore({
                client: redis,
                disableTouch: true
            }),
            cookie: {
                maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years
                httpOnly: true,
                sameSite: 'lax', //csrf
                secure: __prod__ // cookie only works in https
            },
            saveUninitialized: false,
            secret: "asdasdasdasdasdasdasd",
            resave: false,
        })
    )

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver, UserResolver],
            validate: false // turn off class validation
        }),
        context: ({ req, res, }): MyContext => ({ em: orm.em, req, res }),
    })
    apolloServer.applyMiddleware({ app, cors: false })


    app.listen(4000, () => {
        console.log('server started on localhost:4000')
    })
};

main().catch((err) => {
    console.error(err)
})


