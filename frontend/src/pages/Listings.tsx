import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../utils/auth-store";
import { useListingStore } from "../utils/listing-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";

export default function Listings() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { loadListings, listings, loading, deleteListing } = useListingStore();

  React.useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }

    loadListings().catch(error => {
      toast.error(error.message || "Failed to load listings");
    });
  }, [user, navigate]);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this listing?")) {
      return;
    }

    try {
      await deleteListing(id);
      toast.success("Listing deleted successfully");
    } catch (error: any) {
      toast.error(error.message || "Failed to delete listing");
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <Button onClick={() => navigate("/dashboard")}>
          Create New Listing
        </Button>
      </div>

      {loading ? (
        <p>Loading listings...</p>
      ) : listings.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-muted-foreground mb-4">
            You haven't created any listings yet
          </p>
          <Button onClick={() => navigate("/dashboard")}>
            Create Your First Listing
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map(listing => (
            <Card key={listing.id} className="overflow-hidden">
              {listing.images?.[0] && (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4 space-y-4">
                <div>
                  <h2 className="text-xl font-semibold truncate">
                    {listing.title || "Untitled"}
                  </h2>
                  <p className="text-muted-foreground">
                    ${listing.price?.toFixed(2)}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    listing.status === "published"
                      ? "bg-green-500/10 text-green-500"
                      : "bg-yellow-500/10 text-yellow-500"
                  }`}>
                    {listing.status === "published" ? "Published" : "Draft"}
                  </span>
                  <span className="px-2 py-1 rounded-full text-xs bg-blue-500/10 text-blue-500">
                    {listing.marketplace}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => navigate(`/listings/${listing.id}`)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleDelete(listing.id)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
