import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PriceAnalysis } from "components/PriceAnalysis";

export default function Pricing() {
  const [keywords, setKeywords] = useState("");
  const [category, setCategory] = useState("");
  const [condition, setCondition] = useState("");
  const [searchInitiated, setSearchInitiated] = useState(false);

  const handleSearch = () => {
    if (keywords) {
      setSearchInitiated(true);
    }
  };

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Market Price Analysis</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <div className="space-y-2">
          <Label htmlFor="keywords">Search Keywords</Label>
          <Input
            id="keywords"
            placeholder="e.g. Nike Air Jordan 1"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="category">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clothing">Clothing</SelectItem>
              <SelectItem value="shoes">Shoes</SelectItem>
              <SelectItem value="accessories">Accessories</SelectItem>
              <SelectItem value="electronics">Electronics</SelectItem>
              <SelectItem value="collectibles">Collectibles</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="condition">Condition</Label>
          <Select value={condition} onValueChange={setCondition}>
            <SelectTrigger id="condition">
              <SelectValue placeholder="Select condition" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New</SelectItem>
              <SelectItem value="like_new">Like New</SelectItem>
              <SelectItem value="good">Good</SelectItem>
              <SelectItem value="fair">Fair</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-end">
          <Button
            className="w-full"
            size="lg"
            onClick={handleSearch}
            disabled={!keywords}
          >
            Analyze Market
          </Button>
        </div>
      </div>

      {searchInitiated && (
        <PriceAnalysis
          keywords={keywords}
          category={category || undefined}
          condition={condition || undefined}
        />
      )}
    </div>
  );
}
