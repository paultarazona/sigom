const VALID_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['ASSIGNED', 'CANCELLED'],
  ASSIGNED: ['IN_FIELD', 'CANCELLED'],
  IN_FIELD: ['SUSPENDED', 'RESOLVED'],
  SUSPENDED: ['ASSIGNED'],
  RESOLVED: ['CLOSED'],
  CLOSED: [],
  CANCELLED: [],
};

export function isValidTransition(current: string, target: string): boolean {
  return VALID_TRANSITIONS[current]?.includes(target) ?? false;
}
