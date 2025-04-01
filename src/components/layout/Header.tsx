
import React from 'react';
import { format } from 'date-fns';
import { Bell, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useData } from '@/contexts/DataContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleSidebar }) => {
  const { user } = useAuth();
  const { getLowStockItems, getPendingPayments } = useData();
  
  const lowStockItems = getLowStockItems();
  const pendingPayments = getPendingPayments();
  const notificationCount = lowStockItems.length + pendingPayments.length;
  
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 border-b bg-white border-gray-200">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-lg font-medium">
            {format(new Date(), 'EEEE, MMMM dd, yyyy')}
          </h1>
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {notificationCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-chawal-primary text-white text-xs flex items-center justify-center">
                  {notificationCount}
                </span>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            {lowStockItems.length > 0 && (
              <>
                <h3 className="font-medium px-3 py-2 text-sm">Low Stock Items</h3>
                {lowStockItems.map(item => (
                  <DropdownMenuItem key={item.id} className="px-3 py-2 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-chawal-warning"></span>
                      <span>
                        {item.name} is running low ({item.quantity} {item.unit})
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
              </>
            )}
            
            {pendingPayments.length > 0 && (
              <>
                <h3 className="font-medium px-3 py-2 text-sm">Pending Payments</h3>
                {pendingPayments.slice(0, 3).map(payment => (
                  <DropdownMenuItem key={payment.id} className="px-3 py-2 cursor-pointer">
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-chawal-danger"></span>
                      <span>
                        Pending payment of ₹{payment.amount} from {payment.date}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
                {pendingPayments.length > 3 && (
                  <DropdownMenuItem className="px-3 py-2 cursor-pointer">
                    <span className="text-chawal-primary">
                      +{pendingPayments.length - 3} more pending payments
                    </span>
                  </DropdownMenuItem>
                )}
              </>
            )}
            
            {notificationCount === 0 && (
              <div className="px-3 py-4 text-center text-chawal-muted">
                No notifications at the moment
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
        
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-chawal-primary text-white flex items-center justify-center">
            {user?.username.charAt(0).toUpperCase()}
          </div>
          <div className="hidden md:block">
            <p className="text-sm font-medium">{user?.username}</p>
            <p className="text-xs text-chawal-muted">Administrator</p>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
