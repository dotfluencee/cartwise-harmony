import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useData } from '@/contexts/DataContext';
import { ArrowDown, Search, Plus, PenLine, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

interface Expense {
  id: string;
  date: string;
  category: string;
  description: string;
  amount: number;
}

interface ExpensesPageProps {
  expenses: Expense[];
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  onUpdateExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
}

const ExpensesPage: React.FC<ExpensesPageProps> = ({ expenses, onAddExpense, onUpdateExpense, onDeleteExpense }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const filteredExpenses = expenses.filter(expense =>
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (categoryFilter === '' || expense.category === categoryFilter)
  );

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Expenses</CardTitle>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Search expenses..."
              className="max-w-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
            <Select onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All Categories</SelectItem>
                <SelectItem value="Food">Food</SelectItem>
                <SelectItem value="Rent">Rent</SelectItem>
                <SelectItem value="Utilities">Utilities</SelectItem>
                <SelectItem value="Transportation">Transportation</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </DialogTrigger>
              <ExpenseForm onAddExpense={onAddExpense} setIsAdding={setIsAdding} />
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <p>No expenses found.</p>
          ) : (
            <ExpensesList expenses={filteredExpenses} onEdit={onUpdateExpense} onDelete={onDeleteExpense} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  setIsAdding: (isAdding: boolean) => void;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense, setIsAdding }) => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState(0);

  const handleSubmit = () => {
    if (!date || !category || !description || !amount) {
      alert('Please fill in all fields.');
      return;
    }

    const newExpense = {
      date,
      category,
      description,
      amount: Number(amount),
    };

    onAddExpense(newExpense);
    setIsAdding(false);
    toast.success("Expense added successfully");
  };

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add Expense</DialogTitle>
        <DialogDescription>
          Add a new expense to your history. Click save when you're done.
        </DialogDescription>
      </DialogHeader>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="date" className="text-right">
            Date
          </Label>
          <Input
            type="date"
            id="date"
            defaultValue={date}
            className="col-span-3"
            onChange={e => setDate(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="category" className="text-right">
            Category
          </Label>
          <Select onValueChange={setCategory}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Food">Food</SelectItem>
              <SelectItem value="Rent">Rent</SelectItem>
              <SelectItem value="Utilities">Utilities</SelectItem>
              <SelectItem value="Transportation">Transportation</SelectItem>
              <SelectItem value="Other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="description" className="text-right">
            Description
          </Label>
          <Input
            type="text"
            id="description"
            className="col-span-3"
            onChange={e => setDescription(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="amount" className="text-right">
            Amount
          </Label>
          <Input
            type="number"
            id="amount"
            className="col-span-3"
            onChange={e => setAmount(e.target.value)}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="submit" onClick={handleSubmit}>
          Add Expense
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

const ExpenseItem = ({ expense, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedExpense, setEditedExpense] = useState({ ...expense });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditedExpense(prev => ({ ...prev, [name]: value }));
  };

  const handleEditSubmit = () => {
    onEdit(editedExpense);
    setIsEditing(false);
  };

  return (
    <div key={expense.id} className="border rounded-md p-4 mb-2">
      {isEditing ? (
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="date" className="text-right">
              Date
            </Label>
            <Input
              type="date"
              id="date"
              name="date"
              defaultValue={editedExpense.date}
              className="col-span-3"
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="category" className="text-right">
              Category
            </Label>
            <Input
              type="text"
              id="category"
              name="category"
              defaultValue={editedExpense.category}
              className="col-span-3"
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="description" className="text-right">
              Description
            </Label>
            <Input
              type="text"
              id="description"
              name="description"
              defaultValue={editedExpense.description}
              className="col-span-3"
              onChange={handleInputChange}
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="amount" className="text-right">
              Amount
            </Label>
            <Input
              type="number"
              id="amount"
              name="amount"
              defaultValue={editedExpense.amount}
              className="col-span-3"
              onChange={handleInputChange}
            />
          </div>
          <Button size="sm" onClick={handleEditSubmit}>
            Update
          </Button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold">{expense.description}</h3>
            <p className="text-sm text-gray-500">
              {expense.category} - {format(new Date(expense.date), 'PPP')}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span>₹{expense.amount}</span>
            <Button size="icon" variant="ghost" onClick={() => setIsEditing(true)}>
              <PenLine className="h-4 w-4" />
            </Button>
            <Button size="icon" variant="ghost" onClick={() => onDelete(expense.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

const ExpensesList = ({ expenses, onEdit, onDelete }) => {
  return (
    <div>
      {expenses.map(expense => (
        <ExpenseItem key={expense.id} expense={expense} onEdit={onEdit} onDelete={onDelete} />
      ))}
    </div>
  );
};

const ExpenseHistory = ({ expenses }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingExpense, setEditingExpense] = useState(null);
  const [deleteConfirmExpense, setDeleteConfirmExpense] = useState(null);
  const { updateExpense, deleteExpense } = useData();

  const filteredExpenses = expenses.filter(expense => 
    expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    expense.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleEditSubmit = (updatedExpense) => {
    try {
      updateExpense(updatedExpense);
      setEditingExpense(null);
      toast.success("Expense updated successfully");
    } catch (error) {
      toast.error("Failed to update expense");
      console.error(error);
    }
  };

  const handleDelete = () => {
    try {
      deleteExpense(deleteConfirmExpense.id);
      setDeleteConfirmExpense(null);
      toast.success("Expense deleted successfully");
    } catch (error) {
      toast.error("Failed to delete expense");
      console.error(error);
    }
  };

  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle>Expense History</CardTitle>
          <div className="flex items-center space-x-2">
            <Input
              type="text"
              placeholder="Search expenses..."
              className="max-w-sm"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {filteredExpenses.length === 0 ? (
            <p>No expenses found.</p>
          ) : (
            filteredExpenses.map(expense => (
              <div key={expense.id} className="border rounded-md p-4 mb-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold">{expense.description}</h3>
                    <p className="text-sm text-gray-500">
                      {expense.category} - {format(new Date(expense.date), 'PPP')}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span>₹{expense.amount}</span>
                    <Button size="icon" variant="ghost" onClick={() => setEditingExpense(expense)}>
                      <PenLine className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => setDeleteConfirmExpense(expense)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* Edit Expense Dialog */}
      <Dialog open={editingExpense !== null} onOpenChange={() => setEditingExpense(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Expense</DialogTitle>
            <DialogDescription>
              Edit an existing expense. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {editingExpense && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="date" className="text-right">
                  Date
                </Label>
                <Input
                  type="date"
                  id="date"
                  defaultValue={editingExpense.date}
                  className="col-span-3"
                  onChange={e => setEditingExpense({ ...editingExpense, date: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="category" className="text-right">
                  Category
                </Label>
                <Input
                  type="text"
                  id="category"
                  defaultValue={editingExpense.category}
                  className="col-span-3"
                  onChange={e => setEditingExpense({ ...editingExpense, category: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Input
                  type="text"
                  id="description"
                  defaultValue={editingExpense.description}
                  className="col-span-3"
                  onChange={e => setEditingExpense({ ...editingExpense, description: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="amount" className="text-right">
                  Amount
                </Label>
                <Input
                  type="number"
                  id="amount"
                  defaultValue={editingExpense.amount}
                  className="col-span-3"
                  onChange={e => setEditingExpense({ ...editingExpense, amount: Number(e.target.value) })}
                />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button type="submit" onClick={() => handleEditSubmit(editingExpense)}>
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmExpense !== null} onOpenChange={() => setDeleteConfirmExpense(null)}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Expense</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this expense? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button type="submit" variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Expenses = () => {
  const { expenses, addExpense, updateExpense, deleteExpense } = useData();

  const handleAddExpense = (newExpense: Omit<Expense, 'id'>) => {
    addExpense(newExpense);
  };

  const handleUpdateExpense = (updatedExpense: Expense) => {
    updateExpense(updatedExpense);
  };

  const handleDeleteExpense = (id: string) => {
    deleteExpense(id);
  };

  return (
    <div>
      <ExpensesPage
        expenses={expenses}
        onAddExpense={handleAddExpense}
        onUpdateExpense={handleUpdateExpense}
        onDeleteExpense={handleDeleteExpense}
      />
      <ExpenseHistory expenses={expenses} />
    </div>
  );
};

export default Expenses;
