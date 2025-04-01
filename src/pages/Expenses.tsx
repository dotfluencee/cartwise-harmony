
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
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

const Expenses = () => {
  const { expenses, addExpense, getTotalExpensesByDate } = useData();
  
  // State for the new expense form
  const [expenseAmount, setExpenseAmount] = useState<string>('');
  const [expenseCategory, setExpenseCategory] = useState<'ingredient' | 'minor' | 'major' | ''>('');
  const [expenseDescription, setExpenseDescription] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  
  // State for filtering and viewing expenses
  const [searchQuery, setSearchQuery] = useState('');
  const [viewDate, setViewDate] = useState<Date>(new Date());
  
  // Format date for database
  const formatDateForDb = (date: Date): string => {
    return format(date, 'yyyy-MM-dd');
  };
  
  // Handle expense form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!expenseCategory || !expenseAmount) {
      return;
    }
    
    const amount = parseFloat(expenseAmount);
    if (isNaN(amount) || amount <= 0) {
      return;
    }
    
    addExpense(
      formatDateForDb(selectedDate), 
      amount, 
      expenseCategory as 'ingredient' | 'minor' | 'major', 
      expenseDescription
    );
    
    // Reset form
    setExpenseAmount('');
    setExpenseCategory('');
    setExpenseDescription('');
    setSelectedDate(new Date());
  };
  
  // Filter expenses based on search query
  const filteredExpenses = expenses.filter(expense => {
    const categoryLabel = getCategoryLabel(expense.category);
    return (
      expense.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      expense.date.includes(searchQuery)
    );
  });
  
  // Get category label
  const getCategoryLabel = (category: 'ingredient' | 'minor' | 'major'): string => {
    switch (category) {
      case 'ingredient':
        return 'Ingredient Purchase';
      case 'minor':
        return 'Minor Expense';
      case 'major':
        return 'Major Expense';
      default:
        return '';
    }
  };
  
  // Get total expenses for the view date
  const viewDateFormatted = formatDateForDb(viewDate);
  const totalExpensesForDate = getTotalExpensesByDate(viewDateFormatted);
  
  // Group expenses by category for the selected date
  const expensesByCategory = {
    ingredient: expenses
      .filter(expense => expense.date === viewDateFormatted && expense.category === 'ingredient')
      .reduce((sum, expense) => sum + expense.amount, 0),
    minor: expenses
      .filter(expense => expense.date === viewDateFormatted && expense.category === 'minor')
      .reduce((sum, expense) => sum + expense.amount, 0),
    major: expenses
      .filter(expense => expense.date === viewDateFormatted && expense.category === 'major')
      .reduce((sum, expense) => sum + expense.amount, 0),
  };
  
  // Get expenses for the view date
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
          {/* Daily expenses overview */}
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-chawal-muted">Ingredient Purchases</p>
                  <p className="text-xl font-bold">₹{expensesByCategory.ingredient.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-chawal-muted">Minor Expenses</p>
                  <p className="text-xl font-bold">₹{expensesByCategory.minor.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-chawal-muted">Major Expenses</p>
                  <p className="text-xl font-bold">₹{expensesByCategory.major.toLocaleString()}</p>
                </div>
              </div>
              
              {expensesForDate.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left">Category</th>
                        <th className="py-3 px-4 text-left">Description</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {expensesForDate.map((expense) => (
                        <tr key={expense.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{getCategoryLabel(expense.category)}</td>
                          <td className="py-3 px-4">{expense.description}</td>
                          <td className="py-3 px-4 text-right font-medium">₹{expense.amount.toLocaleString()}</td>
                        </tr>
                      ))}
                      <tr className="bg-gray-50 font-medium">
                        <td colSpan={2} className="py-3 px-4">Total</td>
                        <td className="py-3 px-4 text-right">₹{totalExpensesForDate.toLocaleString()}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-chawal-muted">
                  No expense data available for this date
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Expense history */}
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
                        <th className="py-3 px-4 text-left">Category</th>
                        <th className="py-3 px-4 text-left">Description</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredExpenses
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((expense) => (
                          <tr key={expense.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{format(new Date(expense.date), 'PPP')}</td>
                            <td className="py-3 px-4">{getCategoryLabel(expense.category)}</td>
                            <td className="py-3 px-4">{expense.description}</td>
                            <td className="py-3 px-4 text-right font-medium">₹{expense.amount.toLocaleString()}</td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-chawal-muted">
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
                Record a new expense with category and description
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Expense Category</Label>
                    <Select
                      value={expenseCategory}
                      onValueChange={(value) => setExpenseCategory(value as 'ingredient' | 'minor' | 'major')}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ingredient">Ingredient Purchase</SelectItem>
                        <SelectItem value="minor">Minor Expense</SelectItem>
                        <SelectItem value="major">Major Expense</SelectItem>
                      </SelectContent>
                    </Select>
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
                  className="bg-chawal-primary hover:bg-chawal-secondary"
                  disabled={!expenseCategory || !expenseAmount}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Expense
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Expenses;
