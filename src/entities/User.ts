import { Collection, Entity, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { Post } from './Post';
import { SubReddit } from './SubReddit';
import { v4 } from 'uuid';
import { SubScription } from './Subscription';

@ObjectType() // converting existing class to graphql schema
@Entity()
export class User {
  @Field(() => String)
  @PrimaryKey()
  id: string = v4();

  @Field()
  @Property({ type: 'text', unique: true })
  username!: string;

  @Field()
  @Property({ type: 'text', unique: true })
  email!: string;

  @Property({ type: 'text' })
  password!: string;

  @OneToMany({ entity: () => Post, mappedBy: 'creator' })
  posts = new Collection<Post>(this);

  @Field(() => [SubReddit], { nullable: true })
  @OneToMany({ entity: () => SubReddit, mappedBy: 'creator' })
  createdSubreddits = new Collection<SubReddit>(this);

  @Field(() => [SubScription], { nullable: true })
  @OneToMany({ entity: () => SubScription, mappedBy: 'user' })
  subscriptions = new Collection<SubScription>(this);

  @Field(() => String)
  @Property({ type: 'date' })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();
}
