import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { PriceAnalysis } from "components/PriceAnalysis";
import brain from "brain";
import { toast } from "sonner";

interface AnalysisResult {
  condition?: string;
  wear_level?: string;
  defects?: string[];
  quality_score?: number;
  dimensions?: {
    length?: number;
    width?: number;
    height?: number;
    unit?: string;
  };
  weight?: {
    value?: number;
    unit?: string;
  };
  materials?: string[];
  style?: string;
  pattern?: string;
  color?: string;
}

interface GeneratedContent {
  title?: string;
  description?: string;
  suggestedPrice?: number;
  itemSpecifics?: {
    brand?: string;
    size?: string;
    style?: string;
    color?: string;
    pattern?: string;
    material?: string;
    gender?: string;
    season?: string;
  };
  shippingDetails?: {
    weight?: string;
    dimensions?: string;
    service?: string;
    handling_time?: string;
  };
  seoKeywords?: string[];
  returnPolicy?: string;
}

export default function Listing() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResult | null>(null);
  const [generated, setGenerated] = useState<GeneratedContent>({});
  const [category, setCategory] = useState("");
  const [brand, setBrand] = useState("");
  const [keyFeatures, setKeyFeatures] = useState<string[]>([]);
  const [itemSpecifics, setItemSpecifics] = useState<GeneratedContent['itemSpecifics']>({});
  const [shippingDetails, setShippingDetails] = useState<GeneratedContent['shippingDetails']>({});
  const [returnPolicy, setReturnPolicy] = useState('');
  const [seoKeywords, setSeoKeywords] = useState<string[]>([]);
  
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create URL for preview
      const url = URL.createObjectURL(file);
      setImageUrl(url);
      
      // Convert to base64 for API
      const reader = new FileReader();
      reader.onload = async (e) => {
        if (e.target?.result) {
          // Create a data URL for the API
          const dataUrl = e.target.result.toString();
          await analyzeImage(dataUrl);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const analyzeImage = async (imageData: string) => {
    setAnalyzing(true);
    try {
      // Validate image data format
      if (!imageData.startsWith('data:image/')) {
        throw new Error('Invalid image format');
      }

      // First process the image
      toast.info('Processing image...');
      const processResponse = await brain.process_product_image({
        body: {
          image_data: imageData.split(',')[1], // Remove data URL prefix
          make_square: true,
          remove_background: false
        }
      });
      const processedData = await processResponse.json();
      
      // Now analyze the condition
      toast.info('Analyzing condition...');
      const conditionResponse = await brain.analyze_condition({
        body: {
          image_url: processedData.processed_image,
          // Use category/brand for product name if available
          product_name: [brand?.trim(), category?.trim()]
            .filter(Boolean)
            .join(' ') || 'product',
          // Only include category if it has a value
          ...(category?.trim() ? { category: category.trim() } : {})
        }
      });
      const conditionData = await conditionResponse.json();
      setAnalysis(conditionData);

      // Extract all available features and details
      const features = [
        conditionData.condition,
        ...conditionData.defects || [],
        ...(conditionData.materials || []),
        conditionData.style,
        conditionData.color,
        conditionData.pattern,
      ].filter(Boolean);
      setKeyFeatures(features);

      // Set item specifics
      setItemSpecifics({
        brand: brand?.trim(),
        style: conditionData.style,
        color: conditionData.color,
        pattern: conditionData.pattern,
        material: conditionData.materials?.join(', '),
      });

      // Set shipping details if dimensions/weight available
      if (conditionData.dimensions || conditionData.weight) {
        setShippingDetails({
          dimensions: conditionData.dimensions ? 
            `${conditionData.dimensions.length}x${conditionData.dimensions.width}x${conditionData.dimensions.height} ${conditionData.dimensions.unit}` : 
            undefined,
          weight: conditionData.weight ? 
            `${conditionData.weight.value} ${conditionData.weight.unit}` : 
            undefined,
          service: 'Standard Shipping',
          handling_time: '1-2 business days'
        });
      }

      // Generate optimized title with SEO
      toast.info('Generating optimized title...');
      const titleResponse = await brain.generate_title({
        body: {
          product_name: category || 'product',
          ...(brand?.trim() ? { brand: brand.trim() } : {}),
          condition: conditionData.condition,
          key_features: features
        }
      });
      const titleData = await titleResponse.json();

      // Generate detailed description with SEO
      toast.info('Generating detailed description...');
      const descResponse = await brain.generate_description({
        body: {
          product_name: category || 'product',
          ...(brand?.trim() ? { brand: brand.trim() } : {}),
          condition: conditionData.condition,
          key_features: features,
          style: conditionData.style
        }
      });
      const descData = await descResponse.json();

      // Get price analysis
      toast.info('Analyzing market prices...');
      const priceResponse = await brain.analyze_price({
        body: {
          keywords: [brand?.trim(), category?.trim(), conditionData.condition]
            .filter(Boolean)
            .join(' '),
          category: category?.trim() || undefined,
          condition: conditionData.condition,
          brand: brand?.trim()
        }
      });
      const priceData = await priceResponse.json();

      // Set all generated content
      setGenerated({
        title: titleData.title,
        description: descData.description,
        suggestedPrice: priceData.suggested_price,
        itemSpecifics,
        shippingDetails,
        seoKeywords: priceData.market_trends.map(trend => trend.period),
        returnPolicy: '30 Day Returns Accepted'
      });

      toast.success("Analysis complete!");
    } catch (error) {
      console.error("Error analyzing image:", error);
      toast.error("Error analyzing image. Please try again.");
      setAnalysis(null);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Create Listing</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-6">
          {/* Image Upload */}
          <Card>
            <CardHeader>
              <CardTitle>Product Image</CardTitle>
              <CardDescription>
                Upload a clear image of your product for AI analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div
                  className="border-2 border-dashed rounded-lg p-4 text-center cursor-pointer"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {imageUrl ? (
                    <img
                      src={imageUrl}
                      alt="Product"
                      className="max-h-[300px] mx-auto"
                    />
                  ) : (
                    <div className="py-8">Click to upload image</div>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                  />
                </div>

                {analyzing && (
                  <div className="text-center text-muted-foreground">
                    Analyzing image...
                  </div>
                )}

                {analysis && (
                  <div className="space-y-2">
                    <div className="font-medium">Analysis Results:</div>
                    <div>Condition: {analysis.condition}</div>
                    <div>Quality Score: {analysis.quality_score}/10</div>
                    {analysis.defects?.length > 0 && (
                      <div>
                        Defects: {analysis.defects.join(", ")}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Enter basic product details for better AI suggestions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    placeholder="e.g. Sneakers, T-shirt"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brand">Brand</Label>
                  <Input
                    id="brand"
                    placeholder="e.g. Nike, Adidas"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          {/* Title & Description */}
          <Card>
            <CardHeader>
              <CardTitle>AI-Generated Content</CardTitle>
              <CardDescription>
                Optimized title and description based on analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={generated.title || ""}
                    onChange={(e) =>
                      setGenerated({ ...generated, title: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    rows={6}
                    value={generated.description || ""}
                    onChange={(e) =>
                      setGenerated({ ...generated, description: e.target.value })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Item Specifics */}
          <Card>
            <CardHeader>
              <CardTitle>Item Specifics</CardTitle>
              <CardDescription>
                Detailed product specifications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(itemSpecifics || {}).map(([key, value]) => (
                  <div className="space-y-2" key={key}>
                    <Label htmlFor={key}>{key.charAt(0).toUpperCase() + key.slice(1)}</Label>
                    <Input
                      id={key}
                      value={value || ''}
                      onChange={(e) =>
                        setItemSpecifics({
                          ...itemSpecifics,
                          [key]: e.target.value,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Shipping Details */}
          <Card>
            <CardHeader>
              <CardTitle>Shipping Details</CardTitle>
              <CardDescription>
                Package dimensions and shipping options
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(shippingDetails || {}).map(([key, value]) => (
                  <div className="space-y-2" key={key}>
                    <Label htmlFor={key}>
                      {key.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)
                      ).join(' ')}
                    </Label>
                    <Input
                      id={key}
                      value={value || ''}
                      onChange={(e) =>
                        setShippingDetails({
                          ...shippingDetails,
                          [key]: e.target.value,
                        })
                      }
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Return Policy */}
          <Card>
            <CardHeader>
              <CardTitle>Return Policy</CardTitle>
              <CardDescription>
                Specify your return policy details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="returnPolicy">Policy Details</Label>
                  <Textarea
                    id="returnPolicy"
                    value={returnPolicy}
                    onChange={(e) => setReturnPolicy(e.target.value)}
                    placeholder="e.g., 30 Day Returns Accepted"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* SEO Keywords */}
          <Card>
            <CardHeader>
              <CardTitle>SEO Keywords</CardTitle>
              <CardDescription>
                Optimize your listing visibility
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {seoKeywords.map((keyword, index) => (
                    <div
                      key={index}
                      className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-sm"
                    >
                      {keyword}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Market Analysis */}
          {/* Only show price analysis when we have required info */}
          {analysis && (category?.trim() || brand?.trim()) && (
            <Card>
              <CardHeader>
                <CardTitle>Market Analysis</CardTitle>
                <CardDescription>
                  Real-time price analysis and market insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PriceAnalysis
                  keywords={[
                    brand?.trim(),
                    category?.trim(),
                    analysis.condition
                  ]
                    .filter(Boolean)
                    .join(' ')}
                  category={category?.trim() || undefined}
                  condition={analysis?.condition?.trim()}
                  brand={brand?.trim() || undefined}
                  onPriceSelect={(price) =>
                    setGenerated({ ...generated, suggestedPrice: price })
                  }
                />
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
