import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { EditItemDialog } from "./EditItemDialog";
import { useInventoryStore } from "../utils/inventory-store";

interface InventoryTableProps {
  searchTerm: string;
}

export function InventoryTable({ searchTerm }: InventoryTableProps) {
  const { items, locations, deleteItem } = useInventoryStore();
  const [editingItem, setEditingItem] = useState<string | null>(null);

  // Filter items based on search term
  const filteredItems = items.filter(item =>
    item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sku.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>SKU</TableHead>
            <TableHead>Title</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Quantity</TableHead>
            <TableHead>Purchase Price</TableHead>
            <TableHead>Selling Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredItems.map((item) => (
            <TableRow key={item.id}>
              <TableCell>{item.sku}</TableCell>
              <TableCell>{item.title}</TableCell>
              <TableCell>
                {locations.find(l => l.id === item.location_id)?.name || 'No location'}
              </TableCell>
              <TableCell>{item.quantity}</TableCell>
              <TableCell>${item.purchase_price.toFixed(2)}</TableCell>
              <TableCell>${item.selling_price.toFixed(2)}</TableCell>
              <TableCell>
                <span className={`capitalize ${item.status === 'in_stock' ? 'text-green-500' : 'text-yellow-500'}`}>
                  {item.status.replace('_', ' ')}
                </span>
              </TableCell>
              <TableCell>
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setEditingItem(item.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => deleteItem(item.id)}
                  >
                    Delete
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <EditItemDialog
        open={!!editingItem}
        onOpenChange={() => setEditingItem(null)}
        itemId={editingItem || ''}
      />
    </>
  );
}
