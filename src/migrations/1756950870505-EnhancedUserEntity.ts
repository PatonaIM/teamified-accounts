import { MigrationInterface, QueryRunner } from "typeorm";

export class EnhancedUserEntity1756950870505 implements MigrationInterface {
    name = 'EnhancedUserEntity1756950870505'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "employment_records" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "client_id" uuid NOT NULL, "start_date" date NOT NULL, "end_date" date, "role" character varying(100) NOT NULL, "status" character varying(20) NOT NULL DEFAULT 'active', "migrated_from_zoho" boolean NOT NULL DEFAULT false, "zoho_employment_id" character varying(100), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "unique_active_employment_per_client" UNIQUE ("user_id", "client_id", "status"), CONSTRAINT "CHK_898282bcae1e0ae6bd69f21dc4" CHECK ("end_date" IS NULL OR "end_date" >= "start_date"), CONSTRAINT "CHK_e437a1064f23726ca4522f35a0" CHECK ("status" IN ('active', 'inactive', 'terminated', 'completed')), CONSTRAINT "PK_12524bc9c212bc229148563915c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_a98d305bd9c09a4ee7da7a8eb3" ON "employment_records" ("start_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_633369691ec3f202f45cebb5a3" ON "employment_records" ("status") `);
        await queryRunner.query(`CREATE INDEX "IDX_44647ac5c8f293e89f11b3dba9" ON "employment_records" ("client_id") `);
        await queryRunner.query(`CREATE INDEX "IDX_478ac6932654d54eac2f82a5ab" ON "employment_records" ("user_id") `);
        await queryRunner.query(`CREATE TABLE "salary_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "employment_record_id" uuid NOT NULL, "salary_amount" numeric(12,2) NOT NULL, "salary_currency" character varying(3) NOT NULL DEFAULT 'USD', "effective_date" date NOT NULL, "change_reason" character varying(100) NOT NULL, "changed_by" uuid, "migrated_from_zoho" boolean NOT NULL DEFAULT false, "zoho_salary_id" character varying(100), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "unique_effective_date_per_employment" UNIQUE ("employment_record_id", "effective_date"), CONSTRAINT "CHK_7217c53ed308ce85044ca23455" CHECK ("salary_amount" > 0), CONSTRAINT "PK_796fc91fc02d8e1b35a08c3de32" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_e95a5187bae79f6c823045a337" ON "salary_history" ("effective_date") `);
        await queryRunner.query(`CREATE INDEX "IDX_5c56fe595714603a8f31f593ed" ON "salary_history" ("employment_record_id") `);
        await queryRunner.query(`CREATE TABLE "user_roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "role_type" character varying(50) NOT NULL, "scope" character varying(20) NOT NULL, "scope_entity_id" uuid, "granted_by" uuid, "expires_at" TIMESTAMP WITH TIME ZONE, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "CHK_21696d74f91e511e83cd077942" CHECK ("scope" IN ('user', 'group', 'client', 'all')), CONSTRAINT "CHK_b430253d58e98fc265b9c767fe" CHECK ("role_type" IN ('candidate', 'eor', 'admin', 'timesheet_approver', 'leave_approver')), CONSTRAINT "PK_8acd5cf26ebd158416f477de799" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_32cbb6f005afc7507c7864e8b4" ON "user_roles" ("expires_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_ded0b49981fd798786012c0f4f" ON "user_roles" ("scope") `);
        await queryRunner.query(`CREATE INDEX "IDX_7d15b7e3fb6d4d19748adce2ed" ON "user_roles" ("role_type") `);
        await queryRunner.query(`CREATE INDEX "IDX_87b8888186ca9769c960e92687" ON "user_roles" ("user_id") `);
        await queryRunner.query(`ALTER TABLE "users" ADD "phone" character varying(20)`);
        await queryRunner.query(`ALTER TABLE "users" ADD "address" jsonb`);
        await queryRunner.query(`ALTER TABLE "users" ADD "profile_data" jsonb`);
        await queryRunner.query(`ALTER TABLE "users" ADD "status" character varying(20) NOT NULL DEFAULT 'active'`);
        await queryRunner.query(`ALTER TABLE "users" ADD "migrated_from_zoho" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "users" ADD "zoho_user_id" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "contact_info" jsonb`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "status" character varying(20) NOT NULL DEFAULT 'active'`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "migrated_from_zoho" boolean NOT NULL DEFAULT false`);
        await queryRunner.query(`ALTER TABLE "clients" ADD "zoho_client_id" character varying(100)`);
        await queryRunner.query(`ALTER TABLE "users" ADD CONSTRAINT "CHK_ac185881bfade295dd02abb641" CHECK ("status" IN ('active', 'inactive', 'archived'))`);
        await queryRunner.query(`ALTER TABLE "clients" ADD CONSTRAINT "CHK_c30a5ccec578c3004aeaa11ba0" CHECK ("status" IN ('active', 'inactive'))`);
        await queryRunner.query(`ALTER TABLE "employment_records" ADD CONSTRAINT "FK_478ac6932654d54eac2f82a5ab9" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "employment_records" ADD CONSTRAINT "FK_44647ac5c8f293e89f11b3dba98" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "salary_history" ADD CONSTRAINT "FK_5c56fe595714603a8f31f593edb" FOREIGN KEY ("employment_record_id") REFERENCES "employment_records"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "salary_history" ADD CONSTRAINT "FK_6fbd146356f8db3ff47212f0fb1" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_87b8888186ca9769c960e926870" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "user_roles" ADD CONSTRAINT "FK_5d2beedacbe986e0dbabba67a84" FOREIGN KEY ("granted_by") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_5d2beedacbe986e0dbabba67a84"`);
        await queryRunner.query(`ALTER TABLE "user_roles" DROP CONSTRAINT "FK_87b8888186ca9769c960e926870"`);
        await queryRunner.query(`ALTER TABLE "salary_history" DROP CONSTRAINT "FK_6fbd146356f8db3ff47212f0fb1"`);
        await queryRunner.query(`ALTER TABLE "salary_history" DROP CONSTRAINT "FK_5c56fe595714603a8f31f593edb"`);
        await queryRunner.query(`ALTER TABLE "employment_records" DROP CONSTRAINT "FK_44647ac5c8f293e89f11b3dba98"`);
        await queryRunner.query(`ALTER TABLE "employment_records" DROP CONSTRAINT "FK_478ac6932654d54eac2f82a5ab9"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP CONSTRAINT "CHK_c30a5ccec578c3004aeaa11ba0"`);
        await queryRunner.query(`ALTER TABLE "users" DROP CONSTRAINT "CHK_ac185881bfade295dd02abb641"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "zoho_client_id"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "migrated_from_zoho"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "clients" DROP COLUMN "contact_info"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "zoho_user_id"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "migrated_from_zoho"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "status"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "profile_data"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "address"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "phone"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_87b8888186ca9769c960e92687"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_7d15b7e3fb6d4d19748adce2ed"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_ded0b49981fd798786012c0f4f"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_32cbb6f005afc7507c7864e8b4"`);
        await queryRunner.query(`DROP TABLE "user_roles"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5c56fe595714603a8f31f593ed"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_e95a5187bae79f6c823045a337"`);
        await queryRunner.query(`DROP TABLE "salary_history"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_478ac6932654d54eac2f82a5ab"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_44647ac5c8f293e89f11b3dba9"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_633369691ec3f202f45cebb5a3"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_a98d305bd9c09a4ee7da7a8eb3"`);
        await queryRunner.query(`DROP TABLE "employment_records"`);
    }

}
