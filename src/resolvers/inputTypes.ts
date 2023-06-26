import { User } from '../entities/User';
import { InputType, Field, ObjectType } from 'type-graphql';
import { MaxLength } from 'class-validator';
import { Post } from '../entities/Post';

@ObjectType()
export class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@InputType()
export class UsernamePasswordInput {
  @Field()
  username: string;
  @Field()
  email: string;
  @Field()
  password: string;
}

@ObjectType()
export class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]; // optional type, returned when user not found

  @Field(() => User, { nullable: true })
  user?: User; // optional type, returned when user is found
}

@ObjectType()
export class PostResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: FieldError[]; // optional type, returned when user not found

  @Field(() => Post, { nullable: true })
  post?: Post; // optional type, returned when user is found
}

@InputType()
export class PostInput {
  @Field()
  @MaxLength(30)
  title: string;
  @Field()
  text: string;
  @Field()
  subReddit: string;
}

@InputType()
export class UpdatePostInput {
  @Field()
  @MaxLength(1)
  title?: string;
  @Field()
  text?: string;
}

@InputType()
export class SubRedditCreateInput {
  @Field()
  @MaxLength(30)
  name: string;

  @Field()
  @MaxLength(45)
  text: string;
}

@InputType()
export class SubRedditUpdateInput {
  @Field()
  @MaxLength(45)
  text: string;
}
