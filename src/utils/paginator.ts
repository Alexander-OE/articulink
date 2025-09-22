export function buildPaginationResponse<T>(
  data: T[],
  total: number,
  limit: number,
  offset: number
) {
  return {
    data,
    meta: {
      total,
      limit,
      offset,
    },
  };
}
