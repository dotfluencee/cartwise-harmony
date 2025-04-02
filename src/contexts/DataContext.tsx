
import React, { createContext, useContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface Expense {
  id: string;
  date: string;
  name: string;
  category: string;
  description: string;
  amount: number;
}

export interface InventoryItem {
  id: string;
  name: string;
  description: string;
  category: string;
  quantity: number;
  unit: string;
  price: number;
  threshold: number; // Added required field
  createdAt: string;
  updatedAt: string;
}

export interface Sale {
  id: string;
  customer: string;
  product: string;
  quantity: number;
  price: number;
  date: string;
}

export interface Cart {
  id: number;
  name: string;
}

export interface Payment {
  id: string;
  date: string;
  amount: number;
  status: 'completed' | 'pending';
}

export interface SalesRecord {
  id: string;
  cartId: number;
  date: string;
  amount: number;
}

interface DataContextType {
  expenses: Expense[];
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  
  inventory: InventoryItem[];
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateInventoryItem: (item: InventoryItem) => void;
  deleteInventoryItem: (id: string) => void;
  
  sales: Sale[];
  addSale: (sale: Omit<Sale, 'id'>) => void;
  updateSale: (sale: Sale) => void;
  deleteSale: (id: string) => void;
  
  carts: Cart[];
  addCart: (name: string) => void;
  deleteCart: (id: number) => Promise<void>;
  
  payments: Payment[];
  addPayment: (date: string, amount: number, status: 'completed' | 'pending') => void;
  updatePaymentStatus: (id: string, status: 'completed' | 'pending') => void;
  getPendingPayments: () => Payment[];
  getTotalPendingAmount: () => number;
  
  salesRecords: SalesRecord[];
  loading: boolean;
  
  // Analytics functions
  getMonthlySales: (month: string) => number;
  getMonthlyExpenses: (month: string) => number;
  getMonthlyProfit: (month: string) => number;
  getTotalSalesByDate: (date: string) => number;
  getTotalExpensesByDate: (date: string) => number;
  getDailyProfit: (date: string) => number;
  getMonthlyNetProfit: (month: string) => number;
  getMonthlyPendingPayment: (month: string) => number;
}

// Create the context
const DataContext = createContext<DataContextType>({} as DataContextType);

// Context provider component
export const DataProvider = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  
  // Initialize state
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [carts, setCarts] = useState<Cart[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [salesRecords, setSalesRecords] = useState<SalesRecord[]>([]);
  
  // Simulate loading data on mount
  useEffect(() => {
    // This would typically be an API call
    const loadData = async () => {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock data
      setExpenses([
        {
          id: uuidv4(),
          date: "2023-10-21",
          name: "Monthly Rent",
          category: "Rent",
          description: "Store rent for October",
          amount: 15000
        },
        {
          id: uuidv4(),
          date: "2023-10-22",
          name: "Utilities",
          category: "Utilities",
          description: "Electricity bill",
          amount: 2500
        }
      ]);
      
      setInventory([
        {
          id: uuidv4(),
          name: "Rice",
          description: "Premium Basmati Rice",
          category: "Grocery",
          quantity: 50,
          unit: "kg",
          price: 80,
          threshold: 10,
          createdAt: "2023-10-10T10:00:00Z",
          updatedAt: "2023-10-10T10:00:00Z"
        },
        {
          id: uuidv4(),
          name: "Wheat Flour",
          description: "Whole Wheat Flour",
          category: "Grocery",
          quantity: 30,
          unit: "kg",
          price: 45,
          threshold: 5,
          createdAt: "2023-10-10T10:30:00Z",
          updatedAt: "2023-10-10T10:30:00Z"
        }
      ]);
      
      setSales([
        {
          id: uuidv4(),
          customer: "John Doe",
          product: "Rice",
          quantity: 5,
          price: 400,
          date: "2023-10-22"
        },
        {
          id: uuidv4(),
          customer: "Jane Smith",
          product: "Wheat Flour",
          quantity: 2,
          price: 90,
          date: "2023-10-22"
        }
      ]);
      
      setCarts([
        { id: 1, name: "Cart 1" },
        { id: 2, name: "Cart 2" }
      ]);
      
      setPayments([
        {
          id: uuidv4(),
          date: "2023-10-21",
          amount: 1000,
          status: "completed"
        },
        {
          id: uuidv4(),
          date: "2023-10-22",
          amount: 1500,
          status: "pending"
        }
      ]);
      
      setSalesRecords([
        {
          id: uuidv4(),
          cartId: 1,
          date: "2023-10-21",
          amount: 5000
        },
        {
          id: uuidv4(),
          cartId: 2,
          date: "2023-10-22",
          amount: 6500
        }
      ]);
      
      setLoading(false);
    };
    
    loadData();
  }, []);
  
  // Expense management
  const addExpense = (expense: Omit<Expense, 'id'>) => {
    const newExpense = {
      ...expense,
      id: uuidv4(),
    };
    setExpenses(prev => [...prev, newExpense]);
  };
  
  const updateExpense = (updatedExpense: Expense) => {
    setExpenses(prev => 
      prev.map(expense => 
        expense.id === updatedExpense.id ? updatedExpense : expense
      )
    );
  };
  
  const deleteExpense = (id: string) => {
    setExpenses(prev => prev.filter(expense => expense.id !== id));
  };
  
  // Inventory management
  const addInventoryItem = (item: Omit<InventoryItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newItem = {
      ...item,
      id: uuidv4(),
      createdAt: now,
      updatedAt: now
    };
    setInventory(prev => [...prev, newItem]);
  };
  
  const updateInventoryItem = (updatedItem: InventoryItem) => {
    setInventory(prev => 
      prev.map(item => 
        item.id === updatedItem.id 
          ? { ...updatedItem, updatedAt: new Date().toISOString() } 
          : item
      )
    );
  };
  
  const deleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(item => item.id !== id));
  };
  
  // Sales management
  const addSale = (sale: Omit<Sale, 'id'>) => {
    const newSale = {
      ...sale,
      id: uuidv4(),
    };
    setSales(prev => [...prev, newSale]);
  };
  
  const updateSale = (updatedSale: Sale) => {
    setSales(prev => 
      prev.map(sale => 
        sale.id === updatedSale.id ? updatedSale : sale
      )
    );
  };
  
  const deleteSale = (id: string) => {
    setSales(prev => prev.filter(sale => sale.id !== id));
  };
  
  // Cart management
  const addCart = (name: string) => {
    const maxId = carts.length > 0 ? Math.max(...carts.map(cart => cart.id)) : 0;
    setCarts(prev => [...prev, { id: maxId + 1, name }]);
  };
  
  const deleteCart = async (id: number) => {
    // Check if cart is in use
    const isInUse = salesRecords.some(record => record.cartId === id);
    if (isInUse) {
      throw new Error("Cart is in use and cannot be deleted");
    }
    setCarts(prev => prev.filter(cart => cart.id !== id));
  };
  
  // Payment management
  const addPayment = (date: string, amount: number, status: 'completed' | 'pending') => {
    const newPayment = {
      id: uuidv4(),
      date,
      amount,
      status
    };
    setPayments(prev => [...prev, newPayment]);
  };
  
  const updatePaymentStatus = (id: string, status: 'completed' | 'pending') => {
    setPayments(prev => 
      prev.map(payment => 
        payment.id === id ? { ...payment, status } : payment
      )
    );
  };
  
  const getPendingPayments = () => {
    return payments.filter(payment => payment.status === 'pending');
  };
  
  const getTotalPendingAmount = () => {
    return getPendingPayments().reduce((total, payment) => total + payment.amount, 0);
  };
  
  // Analytics functions
  const getMonthlySales = (month: string) => {
    return salesRecords
      .filter(record => record.date.startsWith(month))
      .reduce((total, record) => total + record.amount, 0);
  };
  
  const getMonthlyExpenses = (month: string) => {
    return expenses
      .filter(expense => expense.date.startsWith(month))
      .reduce((total, expense) => total + expense.amount, 0);
  };
  
  const getMonthlyProfit = (month: string) => {
    return getMonthlySales(month) - getMonthlyExpenses(month);
  };
  
  const getTotalSalesByDate = (date: string) => {
    return salesRecords
      .filter(record => record.date === date)
      .reduce((total, record) => total + record.amount, 0);
  };
  
  const getTotalExpensesByDate = (date: string) => {
    return expenses
      .filter(expense => expense.date === date)
      .reduce((total, expense) => total + expense.amount, 0);
  };
  
  const getDailyProfit = (date: string) => {
    return getTotalSalesByDate(date) - getTotalExpensesByDate(date);
  };
  
  const getMonthlyNetProfit = (month: string) => {
    const profit = getMonthlyProfit(month);
    const pendingPayments = getMonthlyPendingPayment(month);
    return profit - pendingPayments;
  };
  
  const getMonthlyPendingPayment = (month: string) => {
    return payments
      .filter(payment => payment.date.startsWith(month) && payment.status === 'pending')
      .reduce((total, payment) => total + payment.amount, 0);
  };
  
  const value = {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    
    inventory,
    addInventoryItem,
    updateInventoryItem,
    deleteInventoryItem,
    
    sales,
    addSale,
    updateSale,
    deleteSale,
    
    carts,
    addCart,
    deleteCart,
    
    payments,
    addPayment,
    updatePaymentStatus,
    getPendingPayments,
    getTotalPendingAmount,
    
    salesRecords,
    loading,
    
    getMonthlySales,
    getMonthlyExpenses,
    getMonthlyProfit,
    getTotalSalesByDate,
    getTotalExpensesByDate,
    getDailyProfit,
    getMonthlyNetProfit,
    getMonthlyPendingPayment,
  };
  
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

// Custom hook to use the data context
export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
