export type PaginationQuery = { page?: number; limit?: number; q?: string; category?: string };
export type Paginated<T> = { data: T[]; total: number; page: number; limit: number };
