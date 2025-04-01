
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle, SearchIcon, AlertTriangle, Package } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';

const Inventory = () => {
  const { inventory, addInventoryItem, updateInventoryItemQuantity, getLowStockItems } = useData();
  
  // State for the new inventory item form
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [itemUnit, setItemUnit] = useState('');
  const [itemThreshold, setItemThreshold] = useState('');
  
  // State for updating inventory
  const [updateItemId, setUpdateItemId] = useState<string | null>(null);
  const [updateQuantity, setUpdateQuantity] = useState('');
  
  // State for filtering inventory
  const [searchQuery, setSearchQuery] = useState('');
  
  // Handle new item form submission
  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!itemName || !itemQuantity || !itemUnit || !itemThreshold) {
      return;
    }
    
    const quantity = parseFloat(itemQuantity);
    const threshold = parseFloat(itemThreshold);
    
    if (isNaN(quantity) || quantity < 0 || isNaN(threshold) || threshold < 0) {
      return;
    }
    
    addInventoryItem(itemName, quantity, itemUnit, threshold);
    
    // Reset form
    setItemName('');
    setItemQuantity('');
    setItemUnit('');
    setItemThreshold('');
  };
  
  // Handle update quantity form submission
  const handleUpdateQuantity = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!updateItemId || !updateQuantity) {
      return;
    }
    
    const quantity = parseFloat(updateQuantity);
    
    if (isNaN(quantity) || quantity < 0) {
      return;
    }
    
    updateInventoryItemQuantity(updateItemId, quantity);
    
    // Reset form
    setUpdateItemId(null);
    setUpdateQuantity('');
  };
  
  // Filter inventory items based on search query
  const filteredInventory = inventory.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.unit.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  // Low stock items
  const lowStockItems = getLowStockItems();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Inventory Management</h2>
      </div>
      
      {lowStockItems.length > 0 && (
        <Alert variant="warning" className="bg-amber-50 border-amber-300">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-800">Low Stock Alert</AlertTitle>
          <AlertDescription className="text-amber-700">
            {lowStockItems.length} item{lowStockItems.length > 1 ? 's' : ''} {lowStockItems.length > 1 ? 'are' : 'is'} running low and need{lowStockItems.length > 1 ? '' : 's'} to be restocked.
          </AlertDescription>
        </Alert>
      )}
      
      <Tabs defaultValue="view">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="view">View Inventory</TabsTrigger>
          <TabsTrigger value="add">Add New Item</TabsTrigger>
        </TabsList>
        
        <TabsContent value="view" className="space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <div>
                  <CardTitle>Current Inventory</CardTitle>
                  <CardDescription>
                    Manage and update your inventory items
                  </CardDescription>
                </div>
                
                <div className="relative w-full sm:w-60">
                  <SearchIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Search inventory..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {filteredInventory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left">Item Name</th>
                        <th className="py-3 px-4 text-right">Quantity</th>
                        <th className="py-3 px-4 text-left">Unit</th>
                        <th className="py-3 px-4 text-right">Threshold</th>
                        <th className="py-3 px-4 text-left">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredInventory.map((item) => {
                        const isLowStock = item.quantity <= item.threshold;
                        const stockPercentage = Math.min(Math.round((item.quantity / (item.threshold * 2)) * 100), 100);
                        
                        return (
                          <tr key={item.id} className="border-b hover:bg-gray-50">
                            <td className="py-3 px-4">{item.name}</td>
                            <td className={`py-3 px-4 text-right font-medium ${isLowStock ? 'text-chawal-danger' : ''}`}>
                              {item.quantity}
                            </td>
                            <td className="py-3 px-4">{item.unit}</td>
                            <td className="py-3 px-4 text-right">{item.threshold}</td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                <Progress value={stockPercentage} className="h-2" />
                                <span className={`text-xs ${isLowStock ? 'text-chawal-danger' : 'text-chawal-muted'}`}>
                                  {isLowStock ? 'Low' : 'OK'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setUpdateItemId(item.id);
                                  setUpdateQuantity(item.quantity.toString());
                                }}
                              >
                                Update
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4 text-chawal-muted">
                  {searchQuery ? 'No matching inventory items found' : 'No inventory items yet'}
                </div>
              )}
              
              {updateItemId && (
                <div className="mt-6 p-4 border rounded-lg">
                  <h3 className="font-medium mb-4">
                    Update Quantity: {inventory.find(item => item.id === updateItemId)?.name}
                  </h3>
                  <form onSubmit={handleUpdateQuantity} className="flex flex-wrap gap-4 items-end">
                    <div className="space-y-2 flex-1">
                      <Label htmlFor="updateQuantity">New Quantity</Label>
                      <Input
                        id="updateQuantity"
                        type="number"
                        min="0"
                        step="0.01"
                        value={updateQuantity}
                        onChange={(e) => setUpdateQuantity(e.target.value)}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" className="bg-chawal-primary hover:bg-chawal-secondary">
                        Update
                      </Button>
                      <Button type="button" variant="outline" onClick={() => setUpdateItemId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="add">
          <Card>
            <CardHeader>
              <CardTitle>Add New Inventory Item</CardTitle>
              <CardDescription>
                Add a new item to your inventory with initial quantity and minimum threshold
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAddItem} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemName">Item Name</Label>
                    <Input
                      id="itemName"
                      placeholder="e.g., Rice, Oil, Vegetables"
                      value={itemName}
                      onChange={(e) => setItemName(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="itemUnit">Unit of Measurement</Label>
                    <Input
                      id="itemUnit"
                      placeholder="e.g., kg, liters, pieces"
                      value={itemUnit}
                      onChange={(e) => setItemUnit(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="itemQuantity">Initial Quantity</Label>
                    <Input
                      id="itemQuantity"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={itemQuantity}
                      onChange={(e) => setItemQuantity(e.target.value)}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="itemThreshold">Minimum Threshold</Label>
                    <Input
                      id="itemThreshold"
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0"
                      value={itemThreshold}
                      onChange={(e) => setItemThreshold(e.target.value)}
                    />
                    <p className="text-xs text-chawal-muted">
                      You'll be alerted when quantity falls below this threshold
                    </p>
                  </div>
                </div>
                
                <Button
                  type="submit"
                  className="bg-chawal-primary hover:bg-chawal-secondary"
                  disabled={!itemName || !itemQuantity || !itemUnit || !itemThreshold}
                >
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Inventory Item
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Inventory;
