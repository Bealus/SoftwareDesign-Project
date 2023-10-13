class PricingModule
{
    // Constructor for initializing pricing data
    constructor(pricePerGallon, pricePerMile, outOfStateRate)
    {
        this.pricePerGallon = pricePerGallon;
        this.pricePerMile = pricePerMile;
        this.outOfStateRate = outOfStateRate;
    }

    // Method to calculate total price
    calculateTotalPrice() {
        // Hardcoded test values, will be retrieved from database later
        const gallonsRequested = 4000;
        const distance = 500;
        const state = 'Florida';

        let rawFuelPrice = gallonsRequested*this.pricePerGallon;
        let distPrice = distance*this.pricePerMile;
        let finalPrice = rawFuelPrice+distPrice;
        let discountRate = this.calculateDiscountRate(gallonsRequested);

        if(state != 'Texas') {
            finalPrice = finalPrice + this.outOfStateRate;
        }

        finalPrice = finalPrice - finalPrice*discountRate;
        finalPrice = finalPrice + finalPrice*0.0825; // Tax

        return finalPrice;
    }

    // Method to calculate discount rate
    calculateDiscountRate(gallonsRequested) {
        this.gallonsRequested = gallonsRequested;
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
}

/* Default price per gallon
Default price per mile
Default flat out of state rate */
const pricing = new PricingModule(3, 1.7, 500); // Test values
const totalPrice = pricing.calculateTotalPrice();

console.log("Total Price: $" + totalPrice.toFixed(2));

/* 
Useful info:
Small fuel tanks (ones used for smaller operations) range 150-1000 gallons.
Typical small fuel tankers have capacity of 1000-3000 gallons.
Typical large fuel tankers have up to 12000 gallons.
Typical gas stations (convenience stores) have storage capacity of 10000-15000 gallons.
Large gas stations (truck stops) have a storage capacity of 30000-40000 gallons.
*/
