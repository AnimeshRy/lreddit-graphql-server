import { Entity, ManyToOne, PrimaryKey, Property, OneToMany, Collection, Cascade } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { Post } from './Post';
import { User } from './User';
import { v4 } from 'uuid';

@ObjectType()
@Entity()
export class SubReddit {
  @Field(() => String)
  @PrimaryKey()
  id: string = v4();

  @Field(() => String, { nullable: false, description: 'SubReddit name MaxLength > 30' })
  @Property({ type: 'text', unique: true, length: 30 })
  name!: string;

  @Field()
  @Property({ type: 'text' })
  text!: string;

  @ManyToOne({ entity: () => User })
  creator: User;

  @OneToMany({ entity: () => Post, mappedBy: 'subReddit', cascade: [Cascade.REMOVE] })
  posts = new Collection<Post>(this);

  @Field(() => String)
  @Property({ type: 'date' })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();
}
