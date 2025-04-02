import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useData } from '@/contexts/DataContext';
import { Search, Plus, Package, PenLine, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';

interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  createdAt: string;
  updatedAt: string;
}

interface InventoryPageProps {
  items: InventoryItem[];
  loading: boolean;
  addItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateItem: (item: InventoryItem) => void;
  deleteItem: (id: string) => void;
}

const InventoryItemCard = ({ item }: { item: InventoryItem }) => {
  const isLowStock = item.quantity <= 10;

  return (
    <Card className="shadow-md">
      <CardHeader>
        <CardTitle>{item.name}</CardTitle>
        <CardDescription>{item.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Category: {item.category}</p>
            <p className="text-sm text-gray-500">Price: ₹{item.price}</p>
            <div className="mt-2">
              Quantity: {item.quantity} {item.unit}
              {isLowStock && (
                <Badge variant="destructive" className="ml-2">Low Stock</Badge>
              )}
            </div>
          </div>
          <Package className="h-8 w-8 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  );
};

const InventoryForm = ({ open, setOpen, onSubmit, initialValues }: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onSubmit: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  initialValues?: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>;
}) => {
  const [name, setName] = useState(initialValues?.name || '');
  const [description, setDescription] = useState(initialValues?.description || '');
  const [category, setCategory] = useState(initialValues?.category || 'Grocery');
  const [quantity, setQuantity] = useState(initialValues?.quantity || 0);
  const [unit, setUnit] = useState(initialValues?.unit || 'kg');
  const [price, setPrice] = useState(initialValues?.price || 0);

  const handleSubmit = () => {
    onSubmit({ name, description, category, quantity, unit, price });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Inventory Item</DialogTitle>
          <DialogDescription>
            Add a new item to your inventory.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Select onValueChange={setCategory} defaultValue={category}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Grocery">Grocery</SelectItem>
                <SelectItem value="Beverage">Beverage</SelectItem>
                <SelectItem value="Snack">Snack</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="quantity" className="text-right">
              Quantity
            </Label>
            <Input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="unit" className="text-right">
              Unit
            </Label>
            <Select onValueChange={setUnit} defaultValue={unit}>
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select a unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kg">kg</SelectItem>
                <SelectItem value="litre">litre</SelectItem>
                <SelectItem value="piece">piece</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="price" className="text-right">
              Price
            </Label>
            <Input
              type="number"
              id="price"
              value={price}
              onChange={(e) => setPrice(parseInt(e.target.value))}
              className="col-span-3"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button type="submit" onClick={handleSubmit}>Add Item</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const InventoryItemRow = ({ item, onEdit, onDelete }) => {
  const formattedDate = format(new Date(item.updatedAt), 'MMM dd, yyyy - hh:mm a');

  return (
    <tr key={item.id}>
      <td>{item.name}</td>
      <td>{item.category}</td>
      <td>{item.quantity} {item.unit}</td>
      <td>₹{item.price}</td>
      <td>{formattedDate}</td>
      <td className="flex justify-end gap-2">
        <Button variant="ghost" size="icon" onClick={() => onEdit(item)}>
          <PenLine className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="text-red-500 hover:bg-red-50" onClick={() => onDelete(item)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </td>
    </tr>
  );
};

const InventoryHistory = ({ items }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirmItem, setDeleteConfirmItem] = useState(null);
  const { updateInventoryItem, deleteInventoryItem } = useData();

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditSubmit = (updatedItem) => {
    try {
      updateInventoryItem(updatedItem);
      setEditingItem(null);
      toast.success("Inventory item updated successfully");
    } catch (error) {
      toast.error("Failed to update inventory item");
      console.error(error);
    }
  };

  const handleDelete = () => {
    try {
      deleteInventoryItem(deleteConfirmItem.id);
      setDeleteConfirmItem(null);
      toast.success("Inventory item deleted successfully");
    } catch (error) {
      toast.error("Failed to delete inventory item");
      console.error(error);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Input
          type="text"
          placeholder="Search items..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Updated
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredItems.map(item => (
              <InventoryItemRow
                key={item.id}
                item={item}
                onEdit={(item) => setEditingItem(item)}
                onDelete={(item) => setDeleteConfirmItem(item)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Item Dialog */}
      <InventoryForm
        open={!!editingItem}
        setOpen={() => setEditingItem(null)}
        initialValues={editingItem}
        onSubmit={(updatedItem) => {
          handleEditSubmit({ ...editingItem, ...updatedItem });
        }}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmItem} onOpenChange={() => setDeleteConfirmItem(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Item</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {deleteConfirmItem?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setDeleteConfirmItem(null)}>
              Cancel
            </Button>
            <Button type="submit" variant="destructive" onClick={handleDelete}>Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Inventory = () => {
  const { inventory, loading, addInventoryItem, updateInventoryItem, deleteInventoryItem } = useData();
  const [open, setOpen] = useState(false);

  const handleAddItem = (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      addInventoryItem(item);
      toast.success("Inventory item added successfully");
    } catch (error) {
      toast.error("Failed to add inventory item");
      console.error(error);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Inventory</CardTitle>
           <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="grid gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <InventoryHistory items={inventory} />
          )}
        </CardContent>
      </Card>

      <InventoryForm open={open} setOpen={setOpen} onSubmit={handleAddItem} />
    </div>
  );
};

export default Inventory;
