import React, { useState } from 'react';
import { 
  format, 
  subDays, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  parseISO,
  subMonths
} from 'date-fns';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { 
  CalendarIcon, 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle, 
  ShoppingCart, 
  Package,
  DollarSign,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';

const Dashboard = () => {
  const {
    getTotalSalesByDate,
    getMonthlySales,
    getTotalExpensesByDate,
    getMonthlyExpenses,
    getDailyProfit,
    getMonthlyProfit,
    getLowStockItems,
    getTotalWorkerPaymentsByDate,
    getTotalWorkerPaymentsByMonth,
    loading,
  } = useData();
  
  const today = new Date();
  const currentMonth = format(today, 'yyyy-MM');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedDate, setSelectedDate] = useState(format(today, 'yyyy-MM-dd'));
  
  const formattedMonth = format(new Date(selectedMonth), 'MMMM yyyy');
  const formattedDate = format(new Date(selectedDate), 'EEEE, MMMM dd, yyyy');
  
  const previousMonth = () => {
    const date = new Date(selectedMonth);
    setSelectedMonth(format(subMonths(date, 1), 'yyyy-MM'));
  };
  
  const nextMonth = () => {
    const date = new Date(selectedMonth);
    if (format(date, 'yyyy-MM') !== currentMonth) {
      setSelectedMonth(format(new Date(date.getFullYear(), date.getMonth() + 1), 'yyyy-MM'));
    }
  };
  
  const monthlySales = getMonthlySales(selectedMonth);
  const monthlyExpenses = getMonthlyExpenses(selectedMonth);
  const monthlyProfit = getMonthlyProfit(selectedMonth);
  const monthlySalary = getTotalWorkerPaymentsByMonth(selectedMonth);
  
  const todayFormatted = format(today, 'yyyy-MM-dd');
  const todaySales = getTotalSalesByDate(todayFormatted);
  const todayExpenses = getTotalExpensesByDate(todayFormatted);
  const todayProfit = getDailyProfit(todayFormatted);
  const todaySalary = getTotalWorkerPaymentsByDate(todayFormatted);
  
  const selectedDateSales = getTotalSalesByDate(selectedDate);
  const selectedDateExpenses = getTotalExpensesByDate(selectedDate);
  const selectedDateProfit = getDailyProfit(selectedDate);
  const selectedDateSalary = getTotalWorkerPaymentsByDate(selectedDate);
  
  const monthStart = startOfMonth(new Date(selectedMonth));
  const monthEnd = endOfMonth(new Date(selectedMonth));
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const dailyData = days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const sales = getTotalSalesByDate(dateStr);
    const expenses = getTotalExpensesByDate(dateStr);
    const salary = getTotalWorkerPaymentsByDate(dateStr);
    const profit = getDailyProfit(dateStr);
    
    return {
      date: format(day, 'dd'),
      sales,
      expenses,
      salary,
      profit,
      fullDate: dateStr,
    };
  });
  
  const handleDateClick = (data: any) => {
    if (data && data.activePayload && data.activePayload.length > 0) {
      const clickedDate = data.activePayload[0].payload.fullDate;
      setSelectedDate(clickedDate);
    }
  };
  
  const lowStockItems = getLowStockItems();
  
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-32" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-6 w-16 mb-1" />
                <Skeleton className="h-3 w-24" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
            <Skeleton className="h-72 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="daily">Daily Profit</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-l-4 border-l-blue-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Today's Sales</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{todaySales.toLocaleString()}</div>
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <span>{format(today, 'dd MMM yyyy')}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-orange-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Today's Expenses</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">₹{todayExpenses.toLocaleString()}</div>
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <span>{format(today, 'dd MMM yyyy')}</span>
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-green-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Today's Profit</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold ${todayProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₹{todayProfit.toLocaleString()}
                </div>
                <div className="flex items-center mt-1 text-xs text-muted-foreground">
                  <span>{format(today, 'dd MMM yyyy')}</span>
                  {todayProfit > 0 ? (
                    <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 hover:bg-green-50">
                      <ArrowUp className="h-3 w-3 mr-1" /> Profit
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="ml-2 bg-red-50 text-red-700 hover:bg-red-50">
                      <ArrowDown className="h-3 w-3 mr-1" /> Loss
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card className="border-l-4 border-l-yellow-500">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Low Stock Items</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{lowStockItems.length}</div>
                <div className="flex items-center mt-1">
                  <span className="text-xs text-muted-foreground">Items below threshold</span>
                  {lowStockItems.length > 0 && (
                    <Badge variant="outline" className="ml-2 bg-yellow-50 text-yellow-700 hover:bg-yellow-50">
                      Action needed
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle>Monthly Overview</CardTitle>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={previousMonth}
                  >
                    Previous
                  </Button>
                  <span className="text-sm font-medium">{formattedMonth}</span>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={nextMonth}
                    disabled={format(new Date(selectedMonth), 'yyyy-MM') === currentMonth}
                  >
                    Next
                  </Button>
                </div>
              </div>
              <CardDescription>
                Sales, expenses, and profit for {formattedMonth}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-xl font-bold">₹{monthlySales.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Expenses</p>
                  <p className="text-xl font-bold">₹{monthlyExpenses.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Total Salary</p>
                  <p className="text-xl font-bold">₹{monthlySalary.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                  <p className={`text-xl font-bold ${monthlyProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{monthlyProfit.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={dailyData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    onClick={handleDateClick}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`₹${Number(value).toLocaleString()}`, undefined]}
                      labelFormatter={(label) => `Day ${label}`}
                    />
                    <Legend />
                    <Bar dataKey="sales" name="Sales" fill="#0EA5E9" />
                    <Bar dataKey="expenses" name="Expenses" fill="#F97316" />
                    <Bar dataKey="salary" name="Salary" fill="#8B5CF6" />
                    <Bar dataKey="profit" name="Profit" fill="#22C55E" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              <div className="text-center text-sm text-muted-foreground mt-4">
                Click on any date in the chart to view detailed profit breakdown
              </div>
            </CardContent>
          </Card>
          
          {lowStockItems.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Low Stock Alerts</CardTitle>
                <CardDescription>Items that need to be restocked soon</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left">Item Name</th>
                        <th className="py-3 px-4 text-right">Current Quantity</th>
                        <th className="py-3 px-4 text-right">Threshold</th>
                        <th className="py-3 px-4 text-left">Unit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lowStockItems.map((item) => (
                        <tr key={item.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">{item.name}</td>
                          <td className="py-3 px-4 text-right font-medium text-red-600">{item.quantity}</td>
                          <td className="py-3 px-4 text-right">{item.threshold}</td>
                          <td className="py-3 px-4">{item.unit}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="daily" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <CardTitle>Daily Profit Breakdown</CardTitle>
                  <CardDescription>
                    View detailed sales and expenses for any specific date
                  </CardDescription>
                </div>
                
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {format(new Date(selectedDate), 'PPP')}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={new Date(selectedDate)}
                      onSelect={(date) => date && setSelectedDate(format(date, 'yyyy-MM-dd'))}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-l-blue-500">
                  <p className="text-sm text-muted-foreground">Sales</p>
                  <p className="text-xl font-bold">₹{selectedDateSales.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-l-orange-500">
                  <p className="text-sm text-muted-foreground">Expenses</p>
                  <p className="text-xl font-bold">₹{selectedDateExpenses.toLocaleString()}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg border-l-4 border-l-purple-500">
                  <p className="text-sm text-muted-foreground">Salary</p>
                  <p className="text-xl font-bold">₹{selectedDateSalary.toLocaleString()}</p>
                </div>
                <div className={`p-4 bg-gray-50 rounded-lg border-l-4 ${selectedDateProfit >= 0 ? 'border-l-green-500' : 'border-l-red-500'}`}>
                  <p className="text-sm text-muted-foreground">Net Profit</p>
                  <p className={`text-xl font-bold ${selectedDateProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₹{selectedDateProfit.toLocaleString()}
                  </p>
                </div>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-6">
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-3">Profit Calculation</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="font-medium">Total Sales</span>
                      <span className="text-blue-600 font-medium">₹{selectedDateSales.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="font-medium">Total Expenses</span>
                      <span className="text-orange-600 font-medium">- ₹{selectedDateExpenses.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pb-2 border-b">
                      <span className="font-medium">Total Salary (added back)</span>
                      <span className="text-purple-600 font-medium">+ ₹{selectedDateSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2">
                      <span className="font-medium">Net Profit</span>
                      <span className={`font-medium ${selectedDateProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ₹{selectedDateProfit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between items-center pt-2 text-xs text-gray-500">
                      <span>Formula: Sales - (Expenses - Salary)</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center justify-center">
                  <div className="inline-flex gap-2">
                    {selectedDateProfit >= 0 ? (
                      <>
                        <ArrowUp className="h-5 w-5 text-green-600" />
                        <span className="text-green-600 font-medium">Profit</span>
                      </>
                    ) : (
                      <>
                        <ArrowDown className="h-5 w-5 text-red-600" />
                        <span className="text-red-600 font-medium">Loss</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Dashboard;
