class PricingModule
{
    #curr_ppg = 1.50;
    #company_profit = 0.15;
    #locationFactor;
    #historyFactor;
    #gallonsReqFactor;
    #gallonsRequested;
    // Constructor for initializing pricing data
    constructor(gallonsRequested, historyCount, location)
    {
        if(location == 'TX') {
            this.#locationFactor = 0.02;
        } else {
            this.#locationFactor = 0.04;
        }

        if(historyCount == 0) {
            this.#historyFactor = 0.00
        } else {
            this.#historyFactor = 0.01
        }

        if(gallonsRequested > 1000) {
            this.#gallonsReqFactor = 0.02
        } else {
            this.#gallonsReqFactor = 0.03
        }
        this.#gallonsRequested = gallonsRequested
    }
    
    calculateMargin() {
        return this.#curr_ppg * (this.#locationFactor - this.#historyFactor + this.#gallonsReqFactor + this.#company_profit);
    }
    
    calculateSuggestedPrice() {
        return this.#curr_ppg * this.calculateMargin();
    }

    // Method to calculate discount rate
    calculateTotal() {
        return this.calculateSuggestedPrice() * this.#gallonsRequested;
    }
}

module.exports = PricingModule;