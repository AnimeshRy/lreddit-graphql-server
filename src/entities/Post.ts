import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { User } from './User';
import { v4 } from 'uuid';
import { SubReddit } from './SubReddit';
@ObjectType() // converting existing class to graphql schema
@Entity()
export class Post {
  @Field(() => String)
  @PrimaryKey()
  id: string = v4();

  @Field()
  @Property({ type: 'text' })
  title!: string;

  @Field()
  @Property({ type: 'text' })
  text!: string;

  @ManyToOne({ entity: () => User })
  creator!: User;

  @ManyToOne({ entity: () => SubReddit })
  subReddit!: SubReddit;

  @Field()
  @Property({ type: 'int', default: 0 })
  points!: number;

  @Field(() => String)
  @Property({ type: 'date' })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();
}
