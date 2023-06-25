import { Migration } from '@mikro-orm/migrations';

export class Migration20230619175826 extends Migration {
  async up(): Promise<void> {
    this.addSql('alter table "post" add column "text" text not null, add column "creator_id" int not null, add column "points" int not null default 0;');
    this.addSql('alter table "post" add constraint "post_creator_id_foreign" foreign key ("creator_id") references "user" ("id") on update cascade;');
  }

  async down(): Promise<void> {
    this.addSql('alter table "post" drop constraint "post_creator_id_foreign";');

    this.addSql('alter table "post" drop column "text";');
    this.addSql('alter table "post" drop column "creator_id";');
    this.addSql('alter table "post" drop column "points";');
  }
}
