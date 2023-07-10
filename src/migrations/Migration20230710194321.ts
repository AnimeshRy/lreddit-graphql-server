import { Migration } from '@mikro-orm/migrations';

export class Migration20230710194321 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "sub_reddit_subscribers" ("sub_reddit_id" varchar(255) not null, "user_id" varchar(255) not null, constraint "sub_reddit_subscribers_pkey" primary key ("sub_reddit_id", "user_id"));');

    this.addSql('create table "user_subscriptions" ("user_id" varchar(255) not null, "sub_reddit_id" varchar(255) not null, constraint "user_subscriptions_pkey" primary key ("user_id", "sub_reddit_id"));');

    this.addSql('alter table "sub_reddit_subscribers" add constraint "sub_reddit_subscribers_sub_reddit_id_foreign" foreign key ("sub_reddit_id") references "sub_reddit" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "sub_reddit_subscribers" add constraint "sub_reddit_subscribers_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;');

    this.addSql('alter table "user_subscriptions" add constraint "user_subscriptions_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "user_subscriptions" add constraint "user_subscriptions_sub_reddit_id_foreign" foreign key ("sub_reddit_id") references "sub_reddit" ("id") on update cascade on delete cascade;');

    this.addSql('drop table if exists "sub_scription" cascade;');
  }

  async down(): Promise<void> {
    this.addSql('create table "sub_scription" ("user_id" varchar(255) not null, "sub_reddit_id" varchar(255) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, constraint "sub_scription_pkey" primary key ("user_id", "sub_reddit_id"));');

    this.addSql('alter table "sub_scription" add constraint "sub_scription_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "sub_scription" add constraint "sub_scription_sub_reddit_id_foreign" foreign key ("sub_reddit_id") references "sub_reddit" ("id") on update cascade;');

    this.addSql('drop table if exists "sub_reddit_subscribers" cascade;');

    this.addSql('drop table if exists "user_subscriptions" cascade;');
  }

}
