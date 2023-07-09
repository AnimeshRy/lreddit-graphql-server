import { Migration } from '@mikro-orm/migrations';

export class Migration20230709190838 extends Migration {

  async up(): Promise<void> {
    this.addSql('create table "sub_scription" ("user_id" varchar(255) not null, "subeddit_id" varchar(255) not null, "created_at" timestamptz(0) not null, "updated_at" timestamptz(0) not null, constraint "sub_scription_pkey" primary key ("user_id", "subeddit_id"));');

    this.addSql('alter table "sub_scription" add constraint "sub_scription_user_id_foreign" foreign key ("user_id") references "user" ("id") on update cascade;');
    this.addSql('alter table "sub_scription" add constraint "sub_scription_subeddit_id_foreign" foreign key ("subeddit_id") references "sub_reddit" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('drop table if exists "sub_scription" cascade;');
  }

}
