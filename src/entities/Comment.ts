import { Collection, Entity, ManyToOne, OneToMany, PrimaryKey, Property } from '@mikro-orm/core';
import { Field, ObjectType } from 'type-graphql';
import { User } from './User';
import { v4 } from 'uuid';
import { Post } from './Post';
import { CommentVote } from './CommentVote';

@ObjectType() // converting existing class to graphql schema
@Entity()
export class Comment {
  @Field(() => String)
  @PrimaryKey()
  id: string = v4();

  @Field()
  @Property({ type: 'text' })
  text!: string;

  @ManyToOne({ entity: () => User })
  author!: User;

  @ManyToOne({ entity: () => Post, onDelete: 'cascade' })
  post!: Post;

  @ManyToOne({ entity: () => Comment, nullable: true, onDelete: 'no action', onUpdateIntegrity: 'no action' })
  replyTo?: Comment;

  @OneToMany(() => Comment, comment => comment.replyTo)
  replies = new Collection<Comment>(this);

  @OneToMany(() => CommentVote, vote => vote.comment)
  votes = new Collection<CommentVote>(this);

  @Field(() => String)
  @Property({ type: 'date' })
  createdAt = new Date();

  @Field(() => String)
  @Property({ type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();
}
