import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { User } from './User';
import { Post } from './Post';

enum VoteType {
  UP = 'UP',
  DOWN = 'DOWN',
}

@ObjectType() // converting existing class to graphql schema
@Entity()
export class Vote {
  @Field(() => String)
  @ManyToOne({ entity: () => User, primary: true })
  user!: User;

  @Field(() => String)
  @ManyToOne({ entity: () => Post, primary: true })
  post!: Post;

  @Property({ type: 'string' })
  type!: VoteType;
}
