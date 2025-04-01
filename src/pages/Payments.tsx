
import React, { useState } from 'react';
import { format } from 'date-fns';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, PlusCircle, SearchIcon, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const Payments = () => {
  const {
    payments,
    addPayment,
    updatePaymentStatus,
    getPendingPayments,
    getTotalPendingAmount,
    getDailyProfit,
  } = useData();
  
  // State for the new payment form
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'completed' | 'pending' | ''>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // State for filtering payments
  const [searchQuery, setSearchQuery] = useState('');
  
  // Format date for database
  const formatDateForDb = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };
  
  // Handle payment form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentStatus || !paymentAmount) {
      return;
    }
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    
    addPayment(formatDateForDb(selectedDate), amount, paymentStatus);
    
    // Reset form
    setPaymentAmount('');
    setPaymentStatus('');
    setSelectedDate(new Date());
  };
  
  // Handle payment status update
  const handleUpdateStatus = (id: string, newStatus: 'completed' | 'pending') => {
    updatePaymentStatus(id, newStatus);
  };
  
  // Filter payments based on search query
  const filteredPayments = payments.filter(payment => {
    return (
      payment.date.includes(searchQuery) ||
      payment.status.includes(searchQuery)
    );
  });
  
  // Calculate partner payment for today
  const today = new Date();
  const todayFormatted = formatDateForDb(today);
  const todayProfit = getDailyProfit(todayFormatted);
  const partnerPaymentAmount = todayProfit > 0 ? todayProfit / 2 : 0;
  
  // Get pending payments
  const pendingPayments = getPendingPayments();
  const totalPendingAmount = getTotalPendingAmount();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Partner Payments</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Today's Payment</CardTitle>
            <CardDescription>
              Based on today's profit calculation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-chawal-muted">Today's Profit</p>
                <p className={`text-xl font-bold ${todayProfit >= 0 ? 'text-chawal-success' : 'text-chawal-danger'}`}>
                  ₹{todayProfit.toLocaleString()}
                </p>
              </div>
              
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-chawal-muted">Partner's Share (50%)</p>
                <p className="text-xl font-bold">₹{partnerPaymentAmount.toLocaleString()}</p>
              </div>
              
              {todayProfit > 0 && (
                <Button
                  className="w-full bg-chawal-primary hover:bg-chawal-secondary"
                  onClick={() => {
                    addPayment(todayFormatted, partnerPaymentAmount, 'completed');
                  }}
                >
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Record Payment as Completed
                </Button>
              )}
              
              {todayProfit > 0 && (
                <Button
                  variant="outline"
                  className="w-full mt-2"
                  onClick={() => {
                    addPayment(todayFormatted, partnerPaymentAmount, 'pending');
                  }}
                >
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Mark as Pending Payment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Pending Payments</CardTitle>
            <CardDescription>
              All pending payments to partners
            </CardDescription>
          </CardHeader>
          <CardContent>
            {pendingPayments.length > 0 ? (
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-chawal-muted">Total Pending Amount</p>
                  <p className="text-xl font-bold text-chawal-danger">₹{totalPendingAmount.toLocaleString()}</p>
                </div>
                
                <div className="overflow-y-auto max-h-[200px]">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2 px-3 text-left">Date</th>
                        <th className="py-2 px-3 text-right">Amount</th>
                        <th className="py-2 px-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingPayments.map((payment) => (
                        <tr key={payment.id} className="border-b hover:bg-gray-50">
                          <td className="py-2 px-3">{format(new Date(payment.date), 'dd MMM yyyy')}</td>
                          <td className="py-2 px-3 text-right font-medium">₹{payment.amount.toLocaleString()}</td>
                          <td className="py-2 px-3 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-chawal-success hover:text-chawal-success hover:bg-green-50"
                              onClick={() => handleUpdateStatus(payment.id, 'completed')}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Mark Paid
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-chawal-muted">
                No pending payments
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="history">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="history">Payment History</TabsTrigger>
          <TabsTrigger value="add">Add Manual Payment</TabsTrigger>
        </TabsList>
        
        <TabsContent value="history">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <CardTitle>Payment History</CardTitle>
                  <CardDescription>
                    Complete record of all partner payments
                  </CardDescription>
                </div>
                
                <div className="relative w-full sm:w-60">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search payments..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredPayments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left">Date</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4 text-center">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredPayments
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((payment) => (
                          <tr key={payment.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{format(new Date(payment.date), 'PPP')}</td>
                            <td className="py-3 px-4 text-right font-medium">₹{payment.amount.toLocaleString()}</td>
                            <td className="py-3 px-4 text-center">
                              <Badge
                                variant={payment.status === 'completed' ? 'default' : 'outline'}
                                className={payment.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-amber-100 text-amber-800 hover:bg-amber-100'}
                              >
                                {payment.status === 'completed' ? 'Completed' : 'Pending'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right">
                              {payment.status === 'pending' ? (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-chawal-success hover:text-chawal-success hover:bg-green-50"
                                  onClick={() => handleUpdateStatus(payment.id, 'completed')}
                                >
                                  <CheckCircle2 className="h-4 w-4 mr-1" />
                                  Mark Paid
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="text-chawal-warning hover:text-chawal-warning hover:bg-amber-50"
                                  onClick={() => handleUpdateStatus(payment.id, 'pending')}
                                >
                                  <AlertTriangle className="h-4 w-4 mr-1" />
                                  Mark Pending
                                </Button>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-chawal-muted">
                  {searchQuery ? 'No matching payment records found' : 'No payment records yet'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add Manual Payment</CardTitle>
              <CardDescription>
                Record a manual payment to partner
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="amount">Payment Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Payment Status</Label>
                    <Select
                      value={paymentStatus}
                      onValueChange={(value) => setPaymentStatus(value as 'completed' | 'pending')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
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
                  disabled={!paymentStatus || !paymentAmount}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Payment Record
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Payments;
