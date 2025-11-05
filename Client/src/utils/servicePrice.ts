import { Service } from '../types/service';

const CONVERSION_RATE = 1.95583;

/**
 * Gets the BGN price for a service, with fallback to old price field
 */
export const getServicePriceBGN = (service: Service | undefined | null): number => {
  if (!service) return 0;
  if (service.priceBGN !== undefined && service.priceBGN !== null) {
    return service.priceBGN;
  }
  return service.price ?? 0;
};

/**
 * Gets the EUR price for a service, with fallback to calculated price from old price field
 */
export const getServicePriceEUR = (service: Service | undefined | null): number => {
  if (!service) return 0;
  if (service.priceEUR !== undefined && service.priceEUR !== null) {
    return service.priceEUR;
  }
  return (service.price ?? 0) / CONVERSION_RATE;
};

/**
 * Formats a price in BGN (returns number with 2 decimals, currency symbol is added in JSX)
 */
export const formatPriceBGN = (price: number): string => {
  return price.toFixed(2);
};

/**
 * Formats a price in EUR (returns number with 2 decimals, currency symbol is added in JSX)
 */
export const formatPriceEUR = (price: number): string => {
  return price.toFixed(2);
};

