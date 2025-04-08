import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
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
import { Plus, Edit, Trash2, DollarSign, CalendarIcon, Check, X, Calendar as CalendarIconPrimary, ChevronLeft, ChevronRight, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { format, startOfMonth, endOfMonth, parseISO, isValid, addMonths, subMonths, isSameMonth, isSameDay, isWeekend, getDay } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

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
  payment_type: z.enum(['daily_wage', 'monthly_salary', 'advance']),
  notes: z.string().optional(),
});

const leaveFormSchema = z.object({
  worker_id: z.string().min(1, {
    message: "Worker must be selected.",
  }),
  leave_date: z.date({
    required_error: "Leave date is required.",
  }),
  leave_type: z.enum(['full_day', 'half_day']),
  reason: z.string().optional(),
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
    workerLeaves,
    addWorkerLeave,
    updateWorkerLeave,
    deleteWorkerLeave,
    updateLeaveApprovalStatus,
    getWorkerLeavesByMonth,
    getMonthlyWorkingDays,
    getMonthlyApprovedLeaveDays,
    calculateMonthlySalaryAfterLeaves,
    loading 
  } = useData();
  
  const [activeTab, setActiveTab] = useState("workers");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
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
  const [addLeaveOpen, setAddLeaveOpen] = useState(false);
  const [leaveDetailsOpen, setLeaveDetailsOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [deleteLeaveDialogOpen, setDeleteLeaveDialogOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<any>(null);
  
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
      notes: "",
    },
  });
  
  const leaveForm = useForm<z.infer<typeof leaveFormSchema>>({
    resolver: zodResolver(leaveFormSchema),
    defaultValues: {
      worker_id: "",
      leave_date: new Date(),
      leave_type: "full_day",
      reason: "",
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
      await addWorkerPayment(
        values.worker_id,
        values.amount,
        format(values.payment_date, 'yyyy-MM-dd'),
        values.payment_type,
        values.notes || undefined
      );
      paymentForm.reset({
        ...paymentForm.getValues(),
        amount: 0,
        notes: "",
      });
      setAddPaymentOpen(false);
    } catch (error) {
      toast.error('Failed to add payment');
    }
  };
  
  const onAddLeaveSubmit = async (values: z.infer<typeof leaveFormSchema>) => {
    try {
      await addWorkerLeave(
        values.worker_id,
        format(values.leave_date, 'yyyy-MM-dd'),
        values.leave_type,
        values.reason
      );
      leaveForm.reset();
      setAddLeaveOpen(false);
    } catch (error) {
      toast.error('Failed to add leave application');
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
  
  const handleViewLeave = (leave: any) => {
    setSelectedLeave(leave);
    setLeaveDetailsOpen(true);
  };
  
  const handleDeleteLeave = (leave: any) => {
    setLeaveToDelete(leave);
    setDeleteLeaveDialogOpen(true);
  };
  
  const confirmDeleteLeave = async () => {
    if (!leaveToDelete) return;
    
    try {
      await deleteWorkerLeave(leaveToDelete.id);
      setDeleteLeaveDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete leave application');
    }
  };
  
  const handleApproveLeave = async (id: string) => {
    try {
      await updateLeaveApprovalStatus(id, 'approved');
      if (selectedLeave && selectedLeave.id === id) {
        setSelectedLeave({
          ...selectedLeave,
          approval_status: 'approved'
        });
      }
    } catch (error) {
      toast.error('Failed to approve leave');
    }
  };
  
  const handleRejectLeave = async (id: string) => {
    try {
      await updateLeaveApprovalStatus(id, 'rejected');
      if (selectedLeave && selectedLeave.id === id) {
        setSelectedLeave({
          ...selectedLeave,
          approval_status: 'rejected'
        });
      }
    } catch (error) {
      toast.error('Failed to reject leave');
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
      default: return type;
    }
  };
  
  const getDayLeaveStatus = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const dayLeaves = workerLeaves.filter(leave => leave.leave_date === formattedDate);
    
    if (!dayLeaves.length) return null;
    
    const approved = dayLeaves.filter(l => l.approval_status === 'approved').length;
    const pending = dayLeaves.filter(l => l.approval_status === 'pending').length;
    const rejected = dayLeaves.filter(l => l.approval_status === 'rejected').length;
    
    if (approved > 0) return 'approved';
    if (pending > 0) return 'pending';
    if (rejected > 0) return 'rejected';
    return null;
  };
  
  const getWorkerNameById = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : 'Unknown';
  };
  
  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case 'full_day': return 'Full Day';
      case 'half_day': return 'Half Day';
      default: return type;
    }
  };
  
  const getLeavesForDate = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return workerLeaves.filter(leave => leave.leave_date === formattedDate);
  };
  
  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    
    if (!isSameMonth(date, calendarMonth)) {
      setCalendarMonth(date);
    }
  };
  
  const handlePreviousMonth = () => {
    setCalendarMonth(prevMonth => subMonths(prevMonth, 1));
  };
  
  const handleNextMonth = () => {
    setCalendarMonth(prevMonth => addMonths(prevMonth, 1));
  };
  
  const renderDay = (date: Date) => {
    const dayLeaveStatus = getDayLeaveStatus(date);
    const isSelected = isSameDay(date, selectedDate);
    const isWeekendDay = isWeekend(date);
    
    return (
      <div
        className={cn(
          "relative w-full h-full flex items-center justify-center",
          isSelected && "rounded-full bg-primary text-primary-foreground",
          !isSelected && dayLeaveStatus === 'approved' && "bg-green-100 text-green-800",
          !isSelected && dayLeaveStatus === 'pending' && "bg-yellow-100 text-yellow-800",
          !isSelected && dayLeaveStatus === 'rejected' && "bg-red-100 text-red-800",
          !isSelected && isWeekendDay && "text-muted-foreground bg-muted/50"
        )}
      >
        {date.getDate()}
        {dayLeaveStatus && (
          <div className={cn(
            "absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full",
            dayLeaveStatus === 'approved' && "bg-green-500",
            dayLeaveStatus === 'pending' && "bg-yellow-500",
            dayLeaveStatus === 'rejected' && "bg-red-500"
          )} />
        )}
      </div>
    );
  };
  
  if (loading) {
    return <p>Loading workers data...</p>;
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Workers & Salary</h2>
        <div className="flex space-x-2">
          {activeTab === "workers" && (
            <>
              <Dialog open={addPaymentOpen} onOpenChange={setAddPaymentOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <DollarSign className="mr-2 h-4 w-4" />
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
                        
                        <FormField
                          control={paymentForm.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Amount</FormLabel>
                              <FormControl>
                                <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
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
            </>
          )}
          
          {activeTab === "leaves" && (
            <Dialog open={addLeaveOpen} onOpenChange={setAddLeaveOpen}>
              <DialogTrigger asChild>
                <Button variant="default">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Leave
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Apply for Leave</DialogTitle>
                  <DialogDescription>
                    Submit a leave application for approval.
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[60vh]">
                  <Form {...leaveForm}>
                    <form onSubmit={leaveForm.handleSubmit(onAddLeaveSubmit)} className="space-y-4 p-1">
                      <FormField
                        control={leaveForm.control}
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
                        control={leaveForm.control}
                        name="leave_type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Leave Type</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select leave type" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="full_day">Full Day</SelectItem>
                                <SelectItem value="half_day">Half Day</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={leaveForm.control}
                        name="leave_date"
                        render={({ field }) => (
                          <FormItem className="flex flex-col">
                            <FormLabel>Leave Date</FormLabel>
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
                                  className={cn("p-3 pointer-events-auto")}
                                />
                              </PopoverContent>
                            </Popover>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={leaveForm.control}
                        name="reason"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Reason (Optional)</FormLabel>
                            <FormControl>
                              <Textarea {...field} placeholder="Enter reason for leave" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </form>
                  </Form>
                </ScrollArea>
                <DialogFooter>
                  <Button type="button" onClick={leaveForm.handleSubmit(onAddLeaveSubmit)}>Apply for Leave</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>
      
      <Tabs defaultValue="workers" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="workers">Workers</TabsTrigger>
          <TabsTrigger value="leaves">Leaves</TabsTrigger>
        </TabsList>
        
        <TabsContent value="workers">
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
        </TabsContent>
        
        <TabsContent value="leaves">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Leave Calendar</CardTitle>
                <CardDescription>
                  View and manage worker leaves.
                </CardDescription>
                <div className="flex items-center justify-between space-x-2">
                  <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <h3 className="text-sm font-medium">
                    {format(calendarMonth, 'MMMM yyyy')}
                  </h3>
                  <Button variant="outline" size="sm" onClick={handleNextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={handleSelectDate}
                  month={calendarMonth}
                  className={cn("p-0 rounded-md border pointer-events-auto")}
                  components={{
                    Day: ({ date, ...props }) => (
                      <button {...props}>
                        {renderDay(date)}
                      </button>
                    ),
                  }}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Leaves for {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
                <CardDescription>
                  {isWeekend(selectedDate) ? 'Weekend' : 'Working day'} - {getLeavesForDate(selectedDate).length} leave request(s)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px]">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Worker</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getLeavesForDate(selectedDate).length > 0 ? (
                        getLeavesForDate(selectedDate).map((leave) => (
                          <TableRow key={leave.id}>
                            <TableCell>{getWorkerNameById(leave.worker_id)}</TableCell>
                            <TableCell>{getLeaveTypeLabel(leave.leave_type)}</TableCell>
                            <TableCell>
                              <span className={cn(
                                "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                                leave.approval_status === 'approved' &&
