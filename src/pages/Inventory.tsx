import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Item name must be at least 2 characters.",
  }),
  quantity: z.number().min(0, {
    message: "Quantity must be at least 0.",
  }),
  unit: z.string().min(1, {
    message: "Unit must be at least 1 character.",
  }),
  threshold: z.number().min(0, {
    message: "Threshold must be at least 0.",
  }),
})

const Inventory = () => {
  const { inventory, addInventoryItem, updateInventoryItemQuantity, loading } = useData();
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      quantity: 0,
      unit: "",
      threshold: 0,
    },
  })
  
  const editForm = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      quantity: 0,
      unit: "",
      threshold: 0,
    },
  })
  
  useEffect(() => {
    if (selectedItem) {
      editForm.reset({
        name: selectedItem.name,
        quantity: selectedItem.quantity,
        unit: selectedItem.unit,
        threshold: selectedItem.threshold,
      });
    }
  }, [selectedItem, editForm]);
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await addInventoryItem(values.name, values.quantity, values.unit, values.threshold);
      toast.success('Item added successfully');
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error('Failed to add item');
    }
  }
  
  const onEditSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!selectedItem) return;
    
    try {
      await updateInventoryItemQuantity(selectedItem.id, values.quantity);
      toast.success('Item updated successfully');
      editForm.reset();
      setEditOpen(false);
    } catch (error) {
      toast.error('Failed to update item');
    }
  }
  
  const handleEdit = (item: any) => {
    setSelectedItem(item);
    setEditOpen(true);
  };
  
  const handleDelete = async (id: string, itemName: string, currentQuantity: number, unit: string) => {
    if (currentQuantity > 0) {
      toast.error('Cannot delete item with quantity greater than 0');
      return;
    }
    
    setItemToDelete({ id, name: itemName });
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      toast.success('Item deleted successfully');
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };
  
  const handleQuantityChange = async (id: string, itemName: string, currentQuantity: number, unit: string) => {
    const newQuantity = parseInt(prompt(`Enter new quantity for ${itemName}:`, currentQuantity.toString()) || currentQuantity.toString());
    
    if (isNaN(newQuantity)) {
      toast.error('Invalid quantity');
      return;
    }
    
    if (newQuantity < 0) {
      toast.error('Quantity cannot be negative');
      return;
    }
    
    try {
      await updateInventoryItemQuantity(id, newQuantity);
      
      if (newQuantity <= inventory.find(item => item.id === id)?.threshold) {
        toast.warning(`${itemName} is running low! Current quantity: ${newQuantity} ${unit}`, {
          description: "Please restock soon",
        });
      }
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };
  
  if (loading) {
    return <p>Loading inventory...</p>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Inventory</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="default">
              <Plus className="mr-2 h-4 w-4" />
              Add Item
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add Inventory Item</DialogTitle>
              <DialogDescription>
                Add a new item to the inventory.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Item Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Quantity" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="unit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Unit</FormLabel>
                        <FormControl>
                          <Input placeholder="Unit" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="threshold"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Threshold</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Threshold" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </ScrollArea>
            <DialogFooter>
              <Button type="button" onClick={form.handleSubmit(onSubmit)}>Add Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Inventory List</CardTitle>
          <CardDescription>
            A list of all the items in the inventory.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Item Name</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead>Threshold</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {inventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>{item.quantity}</TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.threshold}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => handleQuantityChange(item.id, item.name, item.quantity, item.unit)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Update
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id, item.name, item.quantity, item.unit)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
      
      {selectedItem && (
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Inventory Item</DialogTitle>
              <DialogDescription>
                Edit the quantity of an item in the inventory.
              </DialogDescription>
            </DialogHeader>
            <ScrollArea className="max-h-[60vh]">
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4 p-1">
                  <FormField
                    control={editForm.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Quantity" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </form>
              </Form>
            </ScrollArea>
            <DialogFooter>
              <Button type="button" onClick={editForm.handleSubmit(onEditSubmit)}>Update Item</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the {itemToDelete?.name} item from your inventory.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Inventory;
