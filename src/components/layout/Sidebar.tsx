
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  ShoppingCart,
  DollarSign,
  Package,
  Receipt,
  LogOut,
  AlertCircle,
  BarChart,
  ArrowDown,
  ArrowUp,
} from 'lucide-react';
import { useData } from '@/contexts/DataContext';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  href: string;
  active: boolean;
  badge?: number;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ icon, label, href, active, badge }) => {
  return (
    <Link to={href}>
      <div
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-chawal-accent',
          active ? 'bg-chawal-accent text-chawal-primary font-medium' : 'text-chawal-foreground'
        )}
      >
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center gap-3">
            {icon}
            <span>{label}</span>
          </div>
          {badge !== undefined && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-chawal-primary text-white text-xs">
              {badge}
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

const Sidebar = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const { getLowStockItems } = useData();
  
  const lowStockCount = getLowStockItems().length;
  
  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="flex flex-col h-full bg-white border-r border-gray-200 w-64 py-4">
      <div className="px-4 mb-8">
        <h1 className="text-xl font-bold text-chawal-primary">Chawal Express</h1>
        <p className="text-xs text-chawal-muted">Management System</p>
      </div>

      <div className="space-y-1 px-3">
        <SidebarItem
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          href="/dashboard"
          active={isActive('/dashboard')}
        />
        <SidebarItem
          icon={<ShoppingCart size={18} />}
          label="Sales"
          href="/sales"
          active={isActive('/sales')}
        />
        <SidebarItem
          icon={<DollarSign size={18} />}
          label="Expenses"
          href="/expenses"
          active={isActive('/expenses')}
        />
        <SidebarItem
          icon={<Package size={18} />}
          label="Inventory"
          href="/inventory"
          active={isActive('/inventory')}
          badge={lowStockCount || undefined}
        />
        <SidebarItem
          icon={<ArrowDown size={18} />}
          label="Partner Payments"
          href="/payments"
          active={isActive('/payments')}
        />
        <SidebarItem
          icon={<BarChart size={18} />}
          label="Reports"
          href="/reports"
          active={isActive('/reports')}
        />
      </div>

      <div className="mt-auto px-3 pt-3 border-t border-gray-100">
        <Button
          variant="ghost"
          className="w-full justify-start text-chawal-muted hover:text-chawal-danger hover:bg-red-50"
          onClick={logout}
        >
          <LogOut size={18} className="mr-2" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default Sidebar;
