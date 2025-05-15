import { MigrationInterface, QueryRunner } from 'typeorm';

export class FixUsersTable1715000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // First, make email nullable if it's not already
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL`,
    );

    // Update existing rows with a default value where email is null
    await queryRunner.query(
      `UPDATE "users" SET "email" = 'default@example.com' WHERE "email" IS NULL`,
    );

    // Add NOT NULL constraint
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "email" SET NOT NULL`,
    );

    // Add unique constraint if it doesn't exist
    await queryRunner.query(
      `DO $$ 
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'UQ_users_email'
        ) THEN
          ALTER TABLE "users" ADD CONSTRAINT "UQ_users_email" UNIQUE ("email");
        END IF;
      END $$;`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Remove unique constraint if it exists
    await queryRunner.query(
      `DO $$ 
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'UQ_users_email'
        ) THEN
          ALTER TABLE "users" DROP CONSTRAINT "UQ_users_email";
        END IF;
      END $$;`,
    );

    // Make email nullable
    await queryRunner.query(
      `ALTER TABLE "users" ALTER COLUMN "email" DROP NOT NULL`,
    );
  }
}
