import { User } from "../entities/User";
import { MyContext } from "src/types";
import { RequiredEntityData } from "@mikro-orm/core";
import { Resolver, Mutation, Arg, InputType, Field, Ctx, ObjectType, Query } from "type-graphql";
import argon2 from 'argon2';
import { COOKIE_NAME } from "../constants";

@InputType()
class UsernamePasswordInput {
    @Field()
    username: string

    @Field()
    password: string
}

@ObjectType()
class FieldError {
    @Field()
    field: string;

    @Field()
    message: string;
}

@ObjectType()
class UserResponse {
    @Field(() => [FieldError], { nullable: true })
    errors?: FieldError[] // optional type, returned when user not found

    @Field(() => User, { nullable: true })
    user?: User // optional type, returned when user is found
}

@Resolver()
export class UserResolver {
    @Query(() => User, { nullable: true })
    async me(
        @Ctx() { req, em }: MyContext
    ) {
        if (!req.session.userId) {
            return null
        }

        const user = await em.findOne(User, { id: req.session.userId })
        return user
    }


    @Mutation(() => UserResponse)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        if (options.username.length <= 2) {
            return {
                errors: [{
                    field: "username",
                    message: "length must be greater than 2"
                }]
            }
        }

        if (options.password.length <= 5) {
            return {
                errors: [{
                    field: "password",
                    message: "length must be greater than 5"
                }]
            }
        }

        const hashedPassword = await argon2.hash(options.password)
        const user = em.create(User, { username: options.username, password: hashedPassword } as RequiredEntityData<User>)
        try {
            await em.persistAndFlush(user)
        } catch (error) {
            // console.log('message: ', error)
            if (error.code === '23505') { // Duplicate Username Error
                return {
                    errors: [
                        {
                            field: "username",
                            message: "username already taken",
                        }
                    ]
                }
            }
        }

        // store user id session
        // this will set a cookie on the user
        // keep them logged in
        req.session.userId = user.id;
        return {
            user
        }
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em, req }: MyContext
    ): Promise<UserResponse> {
        if (options.username.length <= 2) {
            return {
                errors: [{
                    field: "username",
                    message: "length must be greater than 2"
                }]
            }
        }

        const user = await em.findOne(User, { username: options.username })
        if (!user) {
            return {
                errors: [{
                    field: "username",
                    message: "that username doesn't exist"
                }]
            }
        }
        const valid = await argon2.verify(user.password, options.password)

        // found a user ? Validate pass
        if (!valid) {
            return {
                errors: [
                    {
                        field: "password",
                        message: "incorrect password"
                    }
                ]
            }
        }
        // create session of user after logging in
        req.session.userId = user.id;

        return {
            user,
        }
    }

    @Mutation(() => Boolean)
    logout(
        @Ctx() { req, res }: MyContext
    ) {
        return new Promise(resolve => req.session.destroy(err => {
            res.clearCookie(COOKIE_NAME) // clear cookie even if session does not get destroyed
            if (err) {
                resolve(false)
                return
            }

            resolve(true)
        })
        )
    }
}
