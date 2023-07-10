import { Migration } from '@mikro-orm/migrations';

export class Migration20230710195405 extends Migration {

  async up(): Promise<void> {
    this.addSql('drop table if exists "sub_reddit_subscribers" cascade;');
  }

  async down(): Promise<void> {
    this.addSql('create table "sub_reddit_subscribers" ("sub_reddit_id" varchar(255) not null, "user_id" varchar(255) not null, constraint "sub_reddit_subscribers_pkey" primary key ("sub_reddit_id", "user_id"));');

    this.addSql('alter table "sub_reddit_subscribers" add constraint "sub_reddit_subscribers_sub_reddit_id_foreign" foreign key ("sub_reddit_id") references "sub_reddit" ("id") on update cascade on delete cascade;');
    this.addSql('alter table "sub_reddit_subscribers" add constraint "sub_reddit_subscribers_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade on delete cascade;');
  }

}
