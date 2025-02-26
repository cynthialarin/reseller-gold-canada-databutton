/** AnalyticsSummary */
export interface AnalyticsSummary {
  /** Total Revenue */
  total_revenue: number;
  /** Total Sales */
  total_sales: number;
  /** Average Price */
  average_price: number;
  /** Profit Margin */
  profit_margin: number;
  /** Platform Metrics */
  platform_metrics: SalesByPlatform[];
  inventory_metrics: InventoryMetrics;
  /** Revenue Trend */
  revenue_trend: TimeSeriesPoint[];
  /** Sales Trend */
  sales_trend: TimeSeriesPoint[];
  /** Platform Revenue Breakdown */
  platform_revenue_breakdown: PlatformBreakdown[];
  /** Top Categories */
  top_categories: PlatformBreakdown[];
}

/** AnalyzeConditionRequest */
export interface AnalyzeConditionRequest {
  /** Image Url */
  image_url: string;
  /** Product Name */
  product_name?: string | null;
  /** Category */
  category?: string | null;
}

/** AnalyzeConditionResponse */
export interface AnalyzeConditionResponse {
  /** Condition */
  condition: string;
  /** Details */
  details: string;
  /** Confidence */
  confidence: number;
}

/** CompetitorListing */
export interface CompetitorListing {
  /** Title */
  title: string;
  /** Price */
  price: number;
  /** Platform */
  platform: string;
  /** Condition */
  condition?: string | null;
  /** Url */
  url: string;
  /** Date Listed */
  date_listed: string;
}

/** GenerateDescriptionRequest */
export interface GenerateDescriptionRequest {
  /** Product Name */
  product_name: string;
  /** Category */
  category?: string | null;
  /** Brand */
  brand?: string | null;
  /** Condition */
  condition?: string | null;
  /** Key Features */
  key_features?: string[] | null;
  /** Style */
  style?: string | null;
}

/** GenerateDescriptionResponse */
export interface GenerateDescriptionResponse {
  /** Description */
  description: string;
}

/** GenerateTitleRequest */
export interface GenerateTitleRequest {
  /** Product Name */
  product_name: string;
  /** Category */
  category?: string | null;
  /** Brand */
  brand?: string | null;
  /** Condition */
  condition?: string | null;
  /** Key Features */
  key_features?: string[] | null;
}

/** GenerateTitleResponse */
export interface GenerateTitleResponse {
  /** Title */
  title: string;
}

/** HTTPValidationError */
export interface HTTPValidationError {
  /** Detail */
  detail?: ValidationError[];
}

/** HealthResponse */
export interface HealthResponse {
  /** Status */
  status: string;
}

/** InventoryMetrics */
export interface InventoryMetrics {
  /** Total Items */
  total_items: number;
  /** Active Listings */
  active_listings: number;
  /** Sold Items */
  sold_items: number;
  /** Average Days To Sell */
  average_days_to_sell: number;
  /** Turnover Rate */
  turnover_rate: number;
}

/** MarketTrend */
export interface MarketTrend {
  /** Period */
  period: string;
  /** Average Price */
  average_price: number;
  /** Volume */
  volume: number;
  /** Price Change */
  price_change: number;
}

/** PlatformBreakdown */
export interface PlatformBreakdown {
  /** Platform */
  platform: string;
  /** Value */
  value: number;
  /** Percentage */
  percentage: number;
}

/** PriceAnalysisRequest */
export interface PriceAnalysisRequest {
  /** Keywords */
  keywords: string;
  /** Category */
  category?: string | null;
  /** Condition */
  condition?: string | null;
  /** Brand */
  brand?: string | null;
}

/** PriceAnalysisResponse */
export interface PriceAnalysisResponse {
  /** Suggested Price */
  suggested_price: number;
  /** Price Range */
  price_range: Record<string, number>;
  /** Confidence Score */
  confidence_score: number;
  /** Market Trends */
  market_trends: MarketTrend[];
  /** Price History */
  price_history: PricePoint[];
  /** Active Competitors */
  active_competitors: CompetitorListing[];
  /** Best Day To List */
  best_day_to_list: string;
  /** Best Time To List */
  best_time_to_list: string;
}

/** PricePoint */
export interface PricePoint {
  /** Price */
  price: number;
  /** Date */
  date: string;
  /** Platform */
  platform: string;
  /** Condition */
  condition?: string | null;
  /**
   * Sold
   * @default false
   */
  sold?: boolean;
}

/** ProcessImageRequest */
export interface ProcessImageRequest {
  /** Image Data */
  image_data: string;
  /**
   * Remove Background
   * @default false
   */
  remove_background?: boolean;
  /**
   * Make Square
   * @default true
   */
  make_square?: boolean;
}

/** ProcessImageResponse */
export interface ProcessImageResponse {
  /** Processed Image */
  processed_image: string;
}

/** ProductDetails */
export interface ProductDetails {
  /** Name */
  name: string;
  /** Brand */
  brand?: string | null;
  /** Category */
  category?: string | null;
  /** Description */
  description?: string | null;
  /**
   * Images
   * @default []
   */
  images?: ProductImage[];
  /** Barcode */
  barcode?: string | null;
}

/** ProductImage */
export interface ProductImage {
  /** Url */
  url: string;
  /**
   * Is Primary
   * @default false
   */
  is_primary?: boolean;
}

/** ProductLookupRequest */
export interface ProductLookupRequest {
  /** Barcode */
  barcode: string;
}

/** SalesByPlatform */
export interface SalesByPlatform {
  /** Platform */
  platform: string;
  /** Total Sales */
  total_sales: number;
  /** Total Revenue */
  total_revenue: number;
  /** Average Price */
  average_price: number;
  /** Growth Rate */
  growth_rate: number;
}

/** TimeSeriesPoint */
export interface TimeSeriesPoint {
  /** Date */
  date: string;
  /** Value */
  value: number;
}

/** ValidationError */
export interface ValidationError {
  /** Location */
  loc: (string | number)[];
  /** Message */
  msg: string;
  /** Error Type */
  type: string;
}

export type CheckHealthData = HealthResponse;

export type LookupProductData = ProductDetails;

export type LookupProductError = HTTPValidationError;

export type ProcessProductImageData = ProcessImageResponse;

export type ProcessProductImageError = HTTPValidationError;

export type GetAnalyticsSummaryData = AnalyticsSummary;

export type GenerateTitleData = GenerateTitleResponse;

export type GenerateTitleError = HTTPValidationError;

export type GenerateDescriptionData = GenerateDescriptionResponse;

export type GenerateDescriptionError = HTTPValidationError;

export type AnalyzeConditionData = AnalyzeConditionResponse;

export type AnalyzeConditionError = HTTPValidationError;

export type AnalyzePriceData = PriceAnalysisResponse;

export type AnalyzePriceError = HTTPValidationError;
