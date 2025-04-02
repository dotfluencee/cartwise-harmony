import React, { useState } from 'react';
import { format } from 'date-fns';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, PlusCircle, SearchIcon, Edit, Trash2 } from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const expenseFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  amount: z.number().min(0.01, { message: "Amount must be greater than 0" }),
  description: z.string().optional(),
  date: z.date()
});

const Expenses = () => {
  const { expenses, addExpense, updateExpense, deleteExpense, getTotalExpensesByDate } = useData();
  
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [expenseName, setExpenseName] = useState<string>('');
  const [expenseDescription, setExpenseDescription] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  const [searchQuery, setSearchQuery] = useState('');
  const [viewDate, setViewDate] = useState<Date>(new Date());
  
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [expenseToEdit, setExpenseToEdit] = useState(null);
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState(null);
  
  const editForm = useForm<z.infer<typeof expenseFormSchema>>({
    resolver: zodResolver(expenseFormSchema),
    defaultValues: {
      name: "",
      amount: 0,
      description: "",
      date: new Date()
    }
  });
  
  const formatDateForDb = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!expenseName || !expenseAmount) {
      return;
    }
    
    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    
    addExpense(
      formatDateForDb(selectedDate), 
      amount, 
      expenseName,
      expenseDescription
    );
    
    setExpenseAmount('');
    setExpenseName('');
    setExpenseDescription('');
    setSelectedDate(new Date());
  };
  
  const handleEditExpense = (expense) => {
    setExpenseToEdit(expense);
    editForm.reset({
      name: expense.name,
      amount: expense.amount,
      description: expense.description || "",
      date: new Date(expense.date)
    });
    setEditDialogOpen(true);
  };
  
  const handleEditSubmit = (values: z.infer<typeof expenseFormSchema>) => {
    if (!expenseToEdit) return;
    
    const updatedExpense = {
      ...expenseToEdit,
      name: values.name,
      amount: values.amount,
      description: values.description || '',
      date: formatDateForDb(values.date)
    };
    
    updateExpense(updatedExpense);
    toast.success('Expense updated successfully');
    setEditDialogOpen(false);
  };
  
  const handleDeleteExpense = (expense) => {
    setExpenseToDelete(expense);
    setDeleteDialogOpen(true);
  };
  
  const confirmDeleteExpense = () => {
    if (!expenseToDelete) return;
    
    deleteExpense(expenseToDelete.id);
    toast.success('Expense deleted successfully');
    setDeleteDialogOpen(false);
  };
  
  const filteredExpenses = expenses.filter(expense => {
    return (
      expense.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.date.includes(searchQuery)
    );
  });
  
  const viewDateFormatted = formatDateForDb(viewDate);
  const totalExpensesForDate = getTotalExpensesByDate(viewDateFormatted);
  
  const expensesByName = expenses
    .filter(expense => expense.date === viewDateFormatted)
    .reduce((acc, expense) => {
      if (!acc[expense.name]) {
        acc[expense.name] = 0;
      }
      acc[expense.name] += expense.amount;
      return acc;
    }, {} as Record<string, number>);
  
  const expensesForDate = expenses.filter(expense => expense.date === viewDateFormatted);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Expense Management</h2>
      </div>
      
      <Tabs defaultValue="view">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view">View Expenses</TabsTrigger>
          <TabsTrigger value="add">Add New Expense</TabsTrigger>
        </TabsList>
        
        <TabsContent value="view" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <CardTitle>Daily Expenses Overview</CardTitle>
                  <CardDescription>
                    View expense data for a specific date
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
              {Object.keys(expensesByName).length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  {Object.entries(expensesByName)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 3)
                    .map(([name, amount]) => (
                      <div key={name} className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-muted-foreground">{name}</p>
                        <p className="text-xl font-bold">₹{amount.toLocaleString()}</p>
                      </div>
                    ))}
                </div>
              )}
              
              {expensesForDate.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left">Name</th>
                        <th className="py-3 px-4 text-left">Description</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expensesForDate.map((expense) => (
                        <tr key={expense.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{expense.name}</td>
                          <td className="py-3 px-4">{expense.description}</td>
                          <td className="py-3 px-4 text-right font-medium">₹{expense.amount.toLocaleString()}</td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex justify-end gap-2">
                              <Button variant="ghost" size="sm" onClick={() => handleEditExpense(expense)}>
                                <Edit className="h-4 w-4 mr-1" />
                                Edit
                              </Button>
                              <Button variant="ghost" size="sm" onClick={() => handleDeleteExpense(expense)}>
                                <Trash2 className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-medium">
                        <td colSpan={2} className="py-3 px-4">Total</td>
                        <td className="py-3 px-4 text-right">₹{totalExpensesForDate.toLocaleString()}</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No expense data available for this date
                </div>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <CardTitle>Expense History</CardTitle>
                  <CardDescription>
                    Complete record of all expense transactions
                  </CardDescription>
                </div>
                
                <div className="relative w-full sm:w-60">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search expenses..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredExpenses.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left">Date</th>
                        <th className="py-3 px-4 text-left">Name</th>
                        <th className="py-3 px-4 text-left">Description</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((expense) => (
                          <tr key={expense.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{format(new Date(expense.date), 'PPP')}</td>
                            <td className="py-3 px-4">{expense.name}</td>
                            <td className="py-3 px-4">{expense.description}</td>
                            <td className="py-3 px-4 text-right font-medium">₹{expense.amount.toLocaleString()}</td>
                            <td className="py-3 px-4 text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="sm" onClick={() => handleEditExpense(expense)}>
                                  <Edit className="h-4 w-4 mr-1" />
                                  Edit
                                </Button>
                                <Button variant="ghost" size="sm" onClick={() => handleDeleteExpense(expense)}>
                                  <Trash2 className="h-4 w-4 mr-1" />
                                  Delete
                                </Button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  {searchQuery ? 'No matching expense records found' : 'No expense records yet'}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Expense</CardTitle>
              <CardDescription>
                Record a new expense with name and description
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Expense Name</Label>
                    <Input
                      id="name"
                      placeholder="Enter expense name"
                      value={expenseName}
                      onChange={(e) => setExpenseName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="amount">Expense Amount (₹)</Label>
                    <Input
                      id="amount"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={expenseAmount}
                      onChange={(e) => setExpenseAmount(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Enter expense details"
                    value={expenseDescription}
                    onChange={(e) => setExpenseDescription(e.target.value)}
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
                
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary/90"
                  disabled={!expenseName || !expenseAmount}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Update the expense details.
            </DialogDescription>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh]">
            <Form {...editForm}>
              <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="space-y-4 p-1">
                <FormField
                  control={editForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Expense Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
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
                        <Input type="number" step="0.01" {...field} onChange={e => field.onChange(parseFloat(e.target.value))} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
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
              </form>
            </Form>
          </ScrollArea>
          <DialogFooter>
            <Button type="button" onClick={editForm.handleSubmit(handleEditSubmit)}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this expense record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteExpense}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Expenses;
