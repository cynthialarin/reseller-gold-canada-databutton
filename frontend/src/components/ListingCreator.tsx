import * as React from "react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BarcodeScanner } from "./BarcodeScanner";
import { ImageUpload } from "./ImageUpload";
import brain from "brain";
import { toast } from "sonner";

interface Props {
  onListingCreated: (listing: any) => void;
}

export function ListingCreator({ onListingCreated }: Props) {
  const [scannerOpen, setScannerOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [listing, setListing] = useState({
    name: "",
    brand: "",
    category: "",
    description: "",
    images: [] as string[],
    barcode: "",
  });

  const handleScan = async (barcode: string) => {
    setScannerOpen(false);
    setLoading(true);

    try {
      const response = await brain.lookup_product({
        body: { barcode },
      });
      const data = await response.json();

      // Update listing with product details
      setListing({
        ...listing,
        name: data.name || "",
        brand: data.brand || "",
        category: data.category || "",
        description: data.description || "",
        barcode: data.barcode || "",
        // Keep existing images and add new ones
        images: [
          ...listing.images,
          ...data.images.map((img: any) => img.url),
        ],
      });

      toast.success("Product found!");
    } catch (error) {
      console.error("Error looking up product:", error);
      toast.error("Failed to find product");
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (imageUrl: string) => {
    setListing({
      ...listing,
      images: [...listing.images, imageUrl],
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onListingCreated(listing);
    // Reset form
    setListing({
      name: "",
      brand: "",
      category: "",
      description: "",
      images: [],
      barcode: "",
    });
  };

  return (
    <Card className="p-6 space-y-6">
      <div className="flex gap-4">
        <Dialog open={scannerOpen} onOpenChange={setScannerOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Scan Barcode</Button>
          </DialogTrigger>
          <DialogContent>
            <BarcodeScanner
              onScan={handleScan}
              onClose={() => setScannerOpen(false)}
            />
          </DialogContent>
        </Dialog>

        <ImageUpload onUpload={handleImageUpload} />
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={listing.name}
              onChange={(e) =>
                setListing({ ...listing, name: e.target.value })
              }
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="brand">Brand</Label>
            <Input
              id="brand"
              value={listing.brand}
              onChange={(e) =>
                setListing({ ...listing, brand: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={listing.category}
              onChange={(e) =>
                setListing({ ...listing, category: e.target.value })
              }
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={listing.description}
              onChange={(e) =>
                setListing({ ...listing, description: e.target.value })
              }
              rows={4}
            />
          </div>

          {listing.images.length > 0 && (
            <div className="grid gap-2">
              <Label>Images</Label>
              <div className="grid grid-cols-4 gap-4">
                {listing.images.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`Product ${index + 1}`}
                    className="rounded-lg object-cover aspect-square"
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <Button type="submit" disabled={loading}>
          Create Listing
        </Button>
      </form>
    </Card>
  );
}
