import { MikroORM } from '@mikro-orm/core'
import { __prod__ } from './constants'
import { Post } from './entities/Post'
import microOrmConfig from './mikro-orm.config'

const main = async () => {
    const orm = await MikroORM.init(microOrmConfig);
    await orm.getMigrator().up()
    // const post = orm.em.create(Post, { title: 'ez az első' } as any)
    // await orm.em.persistAndFlush(post)

    // const posts = await orm.em.find(Post, {});
    // console.table(posts);
}

main().catch((err) => {
    console.error(err)
})


