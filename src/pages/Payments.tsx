
import React, { useState } from 'react';
import { format, endOfMonth, startOfMonth, parseISO } from 'date-fns';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  CalendarIcon, 
  PlusCircle, 
  SearchIcon, 
  CheckCircle2, 
  AlertTriangle, 
  CalculatorIcon, 
  PencilIcon, 
  Trash2Icon 
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Checkbox } from '@/components/ui/checkbox';

const Payments = () => {
  const {
    payments,
    addPayment,
    updatePayment,
    deletePayment,
    updatePaymentStatus,
    getPendingPayments,
    getTotalPendingAmount,
    getDailyProfit,
    getMonthlyProfit,
    getMonthlyNetProfit,
    getMonthlyPendingPayment,
    workers,
    workerPayments,
    addWorkerPayment,
    getWorkerAdvanceTotal,
    calculateMonthlySalaryAfterLeaves,
    calculateRemainingMonthlySalary,
    addWorkerLeave
  } = useData();
  
  // State for the new payment form
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState<'completed' | 'pending' | ''>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // State for daily payment
  const [dailyPaymentAmount, setDailyPaymentAmount] = useState('2');
  
  // State for filtering payments
  const [searchQuery, setSearchQuery] = useState('');
  
  // State for editing payment
  const [editPayment, setEditPayment] = useState<{
    id: string;
    date: Date;
    amount: string;
    status: 'completed' | 'pending';
  } | null>(null);
  
  // State for worker payments
  const [selectedWorker, setSelectedWorker] = useState<string>('');
  const [workerPaymentAmount, setWorkerPaymentAmount] = useState('');
  const [workerPaymentDate, setWorkerPaymentDate] = useState<Date>(new Date());
  const [paymentType, setPaymentType] = useState<'daily_wage' | 'monthly_salary' | 'advance'>('daily_wage');
  const [isAbsent, setIsAbsent] = useState(false);
  const [absenceType, setAbsenceType] = useState<'full_day' | 'half_day'>('full_day');
  const [absenceReason, setAbsenceReason] = useState('');
  const [workerPaymentNotes, setWorkerPaymentNotes] = useState('');
  const [workerPaymentDialogOpen, setWorkerPaymentDialogOpen] = useState(false);
  
  // Format date for database
  const formatDateForDb = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };
  
  // Handle payment form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!paymentStatus || !paymentAmount) {
      toast.error('Please fill in all fields');
      return;
    }
    
    const amount = parseFloat(paymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    addPayment(formatDateForDb(selectedDate), amount, paymentStatus);
    
    // Reset form
    setPaymentAmount('');
    setPaymentStatus('');
    setSelectedDate(new Date());
  };
  
  // Handle edit payment submission
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editPayment) return;
    
    const amount = parseFloat(editPayment.amount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    updatePayment({
      id: editPayment.id,
      date: formatDateForDb(editPayment.date),
      amount,
      status: editPayment.status
    });
    
    // Reset edit form
    setEditPayment(null);
  };
  
  // Handle daily payment submission
  const handleDailyPayment = (status: 'completed' | 'pending') => {
    const amount = parseFloat(dailyPaymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    const todayFormatted = formatDateForDb(new Date());
    addPayment(todayFormatted, amount, status);
    toast.success(`Daily payment of ₹${amount} recorded as ${status}`);
    setDailyPaymentAmount('2'); // Reset to default after submission
  };
  
  // Handle worker payment submission
  const handleWorkerPaymentSubmit = () => {
    if (!selectedWorker) {
      toast.error('Please select a worker');
      return;
    }
    
    const amount = parseFloat(workerPaymentAmount);
    if (isNaN(amount) || amount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }
    
    const paymentDateFormatted = formatDateForDb(workerPaymentDate);
    
    // If worker is absent, register leave and adjust payment
    if (isAbsent) {
      // First record the leave
      addWorkerLeave(
        selectedWorker,
        paymentDateFormatted,
        absenceType,
        absenceReason
      );
      
      // Set approval status automatically to approved
      // This would typically be done in the backend, but for simplicity,
      // we're handling it here
      toast.info(`${absenceType === 'full_day' ? 'Full day' : 'Half day'} absence recorded for the worker`);
    }
    
    // Now record the payment (possibly reduced due to absence)
    addWorkerPayment(
      selectedWorker,
      amount,
      paymentDateFormatted,
      paymentType,
      workerPaymentNotes
    );
    
    // Reset form
    setSelectedWorker('');
    setWorkerPaymentAmount('');
    setWorkerPaymentDate(new Date());
    setPaymentType('daily_wage');
    setIsAbsent(false);
    setAbsenceType('full_day');
    setAbsenceReason('');
    setWorkerPaymentNotes('');
    setWorkerPaymentDialogOpen(false);
  };
  
  // Handle payment status update
  const handleUpdateStatus = (id: string, newStatus: 'completed' | 'pending') => {
    updatePaymentStatus(id, newStatus);
  };

  // Handle payment deletion
  const handleDeletePayment = (id: string) => {
    deletePayment(id);
  };
  
  // Filter payments based on search query
  const filteredPayments = payments.filter(payment => {
    return (
      payment.date.includes(searchQuery) ||
      payment.status.includes(searchQuery) ||
      payment.amount.toString().includes(searchQuery)
    );
  });
  
  // Calculate partner payment for today
  const today = new Date();
  const todayFormatted = formatDateForDb(today);
  const todayProfit = getDailyProfit(todayFormatted);
  
  // Get current month details for monthly settlement
  const currentMonth = format(today, 'yyyy-MM');
  const monthlyProfit = getMonthlyProfit(currentMonth);
  const partnerShareAmount = monthlyProfit / 2; // 50% of total profit
  
  // Calculate how much has been paid to partner this month
  const paidToPartner = payments
    .filter(payment => payment.date.startsWith(currentMonth) && payment.status === 'completed')
    .reduce((total, payment) => total + payment.amount, 0);
  
  // Calculate pending amount for month-end settlement
  const pendingMonthlySettlement = Math.max(0, partnerShareAmount - paidToPartner);
  
  // Get pending payments
  const pendingPayments = getPendingPayments();
  const totalPendingAmount = getTotalPendingAmount();
  
  // Check if today is the last day of the month
  const isLastDayOfMonth = format(endOfMonth(today), 'yyyy-MM-dd') === format(today, 'yyyy-MM-dd');
  
  // Get worker info
  const getWorkerName = (id: string) => {
    const worker = workers.find(w => w.id === id);
    return worker ? worker.name : 'Unknown';
  };
  
  const calculateWorkerPayment = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    if (!worker) return 0;
    
    // If daily wage worker
    if (worker.payment_type === 'daily') {
      return isAbsent && absenceType === 'full_day' ? 0 : 
             isAbsent && absenceType === 'half_day' ? worker.daily_wage / 2 : 
             worker.daily_wage;
    }
    
    // If monthly salary worker and it's end of month
    if (worker.payment_type === 'monthly') {
      // Return remaining salary calculation
      const remainingSalary = calculateRemainingMonthlySalary(workerId, currentMonth);
      return remainingSalary;
    }
    
    return 0;
  };
  
  // Update payment amount when worker or absence status changes
  React.useEffect(() => {
    if (selectedWorker) {
      const amount = calculateWorkerPayment(selectedWorker);
      setWorkerPaymentAmount(amount.toString());
    }
  }, [selectedWorker, isAbsent, absenceType, paymentType]);
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Partner Payments</h2>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Daily Payment</CardTitle>
            <CardDescription>
              Variable daily payment to partner
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Today's Profit</p>
                <p className={`text-xl font-bold ${todayProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{todayProfit.toLocaleString()}
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="dailyAmount">Partner's Daily Payment Amount (₹)</Label>
                <div className="flex space-x-2">
                  <Input
                    id="dailyAmount"
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    value={dailyPaymentAmount}
                    onChange={(e) => setDailyPaymentAmount(e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <Button
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={() => handleDailyPayment('completed')}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Record Payment as Completed
              </Button>
              
              <Button
                variant="outline"
                className="w-full mt-2"
                onClick={() => handleDailyPayment('pending')}
              >
                <AlertTriangle className="h-4 w-4 mr-2" />
                Mark as Pending Payment
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Monthly Settlement</CardTitle>
            <CardDescription>
              End of month profit sharing (50%)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Monthly Profit</p>
                  <p className={`text-xl font-bold ${monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{monthlyProfit.toLocaleString()}
                  </p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Partner's Share (50%)</p>
                  <p className="text-xl font-bold">₹{partnerShareAmount.toLocaleString()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Already Paid This Month</p>
                  <p className="text-xl font-bold">₹{paidToPartner.toLocaleString()}</p>
                </div>
                
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-500">Pending Settlement</p>
                  <p className="text-xl font-bold text-amber-600">₹{pendingMonthlySettlement.toLocaleString()}</p>
                </div>
              </div>
              
              {isLastDayOfMonth && pendingMonthlySettlement > 0 && (
                <Button
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    addPayment(todayFormatted, pendingMonthlySettlement, 'completed');
                    toast.success(`Monthly settlement of ₹${pendingMonthlySettlement.toLocaleString()} recorded`);
                  }}
                >
                  <CalculatorIcon className="h-4 w-4 mr-2" />
                  Settle Monthly Payment
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pending Payments</CardTitle>
              <CardDescription>
                All pending payments to partner
              </CardDescription>
            </div>
            <Dialog open={workerPaymentDialogOpen} onOpenChange={setWorkerPaymentDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Record Worker Payment
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Record Worker Payment</DialogTitle>
                  <DialogDescription>
                    Track payments to workers, including absence deductions.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="worker">Select Worker</Label>
                    <Select 
                      value={selectedWorker} 
                      onValueChange={setSelectedWorker}
                    >
                      <SelectTrigger id="worker">
                        <SelectValue placeholder="Select worker" />
                      </SelectTrigger>
                      <SelectContent>
                        {workers.map(worker => (
                          <SelectItem key={worker.id} value={worker.id}>
                            {worker.name} - {worker.payment_type === 'daily' ? `₹${worker.daily_wage}/day` : `₹${worker.monthly_salary}/month`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="payment-date">Payment Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !workerPaymentDate && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {workerPaymentDate ? format(workerPaymentDate, 'PPP') : <span>Pick a date</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={workerPaymentDate}
                          onSelect={(date) => date && setWorkerPaymentDate(date)}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="payment-type">Payment Type</Label>
                    <Select 
                      value={paymentType} 
                      onValueChange={(value) => setPaymentType(value as any)}
                    >
                      <SelectTrigger id="payment-type">
                        <SelectValue placeholder="Select payment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily_wage">Daily Wage</SelectItem>
                        <SelectItem value="monthly_salary">Monthly Salary</SelectItem>
                        <SelectItem value="advance">Advance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="absent" 
                      checked={isAbsent} 
                      onCheckedChange={(checked) => setIsAbsent(!!checked)}
                    />
                    <label
                      htmlFor="absent"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Worker was absent
                    </label>
                  </div>
                  
                  {isAbsent && (
                    <div className="space-y-4 pl-6 border-l-2 border-gray-200">
                      <div className="space-y-2">
                        <Label htmlFor="absence-type">Absence Type</Label>
                        <Select 
                          value={absenceType} 
                          onValueChange={(value) => setAbsenceType(value as any)}
                        >
                          <SelectTrigger id="absence-type">
                            <SelectValue placeholder="Select absence type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="full_day">Full Day</SelectItem>
                            <SelectItem value="half_day">Half Day</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="absence-reason">Reason (Optional)</Label>
                        <Input
                          id="absence-reason"
                          placeholder="Reason for absence"
                          value={absenceReason}
                          onChange={(e) => setAbsenceReason(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="worker-payment-amount">Payment Amount (₹)</Label>
                    <Input
                      id="worker-payment-amount"
                      type="number"
                      value={workerPaymentAmount}
                      onChange={(e) => setWorkerPaymentAmount(e.target.value)}
                      className="font-semibold"
                    />
                    {isAbsent && (
                      <p className="text-xs text-amber-600">
                        Amount adjusted for {absenceType === 'full_day' ? 'full day' : 'half day'} absence
                      </p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="worker-payment-notes">Notes (Optional)</Label>
                    <Input
                      id="worker-payment-notes"
                      placeholder="Additional notes"
                      value={workerPaymentNotes}
                      onChange={(e) => setWorkerPaymentNotes(e.target.value)}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" onClick={handleWorkerPaymentSubmit}>Record Payment</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {pendingPayments.length > 0 ? (
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Total Pending Amount</p>
                <p className="text-xl font-bold text-red-600">₹{totalPendingAmount.toLocaleString()}</p>
              </div>
              
              <ScrollArea className="h-[200px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingPayments.map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{format(new Date(payment.date), 'dd MMM yyyy')}</TableCell>
                        <TableCell className="text-right font-medium">₹{payment.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => handleUpdateStatus(payment.id, 'completed')}
                          >
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Mark Paid
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No pending payments
            </div>
          )}
        </CardContent>
      </Card>
      
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
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPayments
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell>{format(new Date(payment.date), 'dd MMM yyyy')}</TableCell>
                            <TableCell className="text-right font-medium">₹{payment.amount.toLocaleString()}</TableCell>
                            <TableCell className="text-center">
                              <Badge
                                variant={payment.status === 'completed' ? 'default' : 'outline'}
                                className={payment.status === 'completed' ? 'bg-green-100 text-green-800 hover:bg-green-100' : 'bg-amber-100 text-amber-800 hover:bg-amber-100'}
                              >
                                {payment.status === 'completed' ? 'Completed' : 'Pending'}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                {payment.status === 'pending' ? (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-green-600 hover:text-green-700 hover:bg-green-50 h-8 px-2"
                                    onClick={() => handleUpdateStatus(payment.id, 'completed')}
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                    <span className="sr-only sm:not-sr-only sm:ml-1 sm:text-xs">Mark Paid</span>
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-amber-600 hover:text-amber-700 hover:bg-amber-50 h-8 px-2"
                                    onClick={() => handleUpdateStatus(payment.id, 'pending')}
                                  >
                                    <AlertTriangle className="h-4 w-4" />
                                    <span className="sr-only sm:not-sr-only sm:ml-1 sm:text-xs">Mark Pending</span>
                                  </Button>
                                )}
                                
                                <Dialog>
                                  <DialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8 px-2"
                                      onClick={() => setEditPayment({
                                        id: payment.id,
                                        date: new Date(payment.date),
                                        amount: payment.amount.toString(),
                                        status: payment.status
                                      })}
                                    >
                                      <PencilIcon className="h-4 w-4" />
                                      <span className="sr-only sm:not-sr-only sm:ml-1 sm:text-xs">Edit</span>
                                    </Button>
                                  </DialogTrigger>
                                  <DialogContent className="max-h-[90vh] overflow-auto">
                                    <DialogHeader>
                                      <DialogTitle>Edit Payment</DialogTitle>
                                      <DialogDescription>
                                        Update the payment details below.
                                      </DialogDescription>
                                    </DialogHeader>
                                    {editPayment && (
                                      <form onSubmit={handleEditSubmit} className="space-y-4">
                                        <div className="space-y-2">
                                          <Label htmlFor="edit-amount">Payment Amount (₹)</Label>
                                          <Input
                                            id="edit-amount"
                                            type="number"
                                            min="0"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={editPayment.amount}
                                            onChange={(e) => setEditPayment({...editPayment, amount: e.target.value})}
                                          />
                                        </div>
                                        
                                        <div className="space-y-2">
                                          <Label htmlFor="edit-status">Payment Status</Label>
                                          <Select
                                            value={editPayment.status}
                                            onValueChange={(value: 'completed' | 'pending') => 
                                              setEditPayment({...editPayment, status: value})
                                            }
                                          >
                                            <SelectTrigger id="edit-status">
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
                                                {format(editPayment.date, 'PPP')}
                                              </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0">
                                              <Calendar
                                                mode="single"
                                                selected={editPayment.date}
                                                onSelect={(date) => date && setEditPayment({...editPayment, date})}
                                                initialFocus
                                              />
                                            </PopoverContent>
                                          </Popover>
                                        </div>
                                        
                                        <DialogFooter>
                                          <DialogClose asChild>
                                            <Button type="button" variant="outline">Cancel</Button>
                                          </DialogClose>
                                          <Button type="submit" className="bg-green-600 hover:bg-green-700">
                                            Save Changes
                                          </Button>
                                        </DialogFooter>
                                      </form>
                                    )}
                                  </DialogContent>
                                </Dialog>
                                
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2"
                                    >
                                      <Trash2Icon className="h-4 w-4" />
                                      <span className="sr-only sm:not-sr-only sm:ml-1 sm:text-xs">Delete</span>
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Delete Payment Record</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        Are you sure you want to delete this payment record? This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        className="bg-red-600 hover:bg-red-700"
                                        onClick={() => handleDeletePayment(payment.id)}
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
              ) : (
                <div className="text-center py-4 text-gray-500">
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
              <ScrollArea className="h-[300px] pr-4">
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
                        <SelectTrigger id="status">
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
                    className="bg-green-600 hover:bg-green-700"
                    disabled={!paymentStatus || !paymentAmount}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Payment Record
                  </Button>
                </form>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Payments;
