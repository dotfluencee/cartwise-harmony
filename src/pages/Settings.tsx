import React, { useState, useEffect } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Trash, Save, Edit, CheckCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose
} from '@/components/ui/dialog';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';

const Settings = () => {
  const { 
    carts, 
    addCart, 
    deleteCart, 
    salesRecords
  } = useData();
  
  const [newCartName, setNewCartName] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [cartToDelete, setCartToDelete] = useState<number | null>(null);
  
  // Check if cart is in use
  const isCartInUse = (cartId: number) => {
    return salesRecords.some(record => record.cartId === cartId);
  };
  
  // Handle cart form submission
  const handleAddCart = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCartName.trim()) {
      toast.error('Please enter a cart name');
      return;
    }
    
    addCart(newCartName);
    setNewCartName('');
  };
  
  // Handle cart deletion
  const handleDeleteCart = async (id: number) => {
    try {
      await deleteCart(id);
      setCartToDelete(null);
      toast.success('Cart deleted successfully');
    } catch (error) {
      toast.error('Failed to delete cart');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Settings</h2>
      </div>
      
      <Tabs defaultValue="carts">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="carts">Cart Management</TabsTrigger>
          <TabsTrigger value="general">General Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="carts">
          <Card>
            <CardHeader>
              <CardTitle>Cart Management</CardTitle>
              <CardDescription>
                Add, edit or remove carts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Add New Cart */}
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-4">Add New Cart</h3>
                <form onSubmit={handleAddCart} className="flex space-x-3">
                  <div className="flex-1">
                    <Input
                      placeholder="Enter cart name"
                      value={newCartName}
                      onChange={(e) => setNewCartName(e.target.value)}
                    />
                  </div>
                  <Button type="submit">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Cart
                  </Button>
                </form>
              </div>
              
              {/* Existing Carts */}
              <div className="p-4 border rounded-lg">
                <h3 className="text-lg font-medium mb-4">Existing Carts</h3>
                {carts.length > 0 ? (
                  <div className="space-y-3">
                    {carts.map((cart) => (
                      <div 
                        key={cart.id}
                        className="flex items-center justify-between p-3 border rounded hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <span className="font-medium">{cart.name}</span>
                          {isCartInUse(cart.id) && (
                            <Badge className="ml-2 bg-blue-100 text-blue-800">In Use</Badge>
                          )}
                        </div>
                        <div>
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                className="text-chawal-danger hover:text-chawal-danger hover:bg-red-50"
                                onClick={() => setCartToDelete(cart.id)}
                                disabled={isCartInUse(cart.id)}
                              >
                                <Trash className="h-4 w-4 mr-1" />
                                Delete
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Delete Cart</DialogTitle>
                                <DialogDescription>
                                  Are you sure you want to delete "{cart.name}"? This action cannot be undone.
                                </DialogDescription>
                              </DialogHeader>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button variant="outline">Cancel</Button>
                                </DialogClose>
                                <Button 
                                  variant="destructive"
                                  onClick={() => handleDeleteCart(cart.id)}
                                >
                                  Delete
                                </Button>
                              </DialogFooter>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-4 text-chawal-muted">
                    No carts available. Add a cart to get started.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general application settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-4">
                <div className="flex items-center justify-between space-x-4 px-4">
                  <h4 className="text-sm font-semibold">App Information</h4>
                  <CollapsibleTrigger asChild>
                    <Button variant="ghost" size="sm">
                      {isOpen ? "Hide" : "Show"}
                    </Button>
                  </CollapsibleTrigger>
                </div>
                <CollapsibleContent className="rounded-md border p-4">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">Chawal Express Management System</h3>
                      <p className="text-sm text-chawal-muted">Version 1.0.0</p>
                    </div>
                    
                    <div>
                      <h4 className="text-sm font-medium">Features:</h4>
                      <ul className="text-sm list-disc list-inside text-chawal-muted">
                        <li>Sales Tracking</li>
                        <li>Expense Management</li>
                        <li>Inventory Management</li>
                        <li>Partner Payments</li>
                        <li>Reports & Analytics</li>
                      </ul>
                    </div>
                  </div>
                </CollapsibleContent>
              </Collapsible>
              
              {/* More settings can be added here as needed */}
              <div className="mt-8 text-center text-chawal-muted">
                <p>More settings will be available in future updates.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
