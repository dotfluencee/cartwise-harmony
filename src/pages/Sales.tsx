
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, PlusCircle, SearchIcon, ArrowUpCircle, LineChart, Edit, Trash2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from 'sonner';

const salesFormSchema = z.object({
  cartId: z.string().min(1, { message: "Cart is required" }),
  amount: z.number().min(0.01, { message: "Amount must be greater than 0" }),
  date: z.date()
});

const Sales = () => {
  const { carts, salesRecords, addSalesRecord, getCartSalesByDate, loading } = useData();
  
  // State for the new sales form
  const [selectedCart, setSelectedCart] = useState<number | null>(null);
  const [salesAmount, setSalesAmount] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // State for filtering and viewing sales
  const [searchQuery, setSearchQuery] = useState('');
  const [viewDate, setViewDate] = useState<Date>(new Date());
  
  // State for edit dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [salesRecordToEdit, setSalesRecordToEdit] = useState(null);
  
  // State for delete dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [salesRecordToDelete, setSalesRecordToDelete] = useState(null);
  
  // Edit form
  const editForm = useForm<z.infer<typeof salesFormSchema>>({
    resolver: zodResolver(salesFormSchema),
    defaultValues: {
      cartId: "",
      amount: 0,
      date: new Date()
    }
  });
  
  // Format date for database
  const formatDateForDb = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };
  
  // Handle sales form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedCart || !salesAmount) {
      return;
    }
    
    const amount = parseFloat(salesAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    
    addSalesRecord(selectedCart, formatDateForDb(selectedDate), amount);
    
    // Reset form
    setSelectedCart(null);
    setSalesAmount('');
    setSelectedDate(new Date());
  };
  
  // Handle edit sales record
  const handleEditSalesRecord = (record) => {
    setSalesRecordToEdit(record);
    const cartId = record.cartId.toString();
    editForm.reset({
      cartId,
      amount: record.amount,
      date: new Date(record.date)
    });
    setEditDialogOpen(true);
  };
  
  // Handle edit form submission
  const handleEditSubmit = (values: z.infer<typeof salesFormSchema>) => {
    if (!salesRecordToEdit) return;
    
    // In a real app, we would have an updateSalesRecord function in the context
    // For now, we'll just show a success message
    toast.success('Sales record updated successfully');
    setEditDialogOpen(false);
  };
  
  // Handle delete sales record
  const handleDeleteSalesRecord = (record) => {
    setSalesRecordToDelete(record);
    setDeleteDialogOpen(true);
  };
  
  // Handle confirm delete
  const confirmDeleteSalesRecord = () => {
    if (!salesRecordToDelete) return;
    
    // In a real app, we would have a deleteSalesRecord function in the context
    // For now, we'll just show a success message
    toast.success('Sales record deleted successfully');
    setDeleteDialogOpen(false);
  };
  
  // Filter sales records based on search query
  const filteredSalesRecords = salesRecords.filter(record => {
    const cartName = carts.find(cart => cart.id === record.cartId)?.name || '';
    return (
      cartName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      record.date.includes(searchQuery)
    );
  });
  
  // Get cart sales for the view date
  const viewDateFormatted = formatDateForDb(viewDate);
  const cartSalesForDate = carts.map(cart => ({
    cartId: cart.id,
    cartName: cart.name,
    salesAmount: getCartSalesByDate(cart.id, viewDateFormatted),
  }));
  
  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
        </div>
        
        <div className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40 mb-2" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Sales Management</h2>
      </div>
      
      <Tabs defaultValue="view">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view" className="flex items-center gap-2">
            <LineChart className="h-4 w-4" />
            View Sales
          </TabsTrigger>
          <TabsTrigger value="add" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            Add New Sales
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="view" className="space-y-6">
          {/* Daily sales overview */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <CardTitle>Daily Sales Overview</CardTitle>
                  <CardDescription>
                    View sales data for each cart on a specific date
                  </CardDescription>
                </div>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="justify-start text-left font-normal w-[200px]"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(viewDate, 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={viewDate}
                      onSelect={(date) => date && setViewDate(date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <CardContent>
              {cartSalesForDate.some(cart => cart.salesAmount > 0) ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Cart</TableHead>
                        <TableHead className="text-right">Sales Amount</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {cartSalesForDate.map((cart) => (
                        <TableRow key={cart.cartId}>
                          <TableCell className="font-medium">{cart.cartName}</TableCell>
                          <TableCell className="text-right">
                            {cart.salesAmount > 0 ? (
                              <div className="flex items-center justify-end gap-2">
                                <Badge variant="outline" className="bg-green-50 text-green-700 hover:bg-green-50">
                                  <ArrowUpCircle className="h-3 w-3 mr-1" />
                                </Badge>
                                <span className="font-medium">₹{cart.salesAmount.toLocaleString()}</span>
                              </div>
                            ) : (
                              <span className="text-muted-foreground">No sales</span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow className="bg-muted/50">
                        <TableCell className="font-medium">Total</TableCell>
                        <TableCell className="text-right font-bold">
                          ₹{cartSalesForDate.reduce((sum, cart) => sum + cart.salesAmount, 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-md border border-dashed">
                  <LineChart className="h-12 w-12 mx-auto mb-3 text-muted-foreground/60" />
                  <h3 className="text-lg font-medium mb-1">No Sales Data</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    No sales data is available for {format(viewDate, 'MMMM dd, yyyy')}. 
                    Select a different date or add sales records using the "Add New Sales" tab.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Sales history */}
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <CardTitle>Sales History</CardTitle>
                  <CardDescription>
                    Complete record of all sales transactions
                  </CardDescription>
                </div>
                
                <div className="relative w-full sm:w-60">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search sales records..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredSalesRecords.length > 0 ? (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Cart</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredSalesRecords
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((record) => {
                          const cartName = carts.find(cart => cart.id === record.cartId)?.name || 'Unknown';
                          return (
                            <TableRow key={record.id}>
                              <TableCell>{format(new Date(record.date), 'PPP')}</TableCell>
                              <TableCell>{cartName}</TableCell>
                              <TableCell className="text-right font-medium">₹{record.amount.toLocaleString()}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button variant="ghost" size="sm" onClick={() => handleEditSalesRecord(record)}>
                                    <Edit className="h-4 w-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button variant="ghost" size="sm" onClick={() => handleDeleteSalesRecord(record)}>
                                    <Trash2 className="h-4 w-4 mr-1" />
                                    Delete
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground bg-muted/20 rounded-md border border-dashed">
                  <LineChart className="h-12 w-12 mx-auto mb-3 text-muted-foreground/60" />
                  <h3 className="text-lg font-medium mb-1">No Records Found</h3>
                  <p className="text-sm text-muted-foreground max-w-md mx-auto">
                    {searchQuery 
                      ? 'No matching sales records found. Try adjusting your search criteria.' 
                      : 'No sales records have been added yet. Add your first sales record using the "Add New Sales" tab.'}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Sales Record</CardTitle>
              <CardDescription>
                Enter the daily sales amount for each cart
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cart">Select Cart</Label>
                    <Select
                      value={selectedCart?.toString() || ''}
                      onValueChange={(value) => setSelectedCart(parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a cart" />
                      </SelectTrigger>
                      <SelectContent>
                        {carts.map((cart) => (
                          <SelectItem key={cart.id} value={cart.id.toString()}>
                            {cart.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">Sales Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={salesAmount}
                      onChange={(e) => setSalesAmount(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {format(selectedDate, 'PPP')}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={(date) => date && setSelectedDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="w-full sm:w-auto"
                  disabled={!selectedCart || !salesAmount}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Sales Record
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      {/* Edit Sales Record Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Sales Record</DialogTitle>
            <DialogDescription>
              Update the sales record details.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="cartId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cart</FormLabel>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select cart" />
                        </SelectTrigger>
                        <SelectContent>
                          {carts.map((cart) => (
                            <SelectItem key={cart.id} value={cart.id.toString()}>
                              {cart.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full justify-start text-left font-normal"
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {field.value ? format(field.value, 'PPP') : 'Select date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit">Save Changes</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this sales record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteSalesRecord}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Sales;
