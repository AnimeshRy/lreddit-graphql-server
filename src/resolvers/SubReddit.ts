import { Post } from '../entities/Post';
import { Query, Resolver, Ctx, Arg, Mutation } from 'type-graphql';
import { MyContext } from 'src/types';
import { RequiredEntityData } from '@mikro-orm/core';
import { SubRedditCreateInput, SubRedditUpdateInput } from './inputTypes';
import { SubReddit } from '../entities/SubReddit';

@Resolver()
export class SubRedditResolver {
  @Query(() => [Post])
  subreddits(@Ctx() { em }: MyContext): Promise<SubReddit[]> {
    return em.find(SubReddit, {});
  }

  @Query(() => SubReddit, { nullable: true })
  subreddit(@Arg('id') id: string, @Ctx() { em }: MyContext): Promise<SubReddit | null> {
    return em.findOne(SubReddit, { id });
  }

  @Mutation(() => SubReddit)
  async createSubReddit(@Arg('input') input: SubRedditCreateInput, @Ctx() { req, em }: MyContext): Promise<SubReddit> {
    const subReddit = em.create(SubReddit, { ...input, creator: req.session.userId } as RequiredEntityData<SubReddit>);
    await em.persistAndFlush(subReddit);
    return subReddit;
  }

  @Mutation(() => SubReddit, { nullable: true })
  async updatePost(@Arg('id') id: string, @Arg('title') updateInput: SubRedditUpdateInput, @Ctx() { em }: MyContext): Promise<SubReddit | null> {
    const subReddit = await em.findOne(SubReddit, { id });
    if (!subReddit) {
      return null;
    }
    subReddit.text = updateInput.text ?? subReddit.text;
    await em.persistAndFlush(subReddit);
    return subReddit;
  }

  //   @Mutation(() => Boolean)
  //   async deleteSubReddit(@Arg('id') id: string, @Ctx() { em }: MyContext): Promise<boolean> {
  //     await em.nativeDelete(Post, { id });
  //     return true;
  //   }
}
