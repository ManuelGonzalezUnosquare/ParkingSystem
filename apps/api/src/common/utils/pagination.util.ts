import { ApiPaginationMeta } from '@parking-system/libs';
import { FindManyOptions, Repository, SelectQueryBuilder } from 'typeorm';
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

export async function paginateQuery<T>(
  query: SelectQueryBuilder<T>,
  searchDto: SearchDto,
): Promise<PaginatedResult<T>> {
  const { first, rows, sortField, sortOrder } = searchDto;

  const orderBy = {
    [`${query.alias}.${sortField}`]: sortOrder === 1 ? 'ASC' : 'DESC',
  } as any;

  const [entities, count] = await query
    .skip(first)
    .take(rows)
    .orderBy(orderBy)
    .getManyAndCount();

  return {
    data: entities,
    meta: {
      total: count,
      page: Math.floor(first / rows) + 1,
      lastPage: Math.ceil(count / rows),
      limit: rows,
    },
  };
}
