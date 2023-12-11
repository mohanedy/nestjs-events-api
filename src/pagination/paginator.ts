import { SelectQueryBuilder } from 'typeorm';
import { Expose } from 'class-transformer';
import { first, last } from 'rxjs';

export interface PaginateOptions {
  limit: number;
  currentPage: number;
  total?: boolean;
}

export class PaginationResult<T> {
  @Expose()
  first: number;

  @Expose()
  last: number;

  @Expose()
  limit: number;

  @Expose()
  total?: number;

  @Expose()
  data: T[];

  constructor(partial: Partial<PaginationResult<T>>) {
    Object.assign(this, partial);
  }
}

export async function paginate<T>(
  qb: SelectQueryBuilder<T>,
  options: PaginateOptions = {
    limit: 10,
    currentPage: 1,
    total: true,
  },
): Promise<PaginationResult<T>> {
  const offset = (options.currentPage - 1) * options.limit;
  const data = await qb.limit(options.limit).offset(offset).getMany();
  return new PaginationResult({
    data,
    first: offset + 1,
    last: offset + data.length,
    limit: Number(options.limit),
    total: options.total ? await qb.getCount() : null,
  });
}
