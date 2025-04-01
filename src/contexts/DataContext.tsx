
import React, { createContext, useContext, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

// Types
interface Cart {
  id: number;
  name: string;
}

interface SalesRecord {
  id: string;
  date: string;
  cartId: number;
  amount: number;
}

interface Expense {
  id: string;
  date: string;
  amount: number;
  name: string;
  description: string;
}

interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  threshold: number;
}

interface Payment {
  id: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending';
}

interface DataContextType {
  // Carts
  carts: Cart[];
  
  // Sales
  salesRecords: SalesRecord[];
  addSalesRecord: (cartId: number, date: string, amount: number) => Promise<void>;
  getTotalSalesByDate: (date: string) => number;
  getMonthlySales: (month: string) => number;
  getCartSalesByDate: (cartId: number, date: string) => number;
  
  // Expenses
  expenses: Expense[];
  addExpense: (date: string, amount: number, name: string, description: string) => Promise<void>;
  getTotalExpensesByDate: (date: string) => number;
  getMonthlyExpenses: (month: string) => number;
  
  // Inventory
  inventory: InventoryItem[];
  addInventoryItem: (name: string, quantity: number, unit: string, threshold: number) => Promise<void>;
  updateInventoryItemQuantity: (id: string, quantity: number) => Promise<void>;
  getLowStockItems: () => InventoryItem[];
  
  // Profits
  getDailyProfit: (date: string) => number;
  getMonthlyProfit: (month: string) => number;
  getMonthlyNetProfit: (month: string) => number;
  getMonthlyPendingPayment: (month: string) => number;
  
  // Partner Payments
  payments: Payment[];
  addPayment: (date: string, amount: number, status: 'completed' | 'pending') => Promise<void>;
  updatePaymentStatus: (id: string, status: 'completed' | 'pending') => Promise<void>;
  getPendingPayments: () => Payment[];
  getTotalPendingAmount: () => number;
  
  // Loading states
  loading: boolean;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [carts, setCarts] = useState<Cart[]>([]);
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  // Load data from Supabase
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch carts
        const { data: cartsData, error: cartsError } = await supabase
          .from('carts')
          .select('*');
        
        if (cartsError) throw cartsError;
        setCarts(cartsData as Cart[]);
        
        // Fetch sales records
        const { data: salesData, error: salesError } = await supabase
          .from('sales_records')
          .select('*');
        
        if (salesError) throw salesError;
        setSalesRecords(salesData.map(record => ({
          id: record.id,
          date: format(new Date(record.date), 'yyyy-MM-dd'),
          cartId: record.cart_id,
          amount: Number(record.amount),
        })));
        
        // Fetch expenses
        const { data: expensesData, error: expensesError } = await supabase
          .from('expenses')
          .select('*');
        
        if (expensesError) throw expensesError;
        setExpenses(expensesData.map(expense => ({
          id: expense.id,
          date: format(new Date(expense.date), 'yyyy-MM-dd'),
          amount: Number(expense.amount),
          name: expense.name,
          description: expense.description || '',
        })));
        
        // Fetch inventory
        const { data: inventoryData, error: inventoryError } = await supabase
          .from('inventory')
          .select('*');
        
        if (inventoryError) throw inventoryError;
        setInventory(inventoryData.map(item => ({
          id: item.id,
          name: item.name,
          quantity: Number(item.quantity),
          unit: item.unit,
          threshold: Number(item.threshold),
        })));
        
        // Fetch payments
        const { data: paymentsData, error: paymentsError } = await supabase
          .from('payments')
          .select('*');
        
