
import React, { useState } from 'react';
import { format } from 'date-fns';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PaymentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workerId: string | null;
  workerName: string;
  payments: any[];
  currentMonth: string;
  setCurrentMonth: (month: string) => void;
  getPaymentTypeLabel: (type: string) => string;
  onDeletePayment: (payment: any) => void;
}

const PaymentDetailsDialog: React.FC<PaymentDetailsDialogProps> = ({ 
  open, 
  onOpenChange, 
  workerId,
  workerName,
  payments,
  currentMonth,
  setCurrentMonth, 
  getPaymentTypeLabel,
  onDeletePayment
}) => {
  const months = [];
  const currentYear = new Date().getFullYear();
  for (let i = 0; i < 12; i++) {
    const date = new Date(currentYear, i, 1);
    months.push({
      value: format(date, 'yyyy-MM'),
      label: format(date, 'MMMM yyyy')
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle>{workerName} - Payment Records</DialogTitle>
          <DialogDescription>
            View and manage payment records.
          </DialogDescription>
        </DialogHeader>
        <div className="mb-4">
          <Select
            value={currentMonth}
            onValueChange={setCurrentMonth}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select month" />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month.value} value={month.value}>
                  {month.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <ScrollArea className="max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.length > 0 ? (
                payments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {format(parseISO(payment.payment_date), 'MMM dd, yyyy')}
                    </TableCell>
                    <TableCell>{getPaymentTypeLabel(payment.payment_type)}</TableCell>
                    <TableCell>₹{payment.amount.toFixed(2)}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => onDeletePayment(payment)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">No payment records found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentDetailsDialog;

function parseISO(date_string: string): Date {
  return new Date(date_string);
}
