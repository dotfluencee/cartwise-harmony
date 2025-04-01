
import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, subMonths } from 'date-fns';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, LineChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { DollarSign, ShoppingCart, TrendingUp, Package } from 'lucide-react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';

const Dashboard = () => {
  const {
    getTotalSalesByDate,
    getMonthlySales,
    getTotalExpensesByDate,
    getMonthlyExpenses,
    getDailyProfit,
    getMonthlyProfit,
    getLowStockItems,
  } = useData();
  
  // Current date and month
  const today = new Date();
  const currentMonth = format(today, 'yyyy-MM');
  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  
  // Format date for display
  const formattedMonth = format(new Date(selectedMonth), 'MMMM yyyy');
  
  // Change month handlers
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
  
  // Stats for the selected month
  const monthlySales = getMonthlySales(selectedMonth);
  const monthlyExpenses = getMonthlyExpenses(selectedMonth);
  const monthlyProfit = getMonthlyProfit(selectedMonth);
  
  // Stats for today
  const todayFormatted = format(today, 'yyyy-MM-dd');
  const todaySales = getTotalSalesByDate(todayFormatted);
  const todayExpenses = getTotalExpensesByDate(todayFormatted);
  const todayProfit = getDailyProfit(todayFormatted);
  
  // Generate daily data for the charts
  const monthStart = startOfMonth(new Date(selectedMonth));
  const monthEnd = endOfMonth(new Date(selectedMonth));
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const dailyData = days.map(day => {
    const dateStr = format(day, 'yyyy-MM-dd');
    const sales = getTotalSalesByDate(dateStr);
    const expenses = getTotalExpensesByDate(dateStr);
    const profit = getDailyProfit(dateStr);
    
    return {
      date: format(day, 'dd'),
      sales,
      expenses,
      profit,
    };
  });
  
  // List of low stock items
  const lowStockItems = getLowStockItems();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Dashboard</h2>
      </div>
      
      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-chawal-muted">Today's Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-chawal-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{todaySales.toLocaleString()}</div>
            <p className="text-xs text-chawal-muted mt-1">
              {format(today, 'dd MMM yyyy')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-chawal-muted">Today's Expenses</CardTitle>
            <DollarSign className="h-4 w-4 text-chawal-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{todayExpenses.toLocaleString()}</div>
            <p className="text-xs text-chawal-muted mt-1">
              {format(today, 'dd MMM yyyy')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-chawal-muted">Today's Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-chawal-muted" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${todayProfit >= 0 ? 'text-chawal-success' : 'text-chawal-danger'}`}>
              ₹{todayProfit.toLocaleString()}
            </div>
            <p className="text-xs text-chawal-muted mt-1">
              {format(today, 'dd MMM yyyy')}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-chawal-muted">Low Stock Items</CardTitle>
            <Package className="h-4 w-4 text-chawal-muted" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems.length}</div>
            <p className="text-xs text-chawal-muted mt-1">
              Items below threshold
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Monthly overview section */}
      <div className="grid grid-cols-1 gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-chawal-muted">Total Sales</p>
                <p className="text-xl font-bold">₹{monthlySales.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-chawal-muted">Total Expenses</p>
                <p className="text-xl font-bold">₹{monthlyExpenses.toLocaleString()}</p>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-chawal-muted">Net Profit</p>
                <p className={`text-xl font-bold ${monthlyProfit >= 0 ? 'text-chawal-success' : 'text-chawal-danger'}`}>
                  ₹{monthlyProfit.toLocaleString()}
                </p>
              </div>
            </div>
            
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={dailyData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value) => [`₹${parseInt(value.toString()).toLocaleString()}`, undefined]}
                    labelFormatter={(label) => `Day ${label}`}
                  />
                  <Legend />
                  <Bar dataKey="sales" name="Sales" fill="#0EA5E9" />
                  <Bar dataKey="expenses" name="Expenses" fill="#F97316" />
                  <Bar dataKey="profit" name="Profit" fill="#22C55E" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Low stock items */}
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
                      <td className="py-3 px-4 text-right font-medium text-chawal-danger">{item.quantity}</td>
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
    </div>
  );
};

export default Dashboard;
