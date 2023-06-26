import { Post } from '../entities/Post';
import { Query, Resolver, Ctx, Arg, Mutation } from 'type-graphql';
import { MyContext } from 'src/types';
import { SubReddit } from '../entities/SubReddit';
import { RequiredEntityData } from '@mikro-orm/core';
import { PostInput, PostResponse } from './inputTypes';
@Resolver()
export class PostResolver {
  @Query(() => [Post])
  posts(@Ctx() { em }: MyContext): Promise<Post[]> {
    return em.find(Post, {});
  }

  @Query(() => Post, { nullable: true })
  post(@Arg('id') id: string, @Ctx() { em }: MyContext): Promise<Post | null> {
    return em.findOne(Post, { id });
  }

  @Mutation(() => PostResponse)
  async createPost(@Arg('input') input: PostInput, @Ctx() { req, em }: MyContext): Promise<PostResponse> {
    const reqSubReddit = await em.findOne(SubReddit, { id: input.subReddit });
    if (!reqSubReddit) {
      return {
        errors: [
          {
            field: 'subReddit',
            message: 'Attached SubReddit does not exist',
          },
        ],
      };
    }

    const post = em.create(Post, { ...input, creator: req.session.userId, subReddit: reqSubReddit.id } as RequiredEntityData<Post>);
    await em.persistAndFlush(post);
    return {
      post,
    };
  }

  @Mutation(() => Post, { nullable: true })
  async updatePost(@Arg('id') id: string, @Arg('title') updateInput: PostInput, @Ctx() { em }: MyContext): Promise<Post | null> {
    const post = await em.findOne(Post, { id });
    if (!post) {
      return null;
    }
    post.text = updateInput.text ?? post.text;
    post.title = updateInput.title ?? post.title;
    await em.persistAndFlush(post);
    return post;
  }

  @Mutation(() => Boolean)
  async deletePost(@Arg('id') id: string, @Ctx() { em }: MyContext): Promise<boolean> {
    await em.nativeDelete(Post, { id });
    return true;
  }
}
