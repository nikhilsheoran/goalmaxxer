/**
 * Utility functions for calculating stock growth based on historical data
 */

import { fetchStockData } from "../actions/serverActions";

// Interface for stock growth calculation result
export interface StockGrowthResult {
  growthPercentage: number;
  currentValue: number;
  latestPrice: number;
  historicalPrice: number;
  historicalDate: Date;
  message: string;
  success: boolean;
}

/**
 * Calculate stock growth by comparing historical price on purchase date with current price
 */
export async function calculateStockGrowth(
  symbol: string,
  purchaseDate: Date,
  quantity: number
): Promise<StockGrowthResult> {
  try {
    // Check if purchase date is valid
    if (isNaN(purchaseDate.getTime())) {
      return {
        growthPercentage: 0,
        currentValue: 0,
        latestPrice: 0,
        historicalPrice: 0,
        historicalDate: new Date(),
        message: `Invalid purchase date for ${symbol}`,
        success: false
      };
    }
    
    // Ensure purchase date is not in the future
    const validPurchaseDate = purchaseDate > new Date() ? new Date() : purchaseDate;
    
    // Calculate timestamps
    const now = Math.floor(Date.now() / 1000);
    const purchaseDateTimestamp = Math.floor(validPurchaseDate.getTime() / 1000);
    
    // Calculate a range around the purchase date (1 week before and after)
    // This gives us a better chance of getting data as some days might not have trading
    const purchaseDateRangeStart = purchaseDateTimestamp - (7 * 24 * 60 * 60); // 7 days before
    const purchaseDateRangeEnd = purchaseDateTimestamp + (7 * 24 * 60 * 60); // 7 days after
    
    console.log(`Fetching historical data for ${symbol} around purchase date: ${validPurchaseDate.toLocaleDateString()}`);
    
    // Fetch historical data for purchase date
    const historicalData = await fetchStockData(
      symbol, 
      purchaseDateRangeStart, 
      purchaseDateRangeEnd, 
      "1d"
    );
    
    // Fetch current price data (last 30 days)
    const thirtyDaysAgo = now - (30 * 24 * 60 * 60);
    console.log(`Fetching current data for ${symbol} from ${new Date(thirtyDaysAgo * 1000).toLocaleDateString()} to now`);
    
    const currentData = await fetchStockData(
      symbol,
      thirtyDaysAgo,
      now,
      "1d"
    );
    
    // Check if we have valid data
    if (
      !historicalData || 
      !historicalData.prices || 
      historicalData.prices.length === 0 ||
      !currentData || 
      !currentData.prices || 
      currentData.prices.length === 0
    ) {
      return {
        growthPercentage: 0,
        currentValue: 0,
        latestPrice: 0,
        historicalPrice: 0,
        historicalDate: new Date(),
        message: `Could not get complete historical and current data for ${symbol}`,
        success: false
      };
    }
    
    // Find the price point closest to the purchase date
    let closestPricePoint = historicalData.prices[0];
    let minTimeDiff = Infinity;
    
    for (const pricePoint of historicalData.prices) {
      const timeDiff = Math.abs(pricePoint.date - purchaseDateTimestamp);
      if (timeDiff < minTimeDiff) {
        minTimeDiff = timeDiff;
        closestPricePoint = pricePoint;
      }
    }
    
    // Get the latest current price
    const latestPrice = currentData.prices[currentData.prices.length - 1].close;
    
    // Get the historical price at purchase
    const historicalPrice = closestPricePoint.close;
    const historicalDate = new Date(closestPricePoint.date * 1000);
    
    // Make sure we have valid data
    if (
      latestPrice === null || 
      isNaN(latestPrice) || 
      historicalPrice === null || 
      isNaN(historicalPrice) ||
      historicalPrice <= 0
    ) {
      return {
        growthPercentage: 0,
        currentValue: 0,
        latestPrice: 0,
        historicalPrice: 0,
        historicalDate: new Date(),
        message: `Invalid price data for ${symbol}`,
        success: false
      };
    }
    
    // Calculate the current value based on quantity and latest price
    const currentValue = quantity * latestPrice;
    
    // Calculate the growth percentage from actual historical price to current price
    let growthPercentage = ((latestPrice - historicalPrice) / historicalPrice) * 100;
    
    // Safeguard against NaN, Infinity or extreme values
    if (isNaN(growthPercentage) || !isFinite(growthPercentage)) {
      return {
        growthPercentage: 0,
        currentValue,
        latestPrice,
        historicalPrice,
        historicalDate,
        message: `Invalid growth calculation for ${symbol}`,
        success: false
      };
    }
    
    if (Math.abs(growthPercentage) > 1000) {
      // Cap extremely large growth values at 1000% to avoid display issues
      growthPercentage = growthPercentage > 0 ? 1000 : -1000;
    }
    
    const message = `${symbol}: Purchase price on ${historicalDate.toLocaleDateString()}: ${historicalPrice}, Current price: ${latestPrice}, Growth: ${growthPercentage.toFixed(2)}%`;
    console.log(message);
    
    return {
      growthPercentage,
      currentValue,
      latestPrice,
      historicalPrice,
      historicalDate,
      message,
      success: true
    };
  } catch (error) {
    console.error(`Error calculating stock growth for ${symbol}:`, error);
    return {
      growthPercentage: 0,
      currentValue: 0,
      latestPrice: 0,
      historicalPrice: 0,
      historicalDate: new Date(),
      message: `Error calculating growth for ${symbol}: ${error}`,
      success: false
    };
  }
} 