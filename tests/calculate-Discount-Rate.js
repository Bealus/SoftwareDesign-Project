function calculateDiscountRate(gallonsRequested) {
    gallonsRequested = gallonsRequested;
    let discountRate;

    if(gallonsRequested < 1000) {
        discountRate = 0.00;
    }
    if(1000 <= gallonsRequested <= 5000) {
        discountRate = 0.03;
    }
    if(5000 < gallonsRequested <= 10000) {
        discountRate = 0.07;
    }
    if(10000 < gallonsRequested <= 15000) {
        discountRate = 0.12;
    }
    if(15000 < gallonsRequested) {
        discountRate = 0.18;
    }
    return discountRate;
}

module.exports = calculateDiscountRate;
