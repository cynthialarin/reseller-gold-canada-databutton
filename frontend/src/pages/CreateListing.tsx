import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../utils/auth-store";
import { useListingStore } from "../utils/listing-store";
import { ListingForm } from "../components/ListingForm";
import { ImageCapture } from "../components/ImageCapture";
import { Layout } from "../components/Layout";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import brain from "brain";

export default function CreateListing() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { createListing, loadListings, listings, loading } = useListingStore();
  const [step, setStep] = React.useState<'capture' | 'form'>('capture');
  const [imageData, setImageData] = React.useState<string>();
  const [productInfo, setProductInfo] = React.useState<any>();

  React.useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    loadListings().catch(error => {
      toast.error(error.message || "Failed to load listings");
    });
  }, [user, navigate]);

  const handlePublish = async (data: any) => {
    try {
      await createListing({
        ...data,
        status: "published",
        price: parseFloat(data.price)
      });
      toast.success("Listing published successfully");
      navigate("/listings");
    } catch (error: any) {
      toast.error(error.message || "Failed to publish listing");
    }
  };

  const handleSaveDraft = async (data: any) => {
    try {
      await createListing({
        ...data,
        status: "draft",
        price: parseFloat(data.price)
      });
      toast.success("Draft saved successfully");
      navigate("/listings");
    } catch (error: any) {
      toast.error(error.message || "Failed to save draft");
    }
  };

  const handleImageCaptured = async (imageData: string) => {
    setImageData(imageData);
    try {
      // Analyze condition
      const conditionResponse = await brain.analyze_condition({
        body: {
          image_url: imageData
        }
      });
      const conditionData = await conditionResponse.json();

      setProductInfo(prev => ({
        ...prev,
        condition: conditionData.condition,
        conditionDetails: conditionData.details
      }));

      setStep('form');
    } catch (error: any) {
      toast.error('Failed to analyze image');
      console.error('Image analysis error:', error);
      setStep('form');
    }
  };

  const handleBarcodeScanned = async (barcode: string) => {
    try {
      const response = await brain.lookup_product({
        body: { barcode }
      });
      const data = await response.json();
      setProductInfo(data);
      setStep('form');
    } catch (error: any) {
      toast.error('Failed to lookup product');
      console.error('Barcode lookup error:', error);
      setStep('form');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <Layout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Create New Listing</h1>
          <Button variant="outline" onClick={() => navigate("/listings")}>
            View All Listings
          </Button>
        </div>

        {step === 'capture' ? (
          <div className="max-w-2xl mx-auto">
            <Card className="p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4">Start Your Listing</h2>
              <p className="text-gray-400 mb-6">
                Upload a photo, take a picture, or scan a UPC code to get started.
                Our AI will help you create the perfect listing.
              </p>
            </Card>
            <ImageCapture
              onImageCaptured={handleImageCaptured}
              onBarcodeScanned={handleBarcodeScanned}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <ListingForm
                onSubmit={handlePublish}
                onSaveDraft={handleSaveDraft}
                initialData={{
                  ...productInfo,
                  images: imageData ? [imageData] : []
                }}
              />
            </div>

            <div className="space-y-4">
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">AI Assistance</h2>
                <div className="prose dark:prose-invert">
                  <p>
                    Our AI assistant can help you create better listings:
                  </p>
                  <ul className="list-disc list-inside">
                    <li>Generate SEO-friendly titles</li>
                    <li>Write detailed descriptions</li>
                    <li>Analyze product conditions from images</li>
                    <li>Suggest optimal pricing (coming soon)</li>
                  </ul>
                  <p className="text-sm text-muted-foreground mt-4">
                    Click the AI buttons next to each field to get suggestions.
                  </p>
                </div>
              </Card>

              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4">Recent Drafts</h2>
                {loading ? (
                  <p>Loading drafts...</p>
                ) : listings.filter(l => l.status === "draft").length === 0 ? (
                  <p className="text-muted-foreground">No drafts yet</p>
                ) : (
                  <ul className="space-y-2">
                    {listings
                      .filter(l => l.status === "draft")
                      .slice(0, 5)
                      .map(listing => (
                        <li key={listing.id} className="text-sm">
                          {listing.title || "Untitled"}
                        </li>
                      ))}
                  </ul>
                )}
              </Card>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
