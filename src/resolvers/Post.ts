import { Post } from '../entities/Post';
import { Query, Resolver, Ctx, Arg, Mutation, Field, InputType } from 'type-graphql';
import { MyContext } from 'src/types';
import { RequiredEntityData } from '@mikro-orm/core';

@InputType()
class PostInput {
  @Field()
  title: string;
  @Field()
  text: string;
}

@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id') id: number, @Ctx() { em }: MyContext): Promise<Post | null> {
    return em.findOne(Post, { id });
  }

  @Mutation(() => Post)
  async createPost(@Arg('input') input: PostInput, @Ctx() { req, em }: MyContext): Promise<Post> {
    const post = em.create(Post, { ...input, creator: req.session.userId } as RequiredEntityData<Post>);
    await em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(@Arg('id') id: number, @Arg('title') title: string, @Arg('text') text: string, @Ctx() { em }: MyContext): Promise<Post | null> {
    const post = await em.findOne(Post, { id });
    if (!post) {
      return null;
    }
    if (typeof title !== 'undefined') {
      post.text = text;
      post.title = title;
      await em.persistAndFlush(post);
    }
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: number, @Ctx() { em }: MyContext): Promise<boolean> {
    await em.nativeDelete(Post, { id });
    return true;
  }
}
