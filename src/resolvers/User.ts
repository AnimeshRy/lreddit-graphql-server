import { User } from '../entities/User';
import { MyContext } from 'src/types';
import { RequiredEntityData } from '@mikro-orm/core';
import { Resolver, Mutation, Arg, Ctx, Query, UseMiddleware } from 'type-graphql';
import argon2 from 'argon2';
import { COOKIE_NAME, FORGET_PASSWORD_PREFIX } from '../constants';
import { UserResponse, UsernamePasswordInput } from './inputTypes';
import { validateRegister } from '../utils/validateRegister';
import { sendEmail } from '../utils/sendEmail';
import { v4 } from 'uuid';
import { isAuth } from '../middlewares/isAuth';

@Resolver()
export class UserResolver {
  @Mutation(() => UserResponse)
  async changePassword(@Arg('token') token: string, @Arg('newPassword') newPassword: string, @Ctx() { redis, em, req }: MyContext): Promise<UserResponse> {
    if (newPassword.length <= 2) {
      return {
        errors: [
          {
            field: 'newPassword2',
            message: 'length must be greater than 2',
          },
        ],
      };
    }
    const key = FORGET_PASSWORD_PREFIX + token;
    const userId = await redis.get(key);
    if (!userId) {
      return {
        errors: [
          {
            field: 'token',
            message: 'token expired',
          },
        ],
      };
    }

    const user = await em.findOne(User, { id: userId });

    if (!user) {
      return {
        errors: [
          {
            field: 'token',
            message: 'user no longer exists',
          },
        ],
      };
    }

    user.password = await argon2.hash(newPassword);
    await em.persistAndFlush(user);

    // delete token from redis
    await redis.del(key);
    // log in user after changing password
    req.session.userId = user.id;
    return { user };
  }

  @Mutation(() => Boolean)
  async forgotPassword(@Arg('email') email: string, @Ctx() { em, redis }: MyContext) {
    const user = await em.findOne(User, { email });
    if (!user) {
      // the email is not in the db
      // don't tell the user that user exists or not
      return true;
    }

    const token = v4();

    await redis.set(FORGET_PASSWORD_PREFIX + token, user.id, 'EX', 1000 * 60 * 60 * 24 * 3);

    await sendEmail(email, `<a href="http://localhost:3000/change-password/${token}">reset password</a>`);
    return true;
  }

  //   @Authorized()
  @UseMiddleware(isAuth)
  @Query(() => User, { nullable: true })
  async me(@Ctx() { req, em }: MyContext) {
    const user = await em.findOne(User, { id: req.session.userId });
    return user;
  }

  @Mutation(() => UserResponse)
  async register(@Arg('options') options: UsernamePasswordInput, @Ctx() { em, req }: MyContext): Promise<UserResponse> {
    const errors = validateRegister(options);
    if (errors) {
      return { errors };
    }

    const hashedPassword = await argon2.hash(options.password);
    const user = em.create(User, { username: options.username, password: hashedPassword, email: options.email } as RequiredEntityData<User>);
    try {
      await em.persistAndFlush(user);
    } catch (error) {
      // console.log('message: ', error)
      if (error.code === '23505') {
        // Duplicate Username Error
        return {
          errors: [
            {
              field: 'username',
              message: 'username already taken',
            },
          ],
        };
      }
    }

    // store user id session
    // this will set a cookie on the user
    // keep them logged in
    req.session.userId = user.id;
    return {
      user,
    };
  }

  @Mutation(() => UserResponse)
  async login(@Arg('usernameOrEmail') usernameOrEmail: string, @Arg('password') password: string, @Ctx() { em, req }: MyContext): Promise<UserResponse> {
    const user = await em.findOne(User, usernameOrEmail.includes('@') ? { email: usernameOrEmail } : { username: usernameOrEmail });
    if (!user) {
      return {
        errors: [
          {
            field: 'usernameOrEmail',
            message: "that username doesn't exist",
          },
        ],
      };
    }
    const valid = await argon2.verify(user.password, password);

    // found a user ? Validate pass
    if (!valid) {
      return {
        errors: [
          {
            field: 'password',
            message: 'incorrect password',
          },
        ],
      };
    }
    // create session of user after logging in
    req.session.userId = user.id;

    return {
      user,
    };
  }

  @Mutation(() => Boolean)
  logout(@Ctx() { req, res }: MyContext) {
    return new Promise(resolve =>
      req.session.destroy(err => {
        res.clearCookie(COOKIE_NAME); // clear cookie even if session does not get destroyed
        if (err) {
          resolve(false);
          return;
        }

        resolve(true);
      }),
    );
  }
}
