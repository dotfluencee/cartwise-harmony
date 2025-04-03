
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
import { Plus, Trash2, MinusCircle, PlusCircle, CalendarIcon, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";

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
  price: z.number().min(0, {
    message: "Price must be at least 0.",
  }),
  date: z.date({
    required_error: "Date is required.",
  }),
})

const Inventory = () => {
  const { inventory, addInventoryItem, updateInventoryItemQuantity, deleteInventoryItem, loading } = useData();
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);
  const [dateFilter, setDateFilter] = useState(null);
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      quantity: 0,
      unit: "",
      threshold: 0,
      price: 0,
      date: new Date(),
    },
  })
  
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      await addInventoryItem(
        values.name, 
        values.quantity, 
        values.unit, 
        values.threshold, 
        format(values.date, 'yyyy-MM-dd'),
        values.price
      );
      toast.success('Item added successfully');
      form.reset();
      setOpen(false);
    } catch (error) {
      toast.error('Failed to add item');
    }
  }
  
  const handleDelete = async (id: string, itemName: string) => {
    setItemToDelete({ id, name: itemName });
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      await deleteInventoryItem(itemToDelete.id);
      toast.success('Item deleted successfully');
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete item');
    }
  };
  
  const incrementQuantity = async (id: string, currentQuantity: number, name: string, unit: string) => {
    try {
      await updateInventoryItemQuantity(id, currentQuantity + 1);
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };
  
  const decrementQuantity = async (id: string, currentQuantity: number, name: string, unit: string) => {
    if (currentQuantity <= 0) {
      toast.error('Quantity cannot be negative');
      return;
    }
    
    try {
      await updateInventoryItemQuantity(id, currentQuantity - 1);
      
      const item = inventory.find(item => item.id === id);
      if (item && (currentQuantity - 1) <= item.threshold) {
        toast.warning(`${name} is running low! Current quantity: ${currentQuantity - 1} ${unit}`, {
          description: "Please restock soon",
        });
      }
    } catch (error) {
      toast.error('Failed to update quantity');
    }
  };

  // Filter inventory items by date
  const filteredInventory = dateFilter
    ? inventory.filter(item => item.date === format(dateFilter, 'yyyy-MM-dd'))
    : inventory;
  
  const clearDateFilter = () => {
    setDateFilter(null);
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
                          <Input type="number" placeholder="Quantity" {...field} onChange={e => field.onChange(Number(e.target.value))} />
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
                          <Input type="number" placeholder="Threshold" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Price</FormLabel>
                        <FormControl>
                          <Input type="number" placeholder="Price" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="date"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Date</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full pl-3 text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                              className="pointer-events-auto"
                            />
                          </PopoverContent>
                        </Popover>
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
      
      <div className="flex items-center gap-4 mb-4">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px]">
              {dateFilter ? format(dateFilter, "PPP") : "Filter by date"}
              <CalendarIcon className="ml-auto h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0">
            <Calendar
              mode="single"
              selected={dateFilter}
              onSelect={setDateFilter}
              initialFocus
              className="pointer-events-auto"
            />
          </PopoverContent>
        </Popover>
        {dateFilter && (
          <Button variant="ghost" onClick={clearDateFilter}>
            Clear filter
          </Button>
        )}
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
                  <TableHead>Price</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInventory.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 rounded-full p-0"
                          onClick={() => decrementQuantity(item.id, item.quantity, item.name, item.unit)}
                        >
                          <MinusCircle className="h-4 w-4" />
                        </Button>
                        <span>{item.quantity}</span>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-8 w-8 rounded-full p-0"
                          onClick={() => incrementQuantity(item.id, item.quantity, item.name, item.unit)}
                        >
                          <PlusCircle className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>{item.threshold}</TableCell>
                    <TableCell>${item.price?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id, item.name)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

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
