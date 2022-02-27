import { User } from "../entities/User";
import { MyContext } from "src/types";
import { RequiredEntityData } from "@mikro-orm/core";
import { Resolver, Mutation, Arg, InputType, Field, Ctx, ObjectType } from "type-graphql";
import argon2 from 'argon2';

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
    @Mutation(() => User)
    async register(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em }: MyContext
    ) {
        const hashedPassword = await argon2.hash(options.password)
        const user = em.create(User, { username: options.username, password: hashedPassword } as RequiredEntityData<User>)
        await em.persistAndFlush(user)
        return user;
    }

    @Mutation(() => UserResponse)
    async login(
        @Arg('options') options: UsernamePasswordInput,
        @Ctx() { em }: MyContext
    ): Promise<UserResponse> {
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
        return {
            user,
        }
    }
}
