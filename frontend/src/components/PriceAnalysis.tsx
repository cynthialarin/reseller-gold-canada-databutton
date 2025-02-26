import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import brain from "brain";

interface Props {
  keywords: string;
  category?: string;
  condition?: string;
  brand?: string;
  onPriceSelect?: (price: number) => void;
}

export function PriceAnalysis({ keywords, category, condition, brand, onPriceSelect }: Props) {
  const [loading, setLoading] = useState(false);
  const [priceData, setPriceData] = useState<any>(null);
  const [customPrice, setCustomPrice] = useState<string>("");

  useEffect(() => {
    // Clear any previous error state
    setPriceData(null);
    
    const analyzePrices = async () => {
      // Ensure we have valid search terms
      if (!keywords || typeof keywords !== 'string' || !keywords.trim()) {
        return;
      }
      
      setLoading(true);
      try {
        // Build search query with available terms
        const searchTerms = [
          keywords.trim(),
          brand?.trim(),
          category?.trim()
        ].filter(Boolean).join(' ');

        const response = await brain.analyze_price({ body: {
          keywords: searchTerms,
          category: category?.trim(),
          condition: condition?.trim(),
          brand: brand?.trim()
        }});
        const data = await response.json();
        setPriceData(data);
        // Set initial custom price to suggested price
        setCustomPrice(data.suggested_price.toString());
      } catch (error) {
        console.error("Error analyzing prices:", error);
        setPriceData(null);
      } finally {
        setLoading(false);
      }
    };

    analyzePrices();
  }, [keywords, category, condition, brand]);

  const handlePriceSelect = () => {
    if (onPriceSelect && customPrice) {
      onPriceSelect(parseFloat(customPrice));
    }
  };

  if (loading) {
    return <div className="p-8 text-center">Analyzing market prices...</div>;
  }

  if (!priceData) {
    return null;
  }

  // Format price history data for chart
  const chartData = priceData.price_history.map((point: any) => ({
    date: new Date(point.date).toLocaleDateString(),
    price: point.price,
    platform: point.platform
  }));

  return (
    <div className="space-y-6">
      {/* Price Recommendation */}
      <Card>
        <CardHeader>
          <CardTitle>Price Recommendation</CardTitle>
          <CardDescription>
            Based on {priceData.active_competitors.length} active listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end gap-4">
            <div className="space-y-2">
              <Label>Suggested Price Range</Label>
              <div className="text-2xl font-bold">
                ${priceData.price_range.min.toFixed(2)} - ${priceData.price_range.max.toFixed(2)}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Your Price</Label>
              <div className="flex gap-2">
                <Input
                  type="number"
                  value={customPrice}
                  onChange={(e) => setCustomPrice(e.target.value)}
                  className="w-32"
                />
                <Button onClick={handlePriceSelect}>Use Price</Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Market Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Market Trends</CardTitle>
          <CardDescription>Historical price analysis</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#8884d8"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 space-y-2">
            {priceData.market_trends.map((trend: any) => (
              <div key={trend.period} className="flex justify-between items-center">
                <span className="capitalize">{trend.period}</span>
                <div>
                  <span className="font-medium">${trend.average_price.toFixed(2)}</span>
                  <span className={`ml-2 ${trend.price_change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {trend.price_change >= 0 ? '+' : ''}{trend.price_change}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Competitor Listings */}
      <Card>
        <CardHeader>
          <CardTitle>Active Competitor Listings</CardTitle>
          <CardDescription>Current market overview</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Listed</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceData.active_competitors.map((listing: any, index: number) => (
                <TableRow key={index}>
                  <TableCell className="font-medium">
                    <a href={listing.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {listing.title}
                    </a>
                  </TableCell>
                  <TableCell>${listing.price.toFixed(2)}</TableCell>
                  <TableCell>{listing.condition || 'N/A'}</TableCell>
                  <TableCell>{listing.platform}</TableCell>
                  <TableCell>{new Date(listing.date_listed).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Best Time to List */}
      <Card>
        <CardHeader>
          <CardTitle>Listing Recommendations</CardTitle>
          <CardDescription>Optimize your listing timing</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span>Best day to list:</span>
              <span className="font-medium">{priceData.best_day_to_list}</span>
            </div>
            <div className="flex justify-between">
              <span>Best time to list:</span>
              <span className="font-medium">{priceData.best_time_to_list}</span>
            </div>
            <div className="flex justify-between">
              <span>Confidence score:</span>
              <span className="font-medium">{(priceData.confidence_score * 100).toFixed(0)}%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
