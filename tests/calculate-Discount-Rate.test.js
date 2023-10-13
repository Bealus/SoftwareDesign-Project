const calculateDiscountRate = require('./calculateDiscountRate');

test('calculateDiscountRate() should return the correct discount rate based on the gallons requested', () => {
    expect(calculateDiscountRate(999)).toBe(0.00);
    expect(calculateDiscountRate(1000)).toBe(0.03);
    expect(calculateDiscountRate(5000)).toBe(0.03);
    expect(calculateDiscountRate(5001)).toBe(0.07);
    expect(calculateDiscountRate(10000)).toBe(0.07);
    expect(calculateDiscountRate(10001)).toBe(0.12);
    expect(calculateDiscountRate(15000)).toBe(0.12);
    expect(calculateDiscountRate(15001)).toBe(0.18);
  });
