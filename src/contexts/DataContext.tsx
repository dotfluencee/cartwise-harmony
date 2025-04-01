
import React, { createContext, useContext, useState, useEffect } from 'react';
import { format } from 'date-fns';
import { toast } from 'sonner';

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
  category: 'ingredient' | 'minor' | 'major';
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
  addSalesRecord: (cartId: number, date: string, amount: number) => void;
  getTotalSalesByDate: (date: string) => number;
  getMonthlySales: (month: string) => number;
  getCartSalesByDate: (cartId: number, date: string) => number;
  
  // Expenses
  expenses: Expense[];
  addExpense: (date: string, amount: number, category: 'ingredient' | 'minor' | 'major', description: string) => void;
  getTotalExpensesByDate: (date: string) => number;
  getMonthlyExpenses: (month: string) => number;
  
  // Inventory
  inventory: InventoryItem[];
  addInventoryItem: (name: string, quantity: number, unit: string, threshold: number) => void;
  updateInventoryItemQuantity: (id: string, quantity: number) => void;
  getLowStockItems: () => InventoryItem[];
  
  // Profits
  getDailyProfit: (date: string) => number;
  getMonthlyProfit: (month: string) => number;
  
  // Partner Payments
  payments: Payment[];
  addPayment: (date: string, amount: number, status: 'completed' | 'pending') => void;
  updatePaymentStatus: (id: string, status: 'completed' | 'pending') => void;
  getPendingPayments: () => Payment[];
  getTotalPendingAmount: () => number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

const STORAGE_KEYS = {
  CARTS: 'chawalExpress_carts',
  SALES: 'chawalExpress_sales',
  EXPENSES: 'chawalExpress_expenses',
  INVENTORY: 'chawalExpress_inventory',
  PAYMENTS: 'chawalExpress_payments',
};

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize with 3 carts
  const [carts] = useState<Cart[]>([
    { id: 1, name: 'Cart 1' },
    { id: 2, name: 'Cart 2' },
    { id: 3, name: 'Cart 3' },
  ]);
  
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Load data from localStorage
  useEffect(() => {
    const loadedSales = localStorage.getItem(STORAGE_KEYS.SALES);
    if (loadedSales) setSalesRecords(JSON.parse(loadedSales));
    
    const loadedExpenses = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    if (loadedExpenses) setExpenses(JSON.parse(loadedExpenses));
    
    const loadedInventory = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    if (loadedInventory) setInventory(JSON.parse(loadedInventory));
    
    const loadedPayments = localStorage.getItem(STORAGE_KEYS.PAYMENTS);
    if (loadedPayments) setPayments(JSON.parse(loadedPayments));
  }, []);

  // Save to localStorage whenever data changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SALES, JSON.stringify(salesRecords));
  }, [salesRecords]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PAYMENTS, JSON.stringify(payments));
  }, [payments]);

  // Sales functions
  const addSalesRecord = (cartId: number, date: string, amount: number) => {
    const newSale = {
      id: Date.now().toString(),
      date,
      cartId,
      amount,
    };
    setSalesRecords([...salesRecords, newSale]);
    toast.success('Sales record added successfully');
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
  const addExpense = (date: string, amount: number, category: 'ingredient' | 'minor' | 'major', description: string) => {
    const newExpense = {
      id: Date.now().toString(),
      date,
      amount,
      category,
      description,
    };
    setExpenses([...expenses, newExpense]);
    toast.success('Expense added successfully');
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
  const addInventoryItem = (name: string, quantity: number, unit: string, threshold: number) => {
    const newItem = {
      id: Date.now().toString(),
      name,
      quantity,
      unit,
      threshold,
    };
    setInventory([...inventory, newItem]);
    toast.success('Inventory item added successfully');
  };

  const updateInventoryItemQuantity = (id: string, quantity: number) => {
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

  // Partner payment functions
  const addPayment = (date: string, amount: number, status: 'completed' | 'pending') => {
    const newPayment = {
      id: Date.now().toString(),
      date,
      amount,
      status,
    };
    setPayments([...payments, newPayment]);
    toast.success(`Payment ${status === 'completed' ? 'recorded' : 'marked as pending'}`);
  };

  const updatePaymentStatus = (id: string, status: 'completed' | 'pending') => {
    const updatedPayments = payments.map(payment => 
      payment.id === id ? { ...payment, status } : payment
    );
    setPayments(updatedPayments);
    toast.success(`Payment marked as ${status}`);
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
    
    // Partner payments
    payments,
    addPayment,
    updatePaymentStatus,
    getPendingPayments,
    getTotalPendingAmount,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export default DataContext;
