import { MiddlewareFn } from 'type-graphql';
import { MyContext } from '../types';

export const isAuth: MiddlewareFn<MyContext> = ({ context }, next) => {
  if (!context.req.session || !context.req.session.userId) {
    throw new Error('401: User not authenticated');
  }

  return next();
};
