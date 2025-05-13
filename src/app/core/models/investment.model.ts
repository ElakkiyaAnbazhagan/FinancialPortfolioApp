export interface Investment {
  id: number; // Unique identifier, typically assigned by the backend or a service
  assetName: string; // Name or ticker symbol of the asset (e.g., "Apple Inc.", "AAPL")
  assetType:
    | 'Stock'
    | 'Bond'
    | 'Crypto'
    | 'ETF'
    | 'MutualFund'
    | 'RealEstate'
    | 'Other'; // Type of the asset
  quantity: number; // Number of units/shares held
  purchasePrice: number; // Price per unit/share at the time of purchase
  purchaseDate: string; // Date of purchase, typically in ISO format (e.g., "2023-10-26")
  currentPrice?: number; // Optional: Current market price per unit/share for calculating current value
}

export interface PortfolioSummary {
  totalPortfolioValue: number;
  totalGainLoss: number;
  numberOfAssets: number;
}

export interface ChartDataset {
  data: number[];
  label: string;
  backgroundColor?: string | string[];
  borderColor?: string | string[];
  tension?: number;
  fill?: boolean;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}
