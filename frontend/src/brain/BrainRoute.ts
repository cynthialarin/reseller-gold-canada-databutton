import {
  AnalyzeConditionData,
  AnalyzeConditionRequest,
  AnalyzePriceData,
  CheckHealthData,
  GenerateDescriptionData,
  GenerateDescriptionRequest,
  GenerateTitleData,
  GenerateTitleRequest,
  GetAnalyticsSummaryData,
  LookupProductData,
  PriceAnalysisRequest,
  ProcessImageRequest,
  ProcessProductImageData,
  ProductLookupRequest,
} from "./data-contracts";

export namespace Brain {
  /**
   * @description Check health of application. Returns 200 when OK, 500 when not.
   * @name check_health
   * @summary Check Health
   * @request GET:/_healthz
   */
  export namespace check_health {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = CheckHealthData;
  }

  /**
   * @description Look up product details by barcode
   * @tags dbtn/module:product_lookup
   * @name lookup_product
   * @summary Lookup Product
   * @request POST:/routes/lookup
   */
  export namespace lookup_product {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ProductLookupRequest;
    export type RequestHeaders = {};
    export type ResponseBody = LookupProductData;
  }

  /**
   * @description Process a product image: remove background and/or make square
   * @tags dbtn/module:product_lookup
   * @name process_product_image
   * @summary Process Product Image
   * @request POST:/routes/process-image
   */
  export namespace process_product_image {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = ProcessImageRequest;
    export type RequestHeaders = {};
    export type ResponseBody = ProcessProductImageData;
  }

  /**
   * @description Get comprehensive analytics summary with mock data
   * @tags dbtn/module:analytics
   * @name get_analytics_summary
   * @summary Get Analytics Summary
   * @request GET:/routes/summary
   */
  export namespace get_analytics_summary {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = never;
    export type RequestHeaders = {};
    export type ResponseBody = GetAnalyticsSummaryData;
  }

  /**
   * @description Generate an SEO-friendly title for a product listing using NLTK
   * @tags dbtn/module:listing_ai
   * @name generate_title
   * @summary Generate Title
   * @request POST:/routes/generate-title
   */
  export namespace generate_title {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = GenerateTitleRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateTitleData;
  }

  /**
   * @description Generate a detailed description for a product listing using templates
   * @tags dbtn/module:listing_ai
   * @name generate_description
   * @summary Generate Description
   * @request POST:/routes/generate-description
   */
  export namespace generate_description {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = GenerateDescriptionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = GenerateDescriptionData;
  }

  /**
   * @description Analyze product condition from image using OpenCV
   * @tags dbtn/module:listing_ai
   * @name analyze_condition
   * @summary Analyze Condition
   * @request POST:/routes/analyze-condition
   */
  export namespace analyze_condition {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = AnalyzeConditionRequest;
    export type RequestHeaders = {};
    export type ResponseBody = AnalyzeConditionData;
  }

  /**
   * @description Analyze market prices and provide recommendations
   * @tags dbtn/module:price_analysis
   * @name analyze_price
   * @summary Analyze Price
   * @request POST:/routes/analyze-price
   */
  export namespace analyze_price {
    export type RequestParams = {};
    export type RequestQuery = {};
    export type RequestBody = PriceAnalysisRequest;
    export type RequestHeaders = {};
    export type ResponseBody = AnalyzePriceData;
  }
}