        if (paymentsError) throw paymentsError;
        setPayments(paymentsData.map(payment => ({
          id: payment.id,
          date: format(new Date(payment.date), 'yyyy-MM-dd'),
          amount: Number(payment.amount),
          status: payment.status as 'completed' | 'pending',
        })));
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Sales functions
  const addSalesRecord = async (cartId: number, date: string, amount: number) => {
    try {
      const { data, error } = await supabase
        .from('sales_records')
        .insert({
          date,
          cart_id: cartId,
          amount,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newSale = {
        id: data.id,
        date,
        cartId,
        amount,
      };
      
      setSalesRecords([...salesRecords, newSale]);
      toast.success('Sales record added successfully');
    } catch (error) {
      console.error('Error adding sales record:', error);
      toast.error('Failed to add sales record');
    }
  };

  const getTotalSalesByDate = (date: string): number => {
    return salesRecords
      .filter(record => record.date === date)
      .reduce((total, record) => total + record.amount, 0);
  };

  const getMonthlySales = (month: string): number => {
    return salesRecords
      .filter(record => record.date.startsWith(month))
      .reduce((total, record) => total + record.amount, 0);
  };

  const getCartSalesByDate = (cartId: number, date: string): number => {
    return salesRecords
      .filter(record => record.date === date && record.cartId === cartId)
      .reduce((total, record) => total + record.amount, 0);
  };

  // Expense functions
  const addExpense = async (date: string, amount: number, name: string, description: string) => {
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert({
          date,
          amount,
          name,
          description,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newExpense = {
        id: data.id,
        date,
        amount,
        name,
        description,
      };
      
      setExpenses([...expenses, newExpense]);
      toast.success('Expense added successfully');
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
    }
  };

  const getTotalExpensesByDate = (date: string): number => {
    return expenses
      .filter(expense => expense.date === date)
      .reduce((total, expense) => total + expense.amount, 0);
  };

  const getMonthlyExpenses = (month: string): number => {
    return expenses
      .filter(expense => expense.date.startsWith(month))
      .reduce((total, expense) => total + expense.amount, 0);
  };

  // Inventory functions
  const addInventoryItem = async (name: string, quantity: number, unit: string, threshold: number) => {
    try {
      const { data, error } = await supabase
        .from('inventory')
        .insert({
          name,
          quantity,
          unit,
          threshold,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newItem = {
        id: data.id,
        name,
        quantity,
        unit,
        threshold,
      };
      
      setInventory([...inventory, newItem]);
      toast.success('Inventory item added successfully');
    } catch (error) {
      console.error('Error adding inventory item:', error);
      toast.error('Failed to add inventory item');
    }
  };

  const updateInventoryItemQuantity = async (id: string, quantity: number) => {
    try {
      const { error } = await supabase
        .from('inventory')
        .update({ quantity, updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
      
      const updatedInventory = inventory.map(item => 
        item.id === id ? { ...item, quantity } : item
      );
      setInventory(updatedInventory);
      
      // Check if item is now below threshold
      const item = inventory.find(i => i.id === id);
      if (item && quantity <= item.threshold) {
        toast.warning(`${item.name} is running low! Current quantity: ${quantity} ${item.unit}`);
      } else {
        toast.success('Inventory updated successfully');
      }
    } catch (error) {
      console.error('Error updating inventory:', error);
      toast.error('Failed to update inventory');
    }
  };

  const getLowStockItems = (): InventoryItem[] => {
    return inventory.filter(item => item.quantity <= item.threshold);
  };

  // Profit calculations
  const getDailyProfit = (date: string): number => {
    const dailySales = getTotalSalesByDate(date);
    const dailyExpenses = getTotalExpensesByDate(date);
    return dailySales - dailyExpenses;
  };

  const getMonthlyProfit = (month: string): number => {
    const monthlySales = getMonthlySales(month);
    const monthlyExpenses = getMonthlyExpenses(month);
    return monthlySales - monthlyExpenses;
  };
  
  // Get the monthly net profit after paying the partner
  const getMonthlyNetProfit = (month: string): number => {
    const monthlyProfit = getMonthlyProfit(month);
    const totalMonthlyPayments = payments
      .filter(payment => payment.date.startsWith(month) && payment.status === 'completed')
      .reduce((total, payment) => total + payment.amount, 0);
    
    return monthlyProfit - totalMonthlyPayments;
  };
  
  // Calculate pending payment for partner at the end of month
  const getMonthlyPendingPayment = (month: string): number => {
    // Calculate half of the total profit for the month
    const monthlyProfit = getMonthlyProfit(month);
    const partnerShare = monthlyProfit / 2;
    
    // Calculate how much has already been paid to the partner for the month
    const paidToPartner = payments
      .filter(payment => payment.date.startsWith(month) && payment.status === 'completed')
      .reduce((total, payment) => total + payment.amount, 0);
    
    // The pending payment is the difference between the partner's share and what has been paid
    return Math.max(0, partnerShare - paidToPartner);
  };

  // Partner payment functions
  const addPayment = async (date: string, amount: number, status: 'completed' | 'pending') => {
    try {
      const { data, error } = await supabase
        .from('payments')
        .insert({
          date,
          amount,
          status,
        })
        .select()
        .single();
      
      if (error) throw error;
      
      const newPayment = {
        id: data.id,
        date,
        amount,
        status,
      };
      
      setPayments([...payments, newPayment]);
      toast.success(`Payment ${status === 'completed' ? 'recorded' : 'marked as pending'}`);
    } catch (error) {
      console.error('Error adding payment:', error);
      toast.error('Failed to add payment');
    }
  };

  const updatePaymentStatus = async (id: string, status: 'completed' | 'pending') => {
    try {
      const { error } = await supabase
        .from('payments')
        .update({ status })
        .eq('id', id);
      
      if (error) throw error;
      
      const updatedPayments = payments.map(payment => 
        payment.id === id ? { ...payment, status } : payment
      );
      setPayments(updatedPayments);
      toast.success(`Payment marked as ${status}`);
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const getPendingPayments = (): Payment[] => {
    return payments.filter(payment => payment.status === 'pending');
  };

  const getTotalPendingAmount = (): number => {
    return getPendingPayments().reduce((total, payment) => total + payment.amount, 0);
  };

  const value = {
    // Carts
    carts,
    
    // Sales
    salesRecords,
    addSalesRecord,
    getTotalSalesByDate,
    getMonthlySales,
    getCartSalesByDate,
    
    // Expenses
    expenses,
    addExpense,
    getTotalExpensesByDate,
    getMonthlyExpenses,
    
    // Inventory
    inventory,
    addInventoryItem,
    updateInventoryItemQuantity,
    getLowStockItems,
    
    // Profits
    getDailyProfit,
    getMonthlyProfit,
    getMonthlyNetProfit,
    getMonthlyPendingPayment,
    
    // Partner payments
    payments,
    addPayment,
    updatePaymentStatus,
    getPendingPayments,
    getTotalPendingAmount,
    
    // Loading state
    loading,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContext;
