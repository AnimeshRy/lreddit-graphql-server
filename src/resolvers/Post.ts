import { Post } from '../entities/Post';
import { Query, Resolver, Ctx, Arg, Mutation, UseMiddleware } from 'type-graphql';
import { MyContext } from 'src/types';
import { SubReddit } from '../entities/SubReddit';
import { RequiredEntityData } from '@mikro-orm/core';
import { PostInput, PostResponse } from './inputTypes';
import { isAuth } from '../middlewares/isAuth';
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

  @UseMiddleware(isAuth)
  @Mutation(() => PostResponse)
  async createPost(@Arg('input') input: PostInput, @Ctx() { req, em }: MyContext): Promise<PostResponse> {
    const reqSubReddit = await em.findOne(SubReddit, { id: input.subReddit });
    if (!reqSubReddit) {
      return {
        success: false,
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
      success: true,
      post,
    };
  }

  @UseMiddleware(isAuth)
  @Mutation(() => PostResponse, { nullable: true })
  async updatePost(@Arg('id') id: string, @Arg('title') updateInput: PostInput, @Ctx() { em, req }: MyContext): Promise<PostResponse> {
    const post = await em.findOne(Post, { id });
    if (!post) {
      return {
        success: false,
        errors: [
          {
            field: 'id',
            message: 'Post with given id doesn not exist',
          },
        ],
      };
    }
    if (post.creator.id !== req.session.userId) {
      return {
        success: false,
        errors: [
          {
            field: 'id',
            message: 'Not authorized to update this post',
          },
        ],
      };
    }
    post.text = updateInput.text ?? post.text;
    post.title = updateInput.title ?? post.title;
    await em.persistAndFlush(post);
    return { post, success: true };
  }

  @UseMiddleware(isAuth)
  @Mutation(() => PostResponse, { nullable: true })
  async deletePost(@Arg('id') id: string, @Ctx() { em, req }: MyContext): Promise<PostResponse> {
    const post = await em.findOne(Post, { id });
    if (post && post.creator.id !== req.session.userId) {
      return {
        success: false,
        errors: [
          {
            field: 'id',
            message: 'Not authorized to delete this post',
          },
        ],
      };
    }
    post !== null && (await em.removeAndFlush(post));
    return {
      success: true,
    };
  }
}
