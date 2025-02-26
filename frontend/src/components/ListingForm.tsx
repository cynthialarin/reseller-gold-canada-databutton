import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useListingStore } from "../utils/listing-store";
import brain from "brain";
import { BarcodeScanner } from "./BarcodeScanner";
import { ImageUpload } from "./ImageUpload";

const formSchema = z.object({
  barcode: z.string().optional(),
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  condition: z.string().min(1, "Please select a condition"),
  price: z.string().min(1, "Please enter a price"),
  marketplace: z.string().min(1, "Please select a marketplace"),
  images: z.array(z.string()).min(1, "Please upload at least one image"),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  onSubmit?: (data: FormData) => void;
  onSaveDraft?: (data: FormData) => void;
  initialData?: {
    title?: string;
    description?: string;
    condition?: string;
    price?: string;
    marketplace?: string;
    images?: string[];
  };
}

export function ListingForm({ onSubmit, onSaveDraft, initialData }: Props) {
  const [scannerOpen, setScannerOpen] = React.useState(false);
  const [lookingUp, setLookingUp] = React.useState(false);
  const [images, setImages] = React.useState<string[]>([]);
  const [generating, setGenerating] = React.useState(false);
  const [analyzing, setAnalyzing] = React.useState(false);
  const [priceAnalysis, setPriceAnalysis] = React.useState<any>(null);
  const [analyzingPrice, setAnalyzingPrice] = React.useState(false);
  const [priceDialogOpen, setPriceDialogOpen] = React.useState(false);
  const [uploading, setUploading] = React.useState(false);
  const { uploadImages } = useListingStore();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      barcode: "",
      title: initialData?.title || "",
      description: initialData?.description || "",
      condition: initialData?.condition || "",
      price: initialData?.price || "",
      marketplace: initialData?.marketplace || "",
      images: initialData?.images || [],
    },
  });

  // Auto-generate content when form data changes
  const generateContent = React.useCallback(async () => {
    const title = form.getValues("title");
    const condition = form.getValues("condition");
    
    if (!title) return;

    try {
      setGenerating(true);
      
      // Generate description
      const descResponse = await brain.generate_description({
        product_name: title,
        condition: condition,
      });
      const descData = await descResponse.json();
      form.setValue("description", descData.description);

      // Analyze price
      const priceResponse = await brain.analyze_price({
        body: {
          keywords: title,
          condition: condition,
        }
      });
      const priceData = await priceResponse.json();
      setPriceAnalysis(priceData);
      form.setValue("price", priceData.suggested_price.toString());

    } catch (error: any) {
      console.error('Error generating content:', error);
      toast.error("Failed to generate some content");
    } finally {
      setGenerating(false);
    }
  }, [form]);

  // Auto-analyze condition when image is uploaded
  const analyzeImageCondition = React.useCallback(async (imageUrl: string) => {
    try {
      setAnalyzing(true);
      const response = await brain.analyze_condition({
        image_url: imageUrl,
        product_name: form.getValues("title") || "product",
      });
      const data = await response.json();
      form.setValue("condition", data.condition);
      
      // After condition is set, generate other content
      await generateContent();
    } catch (error: any) {
      console.error('Error analyzing condition:', error);
      toast.error("Failed to analyze condition");
    } finally {
      setAnalyzing(false);
    }
  }, [form, generateContent]);

  React.useEffect(() => {
    if (initialData) {
      if (initialData.images?.length) {
        setImages(initialData.images);
        // Analyze first image for condition
        analyzeImageCondition(initialData.images[0]);
      }
      Object.entries(initialData).forEach(([key, value]) => {
        if (value) {
          form.setValue(key as keyof FormData, value);
        }
      });
    }
  }, [initialData, form, analyzeImageCondition]);

  // Watch for title and condition changes
  React.useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if ((name === "title" || name === "condition") && value.title) {
        generateContent();
      }
    });
    return () => subscription.unsubscribe();
  }, [form, generateContent]);

  const handleScan = async (barcode: string) => {
    setScannerOpen(false);
    setLookingUp(true);

    try {
      const response = await brain.lookup_product({
        body: { barcode },
      });
      const data = await response.json();

      // Update form with product details
      form.setValue("barcode", barcode);
      form.setValue("title", data.name || "");
      form.setValue("description", data.description || "");
      
      if (data.images?.length) {
        const imageUrls = data.images.map((img: any) => img.url);
        setImages(imageUrls);
        form.setValue("images", imageUrls);
      }

      toast.success("Product found!");
    } catch (error: any) {
      toast.error(error.message || "Failed to find product");
    } finally {
      setLookingUp(false);
    }
  };

  const handleImageUpload = async (imageUrl: string) => {
    setImages(prev => [...prev, imageUrl]);
    form.setValue("images", [...images, imageUrl]);
    
    // Analyze condition when first image is uploaded
    if (images.length === 0) {
      await analyzeImageCondition(imageUrl);
    }
  };

  const handleImageUploadLegacy = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.length) return;

    try {
      setUploading(true);
      const files = Array.from(e.target.files);
      const urls = await uploadImages(files);
      setImages(prev => [...prev, ...urls]);
      form.setValue("images", [...images, ...urls]);
      toast.success("Images uploaded successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to upload images");
    } finally {
      setUploading(false);
    }
  };

  const generateTitle = async () => {
    try {
      setGenerating(true);
      const response = await brain.generate_title({
        product_name: form.getValues("title") || "product",
        condition: form.getValues("condition"),
      });
      const data = await response.json();
      form.setValue("title", data.title);
      toast.success("Title generated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate title");
    } finally {
      setGenerating(false);
    }
  };

  const generateDescription = async () => {
    try {
      setGenerating(true);
      const response = await brain.generate_description({
        product_name: form.getValues("title") || "product",
        condition: form.getValues("condition"),
      });
      const data = await response.json();
      form.setValue("description", data.description);
      toast.success("Description generated successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate description");
    } finally {
      setGenerating(false);
    }
  };

  const analyzeCondition = async () => {
    if (!images.length) {
      toast.error("Please upload an image first");
      return;
    }

    try {
      setAnalyzing(true);
      const response = await brain.analyze_condition({
        image_url: images[0],
        product_name: form.getValues("title") || "product",
      });
      const data = await response.json();
      form.setValue("condition", data.condition);
      toast.success("Condition analyzed successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to analyze condition");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleSubmit = (data: FormData) => {
    onSubmit?.(data);
  };

  const handleSaveDraft = () => {
    const data = form.getValues();
    onSaveDraft?.(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-8">
        <Card className="p-6">
          <div className="flex gap-4 mb-4">
            <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
              <DialogTrigger asChild>
                <Button type="button" variant="outline" disabled={lookingUp}>
                  {lookingUp ? "Looking up product..." : "Scan Barcode"}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <BarcodeScanner
                  onScan={handleScan}
                  onClose={() => setScannerOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter product title" {...field} />
                  </FormControl>
                  <FormDescription>
                    Enter a title or scan a barcode to get started. Content will be generated automatically.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Description will be generated automatically"
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Description is generated automatically based on the title and condition.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="condition"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condition</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select condition" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="like_new">Like New</SelectItem>
                        <SelectItem value="very_good">Very Good</SelectItem>
                        <SelectItem value="good">Good</SelectItem>
                        <SelectItem value="fair">Fair</SelectItem>
                        <SelectItem value="poor">Poor</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Price will be suggested automatically" 
                          {...field} 
                        />
                      </FormControl>
                      <Dialog open={priceDialogOpen} onOpenChange={setPriceDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            onClick={async () => {
                              if (!form.getValues("title")) {
                                toast.error("Please enter a title first");
                                return;
                              }
                              setAnalyzingPrice(true);
                              try {
                                const response = await brain.analyze_price({
                                  body: {
                                    keywords: form.getValues("title"),
                                    condition: form.getValues("condition"),
                                  }
                                });
                                const data = await response.json();
                                setPriceAnalysis(data);
                                form.setValue("price", data.suggested_price.toString());
                              } catch (error: any) {
                                toast.error(error.message || "Failed to analyze price");
                              } finally {
                                setAnalyzingPrice(false);
                              }
                            }}
                            disabled={analyzingPrice}
                          >
                            {analyzingPrice ? "Analyzing..." : "Analyze Price"}
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-3xl">
                          <DialogHeader>
                            <DialogTitle>Price Analysis</DialogTitle>
                            <DialogDescription>
                              Market analysis and price recommendations
                            </DialogDescription>
                          </DialogHeader>
                          {priceAnalysis && (
                            <div className="space-y-6">
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 bg-gray-900 rounded-lg">
                                  <p className="text-sm text-gray-400">Suggested Price</p>
                                  <p className="text-2xl font-bold">${priceAnalysis.suggested_price}</p>
                                </div>
                                <div className="p-4 bg-gray-900 rounded-lg">
                                  <p className="text-sm text-gray-400">Price Range</p>
                                  <p className="text-2xl font-bold">
                                    ${priceAnalysis.price_range.min} - ${priceAnalysis.price_range.max}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="space-y-2">
                                <h3 className="text-lg font-semibold">Market Trends</h3>
                                <div className="space-y-2">
                                  {priceAnalysis.market_trends.map((trend: any) => (
                                    <div key={trend.period} className="p-4 bg-gray-900 rounded-lg">
                                      <div className="flex justify-between items-center">
                                        <div>
                                          <p className="text-sm text-gray-400 capitalize">{trend.period}ly Average</p>
                                          <p className="text-xl font-bold">${trend.average_price}</p>
                                        </div>
                                        <div className="text-right">
                                          <p className="text-sm text-gray-400">Price Change</p>
                                          <p className={`text-xl font-bold ${trend.price_change >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                                            {trend.price_change >= 0 ? '+' : ''}{trend.price_change}%
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-2">
                                <h3 className="text-lg font-semibold">Active Competitors</h3>
                                <div className="overflow-x-auto">
                                  <table className="w-full">
                                    <thead>
                                      <tr className="border-b border-gray-800">
                                        <th className="text-left py-2">Title</th>
                                        <th className="text-left py-2">Price</th>
                                        <th className="text-left py-2">Platform</th>
                                        <th className="text-left py-2">Condition</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {priceAnalysis.active_competitors.map((competitor: any, index: number) => (
                                        <tr key={index} className="border-b border-gray-800">
                                          <td className="py-2">
                                            <a
                                              href={competitor.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-500 hover:text-blue-400"
                                            >
                                              {competitor.title}
                                            </a>
                                          </td>
                                          <td className="py-2">${competitor.price}</td>
                                          <td className="py-2">{competitor.platform}</td>
                                          <td className="py-2">{competitor.condition}</td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="marketplace"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Marketplace</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select marketplace" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="poshmark">Poshmark</SelectItem>
                      <SelectItem value="ebay">eBay</SelectItem>
                      <SelectItem value="etsy">Etsy</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="images"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Images</FormLabel>
                  <FormControl>
                    <div className="space-y-4">
                      <ImageUpload onUpload={handleImageUpload} />
                      {images.length > 0 && (
                        <div className="grid grid-cols-4 gap-4">
                          {images.map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Product image ${index + 1}`}
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          ))}
                        </div>
                      )}
                      <FormDescription>
                        Upload images to automatically analyze condition and generate listing details.
                      </FormDescription>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={handleSaveDraft}>
            Save Draft
          </Button>
          <Button type="submit">Publish Listing</Button>
        </div>
      </form>
    </Form>
  );
}
