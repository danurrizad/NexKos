import {
  DataSource,
  Repository,
  ObjectLiteral,
  FindOptionsWhere,
} from 'typeorm';
import { Injectable } from '@nestjs/common';

@Injectable()
export abstract class BaseService<T extends ObjectLiteral> {
  protected constructor(
    protected readonly repository: Repository<T>,
    protected readonly dataSource: DataSource,
  ) {}

  async count(options?: FindOptionsWhere<T>): Promise<number> {
    return this.repository.count({ where: options });
  }

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
