import { Entity, ManyToOne, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { User } from './User';
import { Comment } from './Comment';

enum VoteType {
  UP = 'UP',
  DOWN = 'DOWN',
}

@ObjectType() // converting existing class to graphql schema
@Entity()
export class CommentVote {
  @Field(() => String)
  @ManyToOne({ entity: () => User, primary: true })
  user!: User;

  @Field(() => String)
  @ManyToOne({ entity: () => Comment, primary: true })
  comment!: Comment;

  @Property({ type: 'string' })
  type!: VoteType;
}
