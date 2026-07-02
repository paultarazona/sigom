import { isValidTransition } from './state-machine';

describe('isValidTransition', () => {
  // ── Valid transitions ──────────────────────────────────────────────────────

  describe('valid transitions', () => {
    it.each([
      ['PENDING', 'ASSIGNED'],
      ['PENDING', 'CANCELLED'],
      ['ASSIGNED', 'IN_FIELD'],
      ['ASSIGNED', 'CANCELLED'],
      ['IN_FIELD', 'SUSPENDED'],
      ['IN_FIELD', 'RESOLVED'],
      ['SUSPENDED', 'ASSIGNED'],
      ['RESOLVED', 'CLOSED'],
    ])('should return true for %s → %s', (current, target) => {
      expect(isValidTransition(current, target)).toBe(true);
    });
  });

  // ── Invalid transitions (wrong direction / skipped states) ─────────────────

  describe('invalid transitions', () => {
    it.each([
      ['PENDING', 'IN_FIELD'],
      ['PENDING', 'RESOLVED'],
      ['PENDING', 'CLOSED'],
      ['PENDING', 'SUSPENDED'],
      ['ASSIGNED', 'PENDING'],
      ['ASSIGNED', 'RESOLVED'],
      ['ASSIGNED', 'CLOSED'],
      ['ASSIGNED', 'SUSPENDED'],
      ['IN_FIELD', 'PENDING'],
      ['IN_FIELD', 'ASSIGNED'],
      ['IN_FIELD', 'CLOSED'],
      ['IN_FIELD', 'CANCELLED'],
      ['SUSPENDED', 'IN_FIELD'],
      ['SUSPENDED', 'RESOLVED'],
      ['SUSPENDED', 'CLOSED'],
      ['SUSPENDED', 'CANCELLED'],
      ['RESOLVED', 'PENDING'],
      ['RESOLVED', 'ASSIGNED'],
      ['RESOLVED', 'IN_FIELD'],
      ['RESOLVED', 'SUSPENDED'],
      ['RESOLVED', 'CANCELLED'],
      ['CLOSED', 'RESOLVED'],
      ['CLOSED', 'PENDING'],
      ['CANCELLED', 'PENDING'],
      ['CANCELLED', 'ASSIGNED'],
    ])('should return false for %s → %s', (current, target) => {
      expect(isValidTransition(current, target)).toBe(false);
    });
  });

  // ── Terminal states ────────────────────────────────────────────────────────

  describe('terminal states have no outgoing transitions', () => {
    it('should return false for any transition out of CLOSED', () => {
      const targets = ['PENDING', 'ASSIGNED', 'IN_FIELD', 'SUSPENDED', 'RESOLVED', 'CANCELLED'];
      targets.forEach((target) => {
        expect(isValidTransition('CLOSED', target)).toBe(false);
      });
    });

    it('should return false for any transition out of CANCELLED', () => {
      const targets = ['PENDING', 'ASSIGNED', 'IN_FIELD', 'SUSPENDED', 'RESOLVED', 'CLOSED'];
      targets.forEach((target) => {
        expect(isValidTransition('CANCELLED', target)).toBe(false);
      });
    });
  });

  // ── Edge cases ─────────────────────────────────────────────────────────────

  describe('edge cases', () => {
    it('should return false for an unknown current state', () => {
      expect(isValidTransition('UNKNOWN_STATE', 'ASSIGNED')).toBe(false);
    });

    it('should return false for an empty string as current state', () => {
      expect(isValidTransition('', 'ASSIGNED')).toBe(false);
    });

    it('should return false for an empty string as target state', () => {
      expect(isValidTransition('PENDING', '')).toBe(false);
    });

    it('should return false for both states being empty strings', () => {
      expect(isValidTransition('', '')).toBe(false);
    });

    it('should return false for lowercase states (case-sensitive)', () => {
      expect(isValidTransition('pending', 'assigned')).toBe(false);
    });

    it('should return false for mixed-case states', () => {
      expect(isValidTransition('Pending', 'Assigned')).toBe(false);
    });

    it('should return false when current state is undefined-like string', () => {
      expect(isValidTransition('undefined', 'ASSIGNED')).toBe(false);
    });
  });
});
