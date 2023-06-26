import { Migration } from '@mikro-orm/migrations';

export class Migration20230626154935 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "user" ("id" varchar(255) not null, "username" text not null, "email" text not null, "password" text not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, constraint "user_pkey" primary key ("id"));');
    this.addSql('alter table "user" add constraint "user_username_unique" unique ("username");');
    this.addSql('alter table "user" add constraint "user_email_unique" unique ("email");');

    this.addSql('create table "sub_reddit" ("id" varchar(255) not null, "name" text not null, "text" text not null, "creator_id" varchar(255) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, constraint "sub_reddit_pkey" primary key ("id"));');
    this.addSql('alter table "sub_reddit" add constraint "sub_reddit_name_unique" unique ("name");');

    this.addSql('create table "post" ("id" varchar(255) not null, "title" text not null, "text" text not null, "creator_id" varchar(255) not null, "sub_reddit_id" varchar(255) not null, "points" int not null default 0, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, constraint "post_pkey" primary key ("id"));');

    this.addSql('alter table "sub_reddit" add constraint "sub_reddit_creator_id_foreign" foreign key ("creator_id") references "user" ("id") on update cascade;');

    this.addSql('alter table "post" add constraint "post_creator_id_foreign" foreign key ("creator_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "post" add constraint "post_sub_reddit_id_foreign" foreign key ("sub_reddit_id") references "sub_reddit" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "sub_reddit" drop constraint "sub_reddit_creator_id_foreign";');

    this.addSql('alter table "post" drop constraint "post_creator_id_foreign";');

    this.addSql('alter table "post" drop constraint "post_sub_reddit_id_foreign";');

    this.addSql('drop table if exists "user" cascade;');

    this.addSql('drop table if exists "sub_reddit" cascade;');

    this.addSql('drop table if exists "post" cascade;');
  }

}
