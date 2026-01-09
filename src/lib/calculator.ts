const REGULATION_MINUTES = 48;

export interface CalculationResult {
  expectedTotal: number;
  pace: number;
  remainingMinutes: number;
}

export function calculateExpectedTotal(
  minutesElapsed: number,
  currentPoints: number
): CalculationResult | null {
  if (minutesElapsed <= 0 || minutesElapsed > REGULATION_MINUTES) {
    return null;
  }

  const pace = currentPoints / minutesElapsed;
  const expectedTotal = Math.round(pace * REGULATION_MINUTES);
  const remainingMinutes = REGULATION_MINUTES - minutesElapsed;

  return {
    expectedTotal,
    pace: Math.round(pace * 100) / 100,
    remainingMinutes,
  };
}
