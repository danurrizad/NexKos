import { DataSource, Repository, ObjectLiteral } from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class BaseService<T extends ObjectLiteral> {
  protected constructor(
    protected readonly repository: Repository<T>,
    protected readonly dataSource: DataSource,
  ) {}

  protected async executeInTransaction<R>(
    operation: (queryRunner: any) => Promise<R>,
  ): Promise<R> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const result = await operation(queryRunner);
      await queryRunner.commitTransaction();
      return result;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
