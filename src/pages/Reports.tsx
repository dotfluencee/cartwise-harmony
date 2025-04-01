import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { format, subDays, startOfMonth, endOfMonth, eachDayOfInterval } from 'date-fns';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { Download, Calendar, BarChart2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

const COLORS = ['#0EA5E9', '#F97316', '#22C55E', '#EF4444'];

const Reports = () => {
  const {
    carts,
    salesRecords,
    expenses,
    getMonthlySales,
    getMonthlyExpenses,
    getMonthlyProfit,
    getTotalSalesByDate,
    getTotalExpensesByDate,
    getDailyProfit
  } = useData();
  
  const today = new Date();
  const currentMonth = format(today, 'yyyy-MM');
  
  const [selectedPeriod, setSelectedPeriod] = useState<'current' | '1month' | '3month' | '6month'>('current');
  const [reportType, setReportType] = useState<'sales' | 'expenses' | 'profit'>('sales');
  
  const getMonthsForPeriod = (): string[] => {
    const months = [];
    let monthsToGoBack = 0;
    
    switch (selectedPeriod) {
      case '1month':
        monthsToGoBack = 1;
        break;
      case '3month':
        monthsToGoBack = 3;
        break;
      case '6month':
        monthsToGoBack = 6;
        break;
      default:
        monthsToGoBack = 0;
    }
    
    for (let i = monthsToGoBack; i >= 0; i--) {
      const month = format(subMonths(today, i), 'yyyy-MM');
      months.push(month);
    }
    
    return months;
  };
  
  const getMonthlyReportData = () => {
    const months = getMonthsForPeriod();
    
    return months.map(month => {
      const formattedMonth = format(parseISO(`${month}-01`), 'MMM yyyy');
      const sales = getMonthlySales(month);
      const expenses = getMonthlyExpenses(month);
      const profit = getMonthlyProfit(month);
      
      return {
        month: formattedMonth,
        sales,
        expenses,
        profit
      };
    });
  };
  
  const getDailyReportData = () => {
    const monthStart = startOfMonth(new Date(currentMonth));
    const monthEnd = endOfMonth(new Date(currentMonth));
    const days = eachDayOfInterval({ start: monthStart, end: today });
    
    return days.map(day => {
      const dateStr = format(day, 'yyyy-MM-dd');
      const formattedDay = format(day, 'dd MMM');
      const sales = getTotalSalesByDate(dateStr);
      const expenses = getTotalExpensesByDate(dateStr);
      const profit = getDailyProfit(dateStr);
      
      return {
        day: formattedDay,
        sales,
        expenses,
        profit
      };
    });
  };
  
  const getExpenseCategoryData = () => {
    const months = getMonthsForPeriod();
    
    const filteredExpenses = expenses.filter(expense => 
      months.some(month => expense.date.startsWith(month))
    );
    
    const expensesByCategory = filteredExpenses.reduce((acc, expense) => {
      const categoryName = getCategoryLabel(expense.category);
      if (!acc[categoryName]) {
        acc[categoryName] = 0;
      }
      acc[categoryName] += expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(expensesByCategory).map(([name, value]) => ({ name, value }));
  };
  
  const getCartSalesData = () => {
    const months = getMonthsForPeriod();
    
    const filteredSales = salesRecords.filter(sale => 
      months.some(month => sale.date.startsWith(month))
    );
    
    const salesByCart = filteredSales.reduce((acc, sale) => {
      const cartName = carts.find(cart => cart.id === sale.cartId)?.name || 'Unknown';
      if (!acc[cartName]) {
        acc[cartName] = 0;
      }
      acc[cartName] += sale.amount;
      return acc;
    }, {} as Record<string, number>);
    
    return Object.entries(salesByCart).map(([name, value]) => ({ name, value }));
  };
  
  const getCategoryLabel = (category: 'ingredient' | 'minor' | 'major'): string => {
    switch (category) {
      case 'ingredient':
        return 'Ingredient Purchases';
      case 'minor':
        return 'Minor Expenses';
      case 'major':
        return 'Major Expenses';
      default:
        return '';
    }
  };
  
  const getPeriodLabel = (): string => {
    switch (selectedPeriod) {
      case 'current':
        return 'Current Month';
      case '1month':
        return 'Last Month';
      case '3month':
        return 'Last 3 Months';
      case '6month':
        return 'Last 6 Months';
      default:
        return 'Current Month';
    }
  };
  
  const getTopExpenses = () => {
    const expensesByName: { [key: string]: number } = {};
    
    expenses.forEach(expense => {
      expensesByName[expense.name] = (expensesByName[expense.name] || 0) + expense.amount;
    });
    
    return Object.entries(expensesByName)
      .map(([name, amount]) => ({ name, amount }))
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);
  };
  
  const monthlyData = getMonthlyReportData();
  const dailyData = getDailyReportData();
  const expenseCategoryData = getExpenseCategoryData();
  const cartSalesData = getCartSalesData();
  
  const totalSales = monthlyData.reduce((sum, month) => sum + month.sales, 0);
  const totalExpenses = monthlyData.reduce((sum, month) => sum + month.expenses, 0);
  const totalProfit = monthlyData.reduce((sum, month) => sum + month.profit, 0);
  
  const currencyFormatter = (value: number) => `₹${value.toLocaleString()}`;
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Financial Reports</h2>
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle>Performance Reports</CardTitle>
              <CardDescription>
                Analyze sales, expenses, and profits over time
              </CardDescription>
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="space-y-0.5">
                <Label htmlFor="period" className="text-xs">Time Period</Label>
                <Select
                  value={selectedPeriod}
                  onValueChange={(value) => setSelectedPeriod(value as any)}
                >
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue placeholder="Period" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="current">Current Month</SelectItem>
                    <SelectItem value="1month">Last Month</SelectItem>
                    <SelectItem value="3month">Last 3 Months</SelectItem>
                    <SelectItem value="6month">Last 6 Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-0.5">
                <Label htmlFor="reportType" className="text-xs">Report Type</Label>
                <Select
                  value={reportType}
                  onValueChange={(value) => setReportType(value as any)}
                >
                  <SelectTrigger className="h-8 w-[140px]">
                    <SelectValue placeholder="Report Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sales">Sales Report</SelectItem>
                    <SelectItem value="expenses">Expense Report</SelectItem>
                    <SelectItem value="profit">Profit Report</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <Button variant="outline" size="sm" className="mt-auto">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-chawal-muted">Total Sales</p>
              <p className="text-xl font-bold">₹{totalSales.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-chawal-muted">Total Expenses</p>
              <p className="text-xl font-bold">₹{totalExpenses.toLocaleString()}</p>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-chawal-muted">Net Profit</p>
              <p className={`text-xl font-bold ${totalProfit >= 0 ? 'text-chawal-success' : 'text-chawal-danger'}`}>
                ₹{totalProfit.toLocaleString()}
              </p>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-4">{getPeriodLabel()} - {reportType === 'sales' ? 'Sales' : reportType === 'expenses' ? 'Expenses' : 'Profit'} Trend</h3>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={monthlyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <RechartsTooltip 
                      formatter={(value) => [currencyFormatter(parseInt(value.toString())), undefined]}
                    />
                    <Legend />
                    {reportType === 'sales' && (
                      <Line type="monotone" dataKey="sales" name="Sales" stroke="#0EA5E9" strokeWidth={2} dot={{ r: 4 }} />
                    )}
                    {reportType === 'expenses' && (
                      <Line type="monotone" dataKey="expenses" name="Expenses" stroke="#F97316" strokeWidth={2} dot={{ r: 4 }} />
                    )}
                    {reportType === 'profit' && (
                      <Line type="monotone" dataKey="profit" name="Profit" stroke="#22C55E" strokeWidth={2} dot={{ r: 4 }} />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {selectedPeriod === 'current' && (
              <div>
                <h3 className="font-medium mb-4">Daily Breakdown - Current Month</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dailyData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="day" />
                      <YAxis />
                      <RechartsTooltip 
                        formatter={(value) => [currencyFormatter(parseInt(value.toString())), undefined]}
                      />
                      <Legend />
                      {reportType === 'sales' && (
                        <Bar dataKey="sales" name="Sales" fill="#0EA5E9" />
                      )}
                      {reportType === 'expenses' && (
                        <Bar dataKey="expenses" name="Expenses" fill="#F97316" />
                      )}
                      {reportType === 'profit' && (
                        <Bar dataKey="profit" name="Profit" fill="#22C55E" />
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-4">Expense Distribution by Category</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={expenseCategoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expenseCategoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => [currencyFormatter(parseInt(value.toString())), undefined]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-4">Sales Distribution by Cart</h3>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={cartSalesData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {cartSalesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <RechartsTooltip formatter={(value) => [currencyFormatter(parseInt(value.toString())), undefined]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
