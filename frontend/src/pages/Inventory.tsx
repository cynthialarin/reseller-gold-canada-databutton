import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useInventoryStore } from "../utils/inventory-store";
import { InventoryTable } from "../components/InventoryTable";
import { AddItemDialog } from "../components/AddItemDialog";
import { AddLocationDialog } from "../components/AddLocationDialog";

export default function Inventory() {
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddItem, setShowAddItem] = useState(false);
  const [showAddLocation, setShowAddLocation] = useState(false);

  return (
    <div className="container py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <div className="space-x-2">
          <Button
            variant="outline"
            onClick={() => setShowAddLocation(true)}
          >
            Add Location
          </Button>
          <Button
            onClick={() => setShowAddItem(true)}
          >
            Add Item
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex gap-4 mb-4">
          <Input
            placeholder="Search inventory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <InventoryTable searchTerm={searchTerm} />
      </Card>

      <AddItemDialog
        open={showAddItem}
        onOpenChange={setShowAddItem}
      />

      <AddLocationDialog
        open={showAddLocation}
        onOpenChange={setShowAddLocation}
      />
    </div>
  );
}
