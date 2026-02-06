import { ApiPaginationMeta } from '@parking-system/libs';
import { Repository, FindManyOptions } from 'typeorm';
import { SearchDto } from '../dtos';

export interface PaginatedResult<T> {
  data: T[];
  meta: ApiPaginationMeta;
}

export async function paginate<T>(
  repository: Repository<T>,
  searchDto: SearchDto,
  findOptions: FindManyOptions<T> = {},
): Promise<PaginatedResult<T>> {
  const { first, rows, sortField, sortOrder } = searchDto;

  const [data, total] = await repository.findAndCount({
    ...findOptions,
    skip: first, // Index to start from
    take: rows, // Number of records
    order: {
      [sortField]: sortOrder === 1 ? 'ASC' : 'DESC',
    } as any,
  });

  return {
    data,
    meta: {
      total,
      page: Math.floor(first / rows) + 1,
      lastPage: Math.ceil(total / rows),
      limit: rows,
    },
  };
}
