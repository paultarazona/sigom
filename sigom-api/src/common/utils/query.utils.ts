export function buildOrderBy(
  sortBy: string | undefined,
  sortOrder: string | undefined,
  allowedFields: string[],
  defaultField = 'createdAt',
): Record<string, string> {
  if (sortBy && allowedFields.includes(sortBy)) {
    return { [sortBy]: sortOrder === 'asc' ? 'asc' : 'desc' };
  }
  return { [defaultField]: 'desc' };
}
