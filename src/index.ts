import { MikroORM } from '@mikro-orm/core'
import express from 'express';
import microOrmConfig from './mikro-orm.config'
import { ApolloServer } from 'apollo-server-express';
import { buildSchema } from 'type-graphql';
import { HelloResolver } from './resolvers/hello';
import { PostResolver } from './resolvers/Post';

const main = async () => {
    const orm = await MikroORM.init(microOrmConfig);
    await orm.getMigrator().up()

    const app = express();

    const apolloServer = new ApolloServer({
        schema: await buildSchema({
            resolvers: [HelloResolver, PostResolver],
            validate: false // turn off class validation
        }),
        context: () => ({ em: orm.em })
    })

    apolloServer.applyMiddleware({ app })


    app.listen(4000, () => {
        console.log('server started on localhost:4000')
    })
};

main().catch((err) => {
    console.error(err)
})


