import {
  AnalyzeConditionData,
  AnalyzeConditionError,
  AnalyzeConditionRequest,
  AnalyzePriceData,
  AnalyzePriceError,
  CheckHealthData,
  GenerateDescriptionData,
  GenerateDescriptionError,
  GenerateDescriptionRequest,
  GenerateTitleData,
  GenerateTitleError,
  GenerateTitleRequest,
  GetAnalyticsSummaryData,
  LookupProductData,
  LookupProductError,
  PriceAnalysisRequest,
  ProcessImageRequest,
  ProcessProductImageData,
  ProcessProductImageError,
  ProductLookupRequest,
} from "./data-contracts";
import { ContentType, HttpClient, RequestParams } from "./http-client";

export class Brain<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   *
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  check_health = (params: RequestParams = {}) =>
    this.request<CheckHealthData, any>({
      path: `/_healthz`,
      method: "GET",
      ...params,
    });

  /**
   * @description Look up product details by barcode
   *
   * @tags dbtn/module:product_lookup
   * @name lookup_product
   * @summary Lookup Product
   * @request POST:/routes/lookup
   */
  lookup_product = (data: ProductLookupRequest, params: RequestParams = {}) =>
    this.request<LookupProductData, LookupProductError>({
      path: `/routes/lookup`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Process a product image: remove background and/or make square
   *
   * @tags dbtn/module:product_lookup
   * @name process_product_image
   * @summary Process Product Image
   * @request POST:/routes/process-image
   */
  process_product_image = (data: ProcessImageRequest, params: RequestParams = {}) =>
    this.request<ProcessProductImageData, ProcessProductImageError>({
      path: `/routes/process-image`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Get comprehensive analytics summary with mock data
   *
   * @tags dbtn/module:analytics
   * @name get_analytics_summary
   * @summary Get Analytics Summary
   * @request GET:/routes/summary
   */
  get_analytics_summary = (params: RequestParams = {}) =>
    this.request<GetAnalyticsSummaryData, any>({
      path: `/routes/summary`,
      method: "GET",
      ...params,
    });

  /**
   * @description Generate an SEO-friendly title for a product listing using NLTK
   *
   * @tags dbtn/module:listing_ai
   * @name generate_title
   * @summary Generate Title
   * @request POST:/routes/generate-title
   */
  generate_title = (data: GenerateTitleRequest, params: RequestParams = {}) =>
    this.request<GenerateTitleData, GenerateTitleError>({
      path: `/routes/generate-title`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Generate a detailed description for a product listing using templates
   *
   * @tags dbtn/module:listing_ai
   * @name generate_description
   * @summary Generate Description
   * @request POST:/routes/generate-description
   */
  generate_description = (data: GenerateDescriptionRequest, params: RequestParams = {}) =>
    this.request<GenerateDescriptionData, GenerateDescriptionError>({
      path: `/routes/generate-description`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Analyze product condition from image using OpenCV
   *
   * @tags dbtn/module:listing_ai
   * @name analyze_condition
   * @summary Analyze Condition
   * @request POST:/routes/analyze-condition
   */
  analyze_condition = (data: AnalyzeConditionRequest, params: RequestParams = {}) =>
    this.request<AnalyzeConditionData, AnalyzeConditionError>({
      path: `/routes/analyze-condition`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });

  /**
   * @description Analyze market prices and provide recommendations
   *
   * @tags dbtn/module:price_analysis
   * @name analyze_price
   * @summary Analyze Price
   * @request POST:/routes/analyze-price
   */
  analyze_price = (data: PriceAnalysisRequest, params: RequestParams = {}) =>
    this.request<AnalyzePriceData, AnalyzePriceError>({
      path: `/routes/analyze-price`,
      method: "POST",
      body: data,
      type: ContentType.Json,
      ...params,
    });
}
