import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { User } from './User';
import { SubReddit } from './SubReddit';

@ObjectType() // converting existing class to graphql schema
@Entity()
export class SubScription {
  @Field(() => String)
  @ManyToOne({ entity: () => User, primary: true })
  user!: User;

  @Field(() => String)
  @ManyToOne({ entity: () => SubReddit, primary: true })
  subReddit!: SubReddit;

  @Field(() => String)
  @Property({ type: 'date' })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();
}
