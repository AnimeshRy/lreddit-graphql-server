import { Migration } from '@mikro-orm/migrations';

export class Migration20230709200352 extends Migration {

  async up(): Promise<void> {
    this.addSql('alter table "sub_scription" drop constraint "sub_scription_subeddit_id_foreign";');

    this.addSql('alter table "sub_scription" drop constraint "sub_scription_pkey";');
    this.addSql('alter table "sub_scription" rename column "subeddit_id" to "subreddit_id";');
    this.addSql('alter table "sub_scription" add constraint "sub_scription_subreddit_id_foreign" foreign key ("subreddit_id") references "sub_reddit" ("id") on update cascade;');
    this.addSql('alter table "sub_scription" add constraint "sub_scription_pkey" primary key ("user_id", "subreddit_id");');
  }

  async down(): Promise<void> {
    this.addSql('alter table "sub_scription" drop constraint "sub_scription_subreddit_id_foreign";');

    this.addSql('alter table "sub_scription" drop constraint "sub_scription_pkey";');
    this.addSql('alter table "sub_scription" rename column "subreddit_id" to "subeddit_id";');
    this.addSql('alter table "sub_scription" add constraint "sub_scription_subeddit_id_foreign" foreign key ("subeddit_id") references "sub_reddit" ("id") on update cascade;');
    this.addSql('alter table "sub_scription" add constraint "sub_scription_pkey" primary key ("user_id", "subeddit_id");');
  }

}
