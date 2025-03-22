import { AssetType, RiskLevel, PeriodType } from "@prisma/client";

export interface AssetSearchParams {
  query?: string;
  assetTypes?: AssetType[];
  riskLevels?: RiskLevel[];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface AssetMetrics {
    totalAssets: number;
    assetTypeDistribution: Record<AssetType, number>;
    topPerformers: {assetId: string; name: string; return: number;}[];
    totalMarketValue: number;
    priceChanges: Record<PeriodType, number>;
}

export interface AssetComparison {
  assets: {
    assetId: string;
    name: string;
    type: AssetType;
    price: number;
    returns: Record<PeriodType, number>;
    riskMetrics: {
      volatility: number;
      beta: number;
    };
    expenseRatio?: number;
    dividendYield?: number;
  }[];
}