import test from 'node:test';
import assert from 'node:assert/strict';
import { 
  formatPHP, 
  pesosToCentavos, 
  centavosToPesos, 
  divideRentEqually,
  calculateDailyDepositRate,
  calculateDepositRemaining
} from './formatters.ts';

test('formatPHP formats integer centavos into Philippine Peso format', () => {
  assert.equal(formatPHP(250000), '₱2,500.00');
  assert.equal(formatPHP(150050), '₱1,500.50');
  assert.equal(formatPHP(0), '₱0.00');
  assert.equal(formatPHP(8333), '₱83.33');
});

test('pesosToCentavos and centavosToPesos handle conversions without rounding errors', () => {
  assert.equal(pesosToCentavos(2500), 250000);
  assert.equal(centavosToPesos(250000), 2500);
  assert.equal(pesosToCentavos(1234.56), 123456);
});

test('divideRentEqually distributes room rent across beds accurately with remainder', () => {
  // ₱5,000 across 2 beds -> ₱2,500 each
  const shares2 = divideRentEqually(500000, 2);
  assert.deepEqual(shares2, [250000, 250000]);
  assert.equal(shares2.reduce((a, b) => a + b, 0), 500000);

  // ₱6,000 across 3 beds -> ₱2,000 each
  const shares3 = divideRentEqually(600000, 3);
  assert.deepEqual(shares3, [200000, 200000, 200000]);
  assert.equal(shares3.reduce((a, b) => a + b, 0), 600000);

  // ₱10,000 across 3 beds -> 1000000 centavos / 3 = 333333 with 1 remainder centavo
  const sharesWithRemainder = divideRentEqually(1000000, 3);
  assert.deepEqual(sharesWithRemainder, [333334, 333333, 333333]);
  assert.equal(sharesWithRemainder.reduce((a, b) => a + b, 0), 1000000);
});

test('calculateDepositRemaining accurately calculates 30-day cushion drawdown', () => {
  const monthlyRent = 250000; // ₱2,500.00
  const dailyRate = calculateDailyDepositRate(monthlyRent); // 250000 / 30 = 8333 centavos (₱83.33)
  assert.equal(dailyRate, 8333);

  // Paolo Reyes has 5 days overdue
  const result = calculateDepositRemaining(250000, 5, dailyRate);
  assert.equal(result.remainingDays, 25);
  assert.equal(result.deductedCentavos, 5 * 8333); // 41665 centavos = ₱416.65
  assert.equal(result.remainingCentavos, 250000 - 41665); // 208335 centavos = ₱2,083.35
});
