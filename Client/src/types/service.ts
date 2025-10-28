export interface Service {
    _id: string;
    name: string;
    description: string;
    image?: string;
    duration: number;
    price?: number; // Old field for backward compatibility
    priceEUR?: number;
    priceBGN?: number;
    sortOrder?: number;
}
  