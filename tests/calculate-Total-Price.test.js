const calculateTotalPrice = require('./calculateTotalPrice');

test('calculateTotalPrice() should return the correct total price based on the price per gallon, price per mile, out-of-state rate, and discount rate', () => {
  // Test case 1: Texas delivery
  expect(calculateTotalPrice(3.50, 0.1, 0)).toBe(14000);

  // Test case 2: Florida delivery
  expect(calculateTotalPrice(3.50, 0.1, 25)).toBe(14025);

  // Test case 3: Discount rate applied
  expect(calculateTotalPrice(3.50, 0.1, 25, 0.05)).toBe(13325);
});
