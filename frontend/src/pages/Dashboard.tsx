import * as React from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../utils/auth-store";
import { useListingStore } from "../utils/listing-store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { PlusIcon, ListIcon, SettingsIcon, BarChartIcon } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { listings, loading } = useListingStore();

  React.useEffect(() => {
    if (!user) {
      navigate("/");
      return;
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  const quickActions = [
    {
      title: "Create Listing",
      description: "Create a new listing with AI assistance",
      icon: <PlusIcon className="h-6 w-6" />,
      onClick: () => navigate("/create-listing"),
    },
    {
      title: "View Listings",
      description: "Manage your active and draft listings",
      icon: <ListIcon className="h-6 w-6" />,
      onClick: () => navigate("/listings"),
    },
    {
      title: "Settings",
      description: "Configure your account and preferences",
      icon: <SettingsIcon className="h-6 w-6" />,
      onClick: () => navigate("/settings"),
    },
  ];

  return (
    <div className="container mx-auto py-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Welcome back, {user.displayName || "Reseller"}!</h1>
          <p className="text-muted-foreground mt-1">Here's an overview of your reselling business</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BarChartIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{listings.filter(l => l.status === "published").length}</h3>
              <p className="text-muted-foreground">Active Listings</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <ListIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">{listings.filter(l => l.status === "draft").length}</h3>
              <p className="text-muted-foreground">Draft Listings</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <BarChartIcon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold">$0</h3>
              <p className="text-muted-foreground">Total Sales</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {quickActions.map((action, index) => (
          <Card
            key={index}
            className="p-6 hover:bg-muted/50 cursor-pointer transition-colors"
            onClick={action.onClick}
          >
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                {action.icon}
              </div>
              <div>
                <h3 className="font-semibold">{action.title}</h3>
                <p className="text-sm text-muted-foreground">{action.description}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {loading ? (
            <p>Loading...</p>
          ) : listings.length === 0 ? (
            <p className="text-muted-foreground">No recent activity</p>
          ) : (
            <div className="space-y-4">
              {listings.slice(0, 5).map(listing => (
                <div key={listing.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{listing.title || "Untitled"}</p>
                    <p className="text-sm text-muted-foreground">
                      Status: {listing.status.charAt(0).toUpperCase() + listing.status.slice(1)}
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => navigate(`/listings/${listing.id}`)}>
                    View
                  </Button>
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">AI Assistant Tips</h2>
          <div className="prose dark:prose-invert">
            <ul className="list-disc list-inside space-y-2">
              <li>Use barcode scanning for quick product lookup</li>
              <li>Remove image backgrounds for professional photos</li>
              <li>Let AI analyze product conditions from images</li>
              <li>Generate SEO-optimized titles and descriptions</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
