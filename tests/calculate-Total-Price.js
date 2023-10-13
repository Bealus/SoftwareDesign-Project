function calculateTotalPrice(pricePerGallon, pricePerMile, outStateRate) {
    // Hardcoded test values, will be retrieved from database later
    const gallonsRequested = 4000;
    const distance = 500;
    const state = 'Florida';

    let rawFuelPrice = gallonsRequested*pricePerGallon;
    let distPrice = distance*pricePerMile;
    let finalPrice = rawFuelPrice+distPrice;
    let discountRate = 0.03;

    if(state != 'Texas') {
        finalPrice = finalPrice + outStateRate;
    }

    finalPrice = finalPrice - finalPrice*discountRate;
    finalPrice = finalPrice + finalPrice*0.0825; // Tax

    return finalPrice;
}

module.exports = calculateTotalPrice;
