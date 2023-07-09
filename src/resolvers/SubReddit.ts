import { Query, Resolver, Ctx, Arg, Mutation, UseMiddleware } from 'type-graphql';
import { MyContext } from 'src/types';
import { RequiredEntityData } from '@mikro-orm/core';
import { SubRedditCreateInput, SubRedditResponse, SubRedditUpdateInput } from './inputTypes';
import { SubReddit } from '../entities/SubReddit';
import { isAuth } from '../middlewares/isAuth';
import { SubScription } from '../entities/Subscription';

@Resolver()
export class SubRedditResolver {
  @Query(() => [SubReddit])
  subreddits(@Ctx() { em }: MyContext): Promise<SubReddit[]> {
    return em.find(SubReddit, {}, { populate: ['subscribers'] });
  }

  @Query(() => SubReddit, { nullable: true })
  subreddit(@Arg('id') id: string, @Ctx() { em }: MyContext): Promise<SubReddit | null> {
    return em.findOne(SubReddit, { id }, { populate: ['posts', 'subscribers'] });
  }

  @UseMiddleware(isAuth)
  @Mutation(() => SubRedditResponse)
  async createSubReddit(@Arg('input') input: SubRedditCreateInput, @Ctx() { req, em }: MyContext): Promise<SubRedditResponse> {
    const existingSubReddit = await em.findOne(SubReddit, { name: input.name });
    if (existingSubReddit) {
      return {
        success: false,
        errors: [
          {
            field: 'name',
            message: 'SubReddit with existing name already exists',
          },
        ],
      };
    }
    const subReddit = em.create(SubReddit, { ...input, creator: req.session.userId } as RequiredEntityData<SubReddit>);
    await em.persistAndFlush(subReddit);
    return { subReddit, success: true };
  }

  @UseMiddleware(isAuth)
  @Mutation(() => SubRedditResponse, { nullable: true })
  async updateSubReddit(@Arg('id') id: string, @Arg('title') updateInput: SubRedditUpdateInput, @Ctx() { em, req }: MyContext): Promise<SubRedditResponse> {
    const subReddit = await em.findOne(SubReddit, { id });
    if (!subReddit) {
      return {
        success: false,
        errors: [
          {
            field: 'id',
            message: 'SubReddit with given id doesn not exist',
          },
        ],
      };
    }

    if (subReddit.creator.id !== req.session.userId) {
      return {
        success: false,
        errors: [
          {
            field: 'id',
            message: 'Not authorized to update this SubReddit',
          },
        ],
      };
    }

    subReddit.text = updateInput.text ?? subReddit.text;
    await em.persistAndFlush(subReddit);
    return { subReddit, success: true };
  }

  @UseMiddleware(isAuth)
  @Mutation(() => SubRedditResponse)
  async deleteSubReddit(@Arg('id') id: string, @Ctx() { em, req }: MyContext): Promise<SubRedditResponse> {
    // TODO - Add Role Check, Only SuperAdmin can delete a subreddit
    const subReddit = await em.findOne(SubReddit, { id });
    if (subReddit && subReddit.creator.id !== req.session.userId) {
      return {
        success: false,
        errors: [
          {
            field: 'id',
            message: 'Not authorized to delete this subReddit',
          },
        ],
      };
    }
    subReddit !== null && (await em.removeAndFlush(subReddit));
    return {
      success: true,
    };
  }

  @UseMiddleware(isAuth)
  @Mutation(() => SubRedditResponse)
  async subscribeSubReddit(@Arg('id') id: string, @Ctx() { em, req }: MyContext): Promise<SubRedditResponse> {
    const subReddit = await em.findOne(SubReddit, { id });
    if (!subReddit) {
      return {
        success: false,
        errors: [
          {
            field: 'id',
            message: 'SubReddit does not exist',
          },
        ],
      };
    }
    const existingSubScription = await em.findOne(SubScription, { user: req.session.userId, subReddit: id });
    if (existingSubScription) {
      return {
        success: false,
        subReddit: subReddit,
        errors: [
          {
            field: 'id',
            message: 'Already subscribed to this SubReddit',
          },
        ],
      };
    }
    const subScription = await em.create(SubScription, {
      user: req.session.userId,
      subReddit: id,
    } as RequiredEntityData<SubScription>);
    await em.persistAndFlush(subScription);
    return {
      success: true,
      subReddit: subReddit,
    };
  }

  @UseMiddleware(isAuth)
  @Mutation(() => SubRedditResponse)
  async unsubscribeSubReddit(@Arg('id') id: string, @Ctx() { em, req }: MyContext): Promise<SubRedditResponse> {
    const subReddit = await em.findOne(SubReddit, { id });
    if (!subReddit) {
      return {
        success: false,
        errors: [
          {
            field: 'id',
            message: 'SubReddit does not exist',
          },
        ],
      };
    }
    const existingSubScription = await em.findOne(SubScription, { user: req.session.userId, subReddit: id });
    if (!existingSubScription) {
      return {
        success: false,
        subReddit: subReddit,
        errors: [
          {
            field: 'id',
            message: 'Subscription does not exist for this SubReddit',
          },
        ],
      };
    }
    existingSubScription !== null && (await em.removeAndFlush(existingSubScription));
    return {
      success: true,
      subReddit: subReddit,
    };
  }
}
