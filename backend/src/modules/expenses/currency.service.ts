import axios from 'axios';

/**
 * Service to handle real-time currency conversion using ExchangeRate-API.
 * Features:
 * - Real-time fetching from v6 API
 * - Local caching to prevent excessive API calls
 * - Robust error handling with fallback to 1:1 if service is down
 */
export class CurrencyService {
  private apiKey: string;
  private baseUrl: string;
  private cache: Map<string, { rate: number; expires: number }>;
  private CACHE_DURATION = 1000 * 60 * 60 * 24; // 24 hours

  constructor() {
    this.apiKey = process.env.EXCHANGE_RATE_API_KEY || '';
    this.baseUrl = `https://v6.exchangerate-api.com/v6/${this.apiKey}`;
    this.cache = new Map();
  }

  /**
   * Gets the exchange rate from one currency to another.
   * Format: from_to (e.g., USD_INR)
   */
  async getExchangeRate(from: string, to: string): Promise<number> {
    if (from === to) return 1.0;

    const cacheKey = `${from}_${to}`;
    const cached = this.cache.get(cacheKey);

    if (cached && cached.expires > Date.now()) {
      return cached.rate;
    }

    try {
      console.log(`[Currency] Fetching real-time rate: ${from} -> ${to}`);
      const response = await axios.get(`${this.baseUrl}/pair/${from}/${to}`);
      
      if (response.data.result === 'success') {
        const rate = response.data.conversion_rate;
        this.cache.set(cacheKey, {
          rate,
          expires: Date.now() + this.CACHE_DURATION,
        });
        return rate;
      }
      
      throw new Error(response.data['error-type'] || 'Unknown API error');
    } catch (error: any) {
      console.error(`[Currency] Error fetching rate (${from}->${to}):`, error.message);
      // Fallback: If API fails, return 1.0 but log warning
      return 1.0; 
    }
  }

  /**
   * Converts an amount from one currency to another.
   */
  async convert(amount: number, from: string, to: string): Promise<number> {
    const rate = await this.getExchangeRate(from, to);
    return parseFloat((amount * rate).toFixed(2));
  }
}

export const currencyService = new CurrencyService();
