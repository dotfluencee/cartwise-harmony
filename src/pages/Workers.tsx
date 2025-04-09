
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
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus, Edit, Trash2, IndianRupee, CalendarIcon, DollarSign } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, startOfMonth, endOfMonth, parseISO, isValid } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";

const workerFormSchema = z.object({
  name: z.string().min(2, {
    message: "Worker name must be at least 2 characters.",
  }),
  payment_type: z.enum(['daily', 'monthly']),
  monthly_salary: z.number().min(0).optional(),
  daily_wage: z.number().min(0).optional(),
});

const paymentFormSchema = z.object({
  worker_id: z.string().min(1, {
    message: "Worker must be selected.",
  }),
  amount: z.number().min(0, {
    message: "Amount must be a positive number.",
  }),
  payment_date: z.date({
    required_error: "Payment date is required.",
  }),
  payment_type: z.enum(['daily_wage', 'monthly_salary', 'advance', 'leave']),
  attendance: z.enum(['present', 'absent']).default('present'),
  notes: z.string().optional(),
});

const Workers = () => {
  const { 
    workers, 
    addWorker, 
    updateWorker, 
    deleteWorker, 
    workerPayments, 
    addWorkerPayment,
    updateWorkerPayment,
    deleteWorkerPayment,
    getWorkerPaymentsByMonth,
    getWorkerAdvanceTotal,
    calculateRemainingMonthlySalary,
    loading 
  } = useData();
  
  const [addWorkerOpen, setAddWorkerOpen] = useState(false);
  const [editWorkerOpen, setEditWorkerOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [paymentsDialogOpen, setPaymentsDialogOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState<any>(null);
  const [deletePaymentDialogOpen, setDeletePaymentDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  
  const addWorkerForm = useForm<z.infer<typeof workerFormSchema>>({
    resolver: zodResolver(workerFormSchema),
    defaultValues: {
      name: "",
      payment_type: "daily",
      monthly_salary: 0,
      daily_wage: 0,
    },
  });
  
  const editWorkerForm = useForm<z.infer<typeof workerFormSchema>>({
    resolver: zodResolver(workerFormSchema),
    defaultValues: {
      name: "",
      payment_type: "daily",
      monthly_salary: 0,
      daily_wage: 0,
    },
  });
  
  const paymentForm = useForm<z.infer<typeof paymentFormSchema>>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      worker_id: "",
      amount: 0,
      payment_date: new Date(),
      payment_type: "daily_wage",
      attendance: "present",
      notes: "",
    },
  });
  
  useEffect(() => {
    if (selectedWorker) {
      editWorkerForm.reset({
        name: selectedWorker.name,
        payment_type: selectedWorker.payment_type,
        monthly_salary: selectedWorker.monthly_salary,
        daily_wage: selectedWorker.daily_wage,
      });
    }
  }, [selectedWorker, editWorkerForm]);
  
  const onAddWorkerSubmit = async (values: z.infer<typeof workerFormSchema>) => {
    try {
      await addWorker(
        values.name, 
        values.payment_type, 
        values.payment_type === 'monthly' ? values.monthly_salary || 0 : 0,
        values.payment_type === 'daily' ? values.daily_wage || 0 : 0
      );
      addWorkerForm.reset();
      setAddWorkerOpen(false);
    } catch (error) {
      toast.error('Failed to add worker');
    }
  };
  
  const onEditWorkerSubmit = async (values: z.infer<typeof workerFormSchema>) => {
    if (!selectedWorker) return;
    
    try {
      const updatedWorker = {
        ...selectedWorker,
        name: values.name,
        payment_type: values.payment_type,
        monthly_salary: values.payment_type === 'monthly' ? values.monthly_salary || 0 : 0,
        daily_wage: values.payment_type === 'daily' ? values.daily_wage || 0 : 0,
      };
      
      await updateWorker(updatedWorker);
      setEditWorkerOpen(false);
    } catch (error) {
      toast.error('Failed to update worker');
    }
  };
  
  const onAddPaymentSubmit = async (values: z.infer<typeof paymentFormSchema>) => {
    try {
      const selectedWorker = workers.find(w => w.id === values.worker_id);
      if (!selectedWorker) {
        toast.error('Worker not found');
        return;
      }
      
      let paymentType = values.payment_type;
      let amount = values.amount;
      let notes = values.notes;
      
      // Handle leave (absence)
      if (values.attendance === 'absent') {
        if (selectedWorker.payment_type === 'monthly') {
          // For monthly workers, create a leave entry with daily wage as the deduction amount
          paymentType = 'leave';
          amount = selectedWorker.daily_wage || 0;
          notes = (notes ? notes + ' - ' : '') + 'Absent';
        } else {
          // For daily workers, don't record payment for absence
          toast.info('No payment recorded for absence');
          setAddPaymentOpen(false);
          return;
        }
      }
      
      await addWorkerPayment(
        values.worker_id,
        amount,
        format(values.payment_date, 'yyyy-MM-dd'),
        paymentType,
        notes || undefined
      );
      
      paymentForm.reset({
        ...paymentForm.getValues(),
        amount: 0,
        attendance: 'present',
        notes: "",
      });
      
      setAddPaymentOpen(false);
    } catch (error) {
      toast.error('Failed to add payment');
    }
  };
  
  const handleEdit = (worker: any) => {
    setSelectedWorker(worker);
    setEditWorkerOpen(true);
  };
  
  const handleDelete = (worker: any) => {
    setWorkerToDelete(worker);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!workerToDelete) return;
    
    try {
      await deleteWorker(workerToDelete.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete worker');
    }
  };
  
  const handleViewPayments = (workerId: string) => {
    setSelectedWorkerId(workerId);
    setPaymentsDialogOpen(true);
  };
  
  const handleDeletePayment = (payment: any) => {
    setPaymentToDelete(payment);
    setDeletePaymentDialogOpen(true);
  };
  
  const confirmDeletePayment = async () => {
    if (!paymentToDelete) return;
    
    try {
      await deleteWorkerPayment(paymentToDelete.id);
      setDeletePaymentDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete payment');
    }
  };
  
  const getWorkerPayments = (workerId: string) => {
    return getWorkerPaymentsByMonth(workerId, currentMonth);
  };
  
  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'daily_wage': return 'Daily Wage';
      case 'monthly_salary': return 'Monthly Salary';
      case 'advance': return 'Advance';
      case 'leave': return 'Leave';
      default: return type;
    }
  };
  
  if (loading) {
    return <p>Loading workers data...</p>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Workers & Salary</h2>
        <div className="flex space-x-2">
          <Dialog open={addPaymentOpen} onOpenChange={setAddPaymentOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <IndianRupee className="mr-2 h-4 w-4" />
                Record Payment
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Record Worker Payment</DialogTitle>
                <DialogDescription>
                  Record a payment for a worker (daily wage, monthly salary, or advance).
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                <Form {...paymentForm}>
                  <form onSubmit={paymentForm.handleSubmit(onAddPaymentSubmit)} className="space-y-4 p-1">
                    <FormField
                      control={paymentForm.control}
                      name="worker_id"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Worker</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a worker" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {workers.map((worker) => (
                                <SelectItem key={worker.id} value={worker.id}>
                                  {worker.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={paymentForm.control}
                      name="attendance"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Attendance</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select attendance" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="present">Present</SelectItem>
                              <SelectItem value="absent">Absent</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {paymentForm.watch('attendance') === 'present' && (
                      <FormField
                        control={paymentForm.control}
                        name="payment_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Payment Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select payment type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="daily_wage">Daily Wage</SelectItem>
                                <SelectItem value="monthly_salary">Monthly Salary</SelectItem>
                                <SelectItem value="advance">Advance</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    {(paymentForm.watch('attendance') === 'present' || 
                      (paymentForm.watch('attendance') === 'absent' && 
                       workers.find(w => w.id === paymentForm.watch('worker_id'))?.payment_type === 'monthly')) && (
                      <FormField
                        control={paymentForm.control}
                        name="amount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Amount</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                {...field} 
                                onChange={e => field.onChange(Number(e.target.value))}
                                disabled={paymentForm.watch('attendance') === 'absent'} 
                                value={paymentForm.watch('attendance') === 'absent' ? 
                                  (workers.find(w => w.id === paymentForm.watch('worker_id'))?.daily_wage || 0) : 
                                  field.value} 
                              />
                            </FormControl>
                            {paymentForm.watch('attendance') === 'absent' && (
                              <p className="text-sm text-muted-foreground">
                                For absence, the daily wage amount will be deducted from monthly salary.
                              </p>
                            )}
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    <FormField
                      control={paymentForm.control}
                      name="payment_date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Payment Date</FormLabel>
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
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={paymentForm.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Notes (Optional)</FormLabel>
                          <FormControl>
                            <Input {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </form>
                </Form>
              </ScrollArea>
              <DialogFooter>
                <Button type="button" onClick={paymentForm.handleSubmit(onAddPaymentSubmit)}>Record Payment</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Dialog open={addWorkerOpen} onOpenChange={setAddWorkerOpen}>
            <DialogTrigger asChild>
              <Button variant="default">
                <Plus className="mr-2 h-4 w-4" />
                Add Worker
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Worker</DialogTitle>
                <DialogDescription>
                  Add a new worker to the system.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh]">
                <Form {...addWorkerForm}>
                  <form onSubmit={addWorkerForm.handleSubmit(onAddWorkerSubmit)} className="space-y-4 p-1">
                    <FormField
                      control={addWorkerForm.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Worker Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={addWorkerForm.control}
                      name="payment_type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Payment Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select payment type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Daily Wage</SelectItem>
                              <SelectItem value="monthly">Monthly Salary</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    {addWorkerForm.watch('payment_type') === 'monthly' && (
                      <FormField
                        control={addWorkerForm.control}
                        name="monthly_salary"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Monthly Salary</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Monthly Salary" 
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value))} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                    
                    {addWorkerForm.watch('payment_type') === 'daily' && (
                      <FormField
                        control={addWorkerForm.control}
                        name="daily_wage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Daily Wage</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Daily Wage" 
                                {...field}
                                onChange={e => field.onChange(Number(e.target.value))} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </form>
                </Form>
              </ScrollArea>
              <DialogFooter>
                <Button type="button" onClick={addWorkerForm.handleSubmit(onAddWorkerSubmit)}>Add Worker</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Workers</CardTitle>
          <CardDescription>
            Manage workers and their payment information.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[200px]">Name</TableHead>
                  <TableHead>Payment Type</TableHead>
                  <TableHead>Monthly Salary</TableHead>
                  <TableHead>Daily Wage</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {workers.map((worker) => (
                  <TableRow key={worker.id}>
                    <TableCell className="font-medium">{worker.name}</TableCell>
                    <TableCell>{worker.payment_type === 'monthly' ? 'Monthly Salary' : 'Daily Wage'}</TableCell>
                    <TableCell>{worker.payment_type === 'monthly' ? `₹${worker.monthly_salary.toFixed(2)}` : 'N/A'}</TableCell>
                    <TableCell>{worker.payment_type === 'daily' ? `₹${worker.daily_wage.toFixed(2)}` : 'N/A'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => handleViewPayments(worker.id)}>
                          <DollarSign className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleEdit(worker)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDelete(worker)}>
                          <Trash2 className="h-4 w-4" />
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
      
      {/* Edit Worker Dialog */}
      <Dialog open={editWorkerOpen} onOpenChange={setEditWorkerOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Worker</DialogTitle>
            <DialogDescription>
              Update worker information.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <Form {...editWorkerForm}>
              <form onSubmit={editWorkerForm.handleSubmit(onEditWorkerSubmit)} className="space-y-4 p-1">
                <FormField
                  control={editWorkerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Worker Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={editWorkerForm.control}
                  name="payment_type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Payment Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select payment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="daily">Daily Wage</SelectItem>
                          <SelectItem value="monthly">Monthly Salary</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                {editWorkerForm.watch('payment_type') === 'monthly' && (
                  <FormField
                    control={editWorkerForm.control}
                    name="monthly_salary"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Monthly Salary</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Monthly Salary" 
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
                
                {editWorkerForm.watch('payment_type') === 'daily' && (
                  <FormField
                    control={editWorkerForm.control}
                    name="daily_wage"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Daily Wage</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Daily Wage" 
                            {...field}
                            onChange={e => field.onChange(Number(e.target.value))} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </form>
            </Form>
          </ScrollArea>
          <DialogFooter>
            <Button type="button" onClick={editWorkerForm.handleSubmit(onEditWorkerSubmit)}>Update Worker</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Worker Payments Dialog */}
      <Dialog open={paymentsDialogOpen} onOpenChange={setPaymentsDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              Payment History for {selectedWorkerId ? workers.find(w => w.id === selectedWorkerId)?.name : ''}
            </DialogTitle>
            <DialogDescription>
              View and manage payment records.
            </DialogDescription>
          </DialogHeader>
          <div className="mb-4">
            <Label>Month</Label>
            <div className="flex items-center gap-2 mt-2">
              <Input 
                type="month" 
                value={currentMonth} 
                onChange={(e) => setCurrentMonth(e.target.value)}
                className="w-40"
              />
            </div>
          </div>
          <ScrollArea className="h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {selectedWorkerId ? (
                  getWorkerPayments(selectedWorkerId).length > 0 ? (
                    getWorkerPayments(selectedWorkerId).map((payment) => (
                      <TableRow key={payment.id}>
                        <TableCell>{payment.payment_date}</TableCell>
                        <TableCell>{getPaymentTypeLabel(payment.payment_type)}</TableCell>
                        <TableCell>${payment.amount.toFixed(2)}</TableCell>
                        <TableCell>{payment.notes || '-'}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleDeletePayment(payment)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center">No payments for this period.</TableCell>
                    </TableRow>
                  )
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">Select a worker to view payments.</TableCell>
                  </TableRow>
                )}
              </TableBody>
              {selectedWorkerId && (
                <TableFooter>
                  <TableRow>
                    <TableCell colSpan={2}>Total Advances</TableCell>
                    <TableCell>${getWorkerAdvanceTotal(selectedWorkerId, currentMonth).toFixed(2)}</TableCell>
                    <TableCell colSpan={2}></TableCell>
                  </TableRow>
                  {workers.find(w => w.id === selectedWorkerId)?.payment_type === 'monthly' && (
                    <TableRow>
                      <TableCell colSpan={2}>Remaining Monthly Salary</TableCell>
                      <TableCell>${calculateRemainingMonthlySalary(selectedWorkerId, currentMonth).toFixed(2)}</TableCell>
                      <TableCell colSpan={2}></TableCell>
                    </TableRow>
                  )}
                </TableFooter>
              )}
            </Table>
          </ScrollArea>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentsDialogOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Worker Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {workerToDelete?.name} and all associated payment records.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Delete Payment Confirmation */}
      <AlertDialog open={deletePaymentDialogOpen} onOpenChange={setDeletePaymentDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this payment record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePayment}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Workers;
