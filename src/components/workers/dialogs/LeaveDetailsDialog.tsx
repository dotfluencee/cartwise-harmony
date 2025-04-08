
import React from 'react';
import { format } from 'date-fns';
import { Check, X } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

interface LeaveDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leave: any;
  workerName: string;
  getLeaveTypeLabel: (type: string) => string;
  onApproveLeave: (id: string) => Promise<void>;
  onRejectLeave: (id: string) => Promise<void>;
}

const LeaveDetailsDialog: React.FC<LeaveDetailsDialogProps> = ({ 
  open, 
  onOpenChange, 
  leave,
  workerName,
  getLeaveTypeLabel,
  onApproveLeave,
  onRejectLeave
}) => {
  if (!leave) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Leave Details</DialogTitle>
          <DialogDescription>
            View and manage leave request.
          </DialogDescription>
        </DialogHeader>
        
        <Card className="border-0 shadow-none">
          <CardContent className="p-0 space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="text-sm font-medium">Worker:</div>
              <div>{workerName}</div>
              
              <div className="text-sm font-medium">Date:</div>
              <div>{format(new Date(leave.leave_date), 'MMM dd, yyyy')}</div>
              
              <div className="text-sm font-medium">Type:</div>
              <div>{getLeaveTypeLabel(leave.leave_type)}</div>
              
              <div className="text-sm font-medium">Status:</div>
              <div>
                <span className={cn(
                  "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                  leave.approval_status === 'approved' && "bg-green-100 text-green-800",
                  leave.approval_status === 'pending' && "bg-yellow-100 text-yellow-800",
                  leave.approval_status === 'rejected' && "bg-red-100 text-red-800"
                )}>
                  {leave.approval_status.charAt(0).toUpperCase() + leave.approval_status.slice(1)}
                </span>
              </div>
              
              {leave.reason && (
                <>
                  <div className="text-sm font-medium">Reason:</div>
                  <div className="col-span-2 text-sm">{leave.reason}</div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
        
        {leave.approval_status === 'pending' && (
          <DialogFooter>
            <Button variant="outline" onClick={() => onRejectLeave(leave.id)}>
              <X className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button onClick={() => onApproveLeave(leave.id)}>
              <Check className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default LeaveDetailsDialog;
