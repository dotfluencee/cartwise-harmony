
import React from 'react';
import { Edit, Trash2, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface WorkersListProps {
  workers: any[];
  onEdit: (worker: any) => void;
  onDelete: (worker: any) => void;
  onViewPayments: (workerId: string) => void;
}

const WorkersList: React.FC<WorkersListProps> = ({ 
  workers,
  onEdit,
  onDelete,
  onViewPayments
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Workers</CardTitle>
        <CardDescription>
          Manage workers and their payment information.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[200px]">Name</TableHead>
                <TableHead>Payment Type</TableHead>
                <TableHead>Monthly Salary</TableHead>
                <TableHead>Daily Wage</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {workers.map((worker) => (
                <TableRow key={worker.id}>
                  <TableCell className="font-medium">{worker.name}</TableCell>
                  <TableCell>{worker.payment_type === 'monthly' ? 'Monthly Salary' : 'Daily Wage'}</TableCell>
                  <TableCell>{worker.payment_type === 'monthly' ? `₹${worker.monthly_salary.toFixed(2)}` : 'N/A'}</TableCell>
                  <TableCell>{worker.payment_type === 'daily' ? `₹${worker.daily_wage.toFixed(2)}` : 'N/A'}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" onClick={() => onViewPayments(worker.id)}>
                        <DollarSign className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onEdit(worker)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => onDelete(worker)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default WorkersList;
