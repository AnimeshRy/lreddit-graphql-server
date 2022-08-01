import { Entity, ManyToOne, PrimaryKey, Property } from '@mikro-orm/core';
import { Field, Int, ObjectType } from 'type-graphql';
import { User } from './User';

@ObjectType() // converting existing class to graphql schema
@Entity()
export class Post {
    @Field(() => Int)
    @PrimaryKey()
    id!: number;

    @Field()
    @Property({ type: "text" })
    title!: string;

    @Field()
    @Property({ type: "text" })
    text!: string;

    @ManyToOne({ entity: () => User })
    creator: User;

    @Field()
    @Property({ type: "int", default: 0 })
    points!: number;

    @Field(() => String)
    @Property({ type: "date" })
    createdAt = new Date();

    @Field(() => String)
    @Property({ type: "date", onUpdate: () => new Date() })
    updatedAt = new Date();
}
