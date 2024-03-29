import { __prod__ } from './constants';
import { Post } from './entities/Post';
import { Options } from '@mikro-orm/core';
import path from 'path';
import { User } from './entities/User';
import { PostgreSqlDriver } from '@mikro-orm/postgresql';

const config: Options<PostgreSqlDriver> = {
  migrations: {
    path: path.join(__dirname, './migrations'),
    glob: '!(*.d).{js,ts}', // all js and ts files but no .d files
  },
  entities: [Post, User],
  dbName: 'lreddit',
  user: 'animesh',
  password: 'postgres',
  type: 'postgresql',
  debug: !__prod__,
  allowGlobalContext: true,
};

export default config;
