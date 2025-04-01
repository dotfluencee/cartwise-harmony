
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, PlusCircle, SearchIcon, ArrowUpCircle, LineChart } from 'lucide-react';
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

const Sales = () => {
  const { carts, salesRecords, addSalesRecord, getCartSalesByDate, loading } = useData();
  
  // State for the new sales form
  const [selectedCart, setSelectedCart] = useState<number | null>(null);
  const [salesAmount, setSalesAmount] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // State for filtering and viewing sales
  const [searchQuery, setSearchQuery] = useState('');
  const [viewDate, setViewDate] = useState<Date>(new Date());
  
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
    </div>
  );
};

export default Sales;
