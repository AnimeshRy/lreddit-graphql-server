import { Migration } from '@mikro-orm/migrations';

export class Migration20230709200835 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "sub_scription" drop constraint "sub_scription_subreddit_id_foreign";');

    this.addSql('alter table "sub_scription" drop constraint "sub_scription_pkey";');
    this.addSql('alter table "sub_scription" rename column "subreddit_id" to "sub_reddit_id";');
    this.addSql('alter table "sub_scription" add constraint "sub_scription_sub_reddit_id_foreign" foreign key ("sub_reddit_id") references "sub_reddit" ("id") on update cascade;');
    this.addSql('alter table "sub_scription" add constraint "sub_scription_pkey" primary key ("user_id", "sub_reddit_id");');
  }

  async down(): Promise<void> {
    this.addSql('alter table "sub_scription" drop constraint "sub_scription_sub_reddit_id_foreign";');

    this.addSql('alter table "sub_scription" drop constraint "sub_scription_pkey";');
    this.addSql('alter table "sub_scription" rename column "sub_reddit_id" to "subreddit_id";');
    this.addSql('alter table "sub_scription" add constraint "sub_scription_subreddit_id_foreign" foreign key ("subreddit_id") references "sub_reddit" ("id") on update cascade;');
    this.addSql('alter table "sub_scription" add constraint "sub_scription_pkey" primary key ("user_id", "subreddit_id");');
  }

}
