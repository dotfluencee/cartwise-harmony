import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/DataContext';
import { Search, Plus, ArrowUp, PenLine, Trash2 } from 'lucide-react';
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
import { toast } from 'sonner';

interface Sale {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  price: number;
  date: string;
}

interface SalesPageProps {
  sales: Sale[];
  onAddSale: (sale: Omit<Sale, 'id'>) => void;
  onUpdateSale: (sale: Sale) => void;
  onDeleteSale: (id: string) => void;
}

const SalesPage: React.FC<SalesPageProps> = ({ sales, onAddSale, onUpdateSale, onDeleteSale }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);

  const handleAddSale = (newSale: Omit<Sale, 'id'>) => {
    onAddSale(newSale);
    setIsAdding(false);
  };

  const handleUpdateSale = (updatedSale: Sale) => {
    onUpdateSale(updatedSale);
    setEditingSale(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <CardTitle>Sales History</CardTitle>
        <Button onClick={() => setIsAdding(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Sale
        </Button>
      </div>

      <SaleHistory sales={sales} />

      <Dialog open={isAdding} onOpenChange={setIsAdding}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Sale</DialogTitle>
            <DialogDescription>
              Make sure to fill all the fields.
            </DialogDescription>
          </DialogHeader>
          <SaleForm onSubmit={handleAddSale} onCancel={() => setIsAdding(false)} />
        </DialogContent>
      </Dialog>

      {editingSale && (
        <Dialog open={!!editingSale} onOpenChange={() => setEditingSale(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Sale</DialogTitle>
              <DialogDescription>
                Edit the fields for this sale.
              </DialogDescription>
            </DialogHeader>
            <SaleForm
              initialData={editingSale}
              onSubmit={handleUpdateSale}
              onCancel={() => setEditingSale(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

interface SaleFormProps {
  initialData?: Sale;
  onSubmit: (sale: Omit<Sale, 'id'> | Sale) => void;
  onCancel: () => void;
}

const SaleForm: React.FC<SaleFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [customer, setCustomer] = useState(initialData?.customer || '');
  const [product, setProduct] = useState(initialData?.product || '');
  const [quantity, setQuantity] = useState(initialData?.quantity?.toString() || '');
  const [price, setPrice] = useState(initialData?.price?.toString() || '');
  const [date, setDate] = useState(initialData?.date || format(new Date(), 'yyyy-MM-dd'));

  const handleSubmit = () => {
    if (!customer || !product || !quantity || !price || !date) {
      alert('Please fill in all fields.');
      return;
    }

    const saleData = {
      customer,
      product,
      quantity: parseInt(quantity),
      price: parseFloat(price),
      date,
    };

    onSubmit(initialData ? { ...initialData, ...saleData } : saleData);
    onCancel();
  };

  return (
    <div>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="customer" className="text-right">
            Customer
          </Label>
          <Input id="customer" value={customer} onChange={(e) => setCustomer(e.target.value)} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="product" className="text-right">
            Product
          </Label>
          <Input id="product" value={product} onChange={(e) => setProduct(e.target.value)} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="quantity" className="text-right">
            Quantity
          </Label>
          <Input
            id="quantity"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="price" className="text-right">
            Price
          </Label>
          <Input
            id="price"
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="col-span-3"
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="date" className="text-right">
            Date
          </Label>
          <Input
            id="date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="col-span-3"
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="button" onClick={handleSubmit}>
          {initialData ? 'Update Sale' : 'Add Sale'}
        </Button>
      </DialogFooter>
    </div>
  );
};

const SaleItem = ({ sale, onEdit, onDelete }) => {
  return (
    <div className="grid grid-cols-6 gap-4 py-2 border-b">
      <div>{sale.customer}</div>
      <div>{sale.product}</div>
      <div>{sale.quantity}</div>
      <div>₹{sale.price}</div>
      <div>{format(new Date(sale.date), 'MMM dd, yyyy')}</div>
      <div className="flex justify-end gap-2">
        <Button size="icon" variant="ghost" onClick={() => onEdit(sale)}>
          <PenLine className="h-4 w-4" />
        </Button>
        <Button size="icon" variant="ghost" className="text-red-500 hover:bg-red-100" onClick={() => onDelete(sale)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

const SalesList = ({ sales, onEdit, onDelete }) => {
  return (
    <div>
      <div className="grid grid-cols-6 gap-4 py-2 font-medium">
        <div>Customer</div>
        <div>Product</div>
        <div>Quantity</div>
        <div>Price</div>
        <div>Date</div>
        <div></div>
      </div>
      {sales.map(sale => (
        <SaleItem key={sale.id} sale={sale} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
};

const SaleHistory = ({ sales }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingSale, setEditingSale] = useState(null);
  const [deleteConfirmSale, setDeleteConfirmSale] = useState(null);
  const { updateSale, deleteSale } = useData();

  const filteredSales = sales.filter(sale => 
    sale.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sale.product.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditSubmit = (updatedSale) => {
    try {
      updateSale(updatedSale);
      setEditingSale(null);
      toast.success("Sale updated successfully");
    } catch (error) {
      toast.error("Failed to update sale");
      console.error(error);
    }
  };

  const handleDelete = () => {
    try {
      deleteSale(deleteConfirmSale.id);
      setDeleteConfirmSale(null);
      toast.success("Sale deleted successfully");
    } catch (error) {
      toast.error("Failed to delete sale");
      console.error(error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales History</CardTitle>
        <CardDescription>Track your sales and manage transactions.</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <Input
            type="text"
            placeholder="Search sales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <SalesList
          sales={filteredSales}
          onEdit={(sale) => setEditingSale(sale)}
          onDelete={(sale) => setDeleteConfirmSale(sale)}
        />
      </CardContent>

      <Dialog open={!!deleteConfirmSale} onOpenChange={() => setDeleteConfirmSale(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Sale</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this sale? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div>
              <p>Customer: {deleteConfirmSale?.customer}</p>
              <p>Product: {deleteConfirmSale?.product}</p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="secondary" onClick={() => setDeleteConfirmSale(null)}>
              Cancel
            </Button>
            <Button type="button" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {editingSale && (
        <Dialog open={!!editingSale} onOpenChange={() => setEditingSale(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Sale</DialogTitle>
              <DialogDescription>
                Edit the fields for this sale.
              </DialogDescription>
            </DialogHeader>
            <SaleForm
              initialData={editingSale}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingSale(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </Card>
  );
};

const Sales = () => {
  const { sales, addSale, updateSale, deleteSale } = useData();

  const handleAddSale = (newSale: Omit<Sale, 'id'>) => {
    addSale(newSale);
  };

  const handleUpdateSale = (updatedSale: Sale) => {
    updateSale(updatedSale);
  };

  const handleDeleteSale = (id: string) => {
    deleteSale(id);
  };

  return (
    <SalesPage
      sales={sales}
      onAddSale={handleAddSale}
      onUpdateSale={handleUpdateSale}
      onDeleteSale={handleDeleteSale}
    />
  );
};

export default Sales;
