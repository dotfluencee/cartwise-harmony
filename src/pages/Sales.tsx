
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, PlusCircle, SearchIcon } from 'lucide-react';
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

const Sales = () => {
  const { carts, salesRecords, addSalesRecord, getCartSalesByDate } = useData();
  
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
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Sales Management</h2>
      </div>
      
      <Tabs defaultValue="view">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view">View Sales</TabsTrigger>
          <TabsTrigger value="add">Add New Sales</TabsTrigger>
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
              {cartSalesForDate.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left">Cart</th>
                        <th className="py-3 px-4 text-right">Sales Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cartSalesForDate.map((cart) => (
                        <tr key={cart.cartId} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{cart.cartName}</td>
                          <td className="py-3 px-4 text-right font-medium">
                            ₹{cart.salesAmount.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-medium">
                        <td className="py-3 px-4">Total</td>
                        <td className="py-3 px-4 text-right">
                          ₹{cartSalesForDate.reduce((sum, cart) => sum + cart.salesAmount, 0).toLocaleString()}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-chawal-muted">
                  No sales data available for this date
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
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
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
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left">Date</th>
                        <th className="py-3 px-4 text-left">Cart</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSalesRecords
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((record) => {
                          const cartName = carts.find(cart => cart.id === record.cartId)?.name || 'Unknown';
                          return (
                            <tr key={record.id} className="border-b hover:bg-gray-50">
                              <td className="py-3 px-4">{format(new Date(record.date), 'PPP')}</td>
                              <td className="py-3 px-4">{cartName}</td>
                              <td className="py-3 px-4 text-right font-medium">₹{record.amount.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-chawal-muted">
                  {searchQuery ? 'No matching sales records found' : 'No sales records yet'}
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
                  className="bg-chawal-primary hover:bg-chawal-secondary"
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
