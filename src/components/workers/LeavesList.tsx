
import React from 'react';
import { format, isWeekend } from 'date-fns';
import { Check, X, Eye, Trash2 } from 'lucide-react';
import { cn } from "@/lib/utils";
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

interface LeavesListProps {
  selectedDate: Date;
  leaves: any[];
  getWorkerNameById: (workerId: string) => string;
  getLeaveTypeLabel: (type: string) => string;
  onViewLeave: (leave: any) => void;
  onDeleteLeave: (leave: any) => void;
  onApproveLeave: (id: string) => void;
  onRejectLeave: (id: string) => void;
}

const LeavesList: React.FC<LeavesListProps> = ({
  selectedDate,
  leaves,
  getWorkerNameById,
  getLeaveTypeLabel,
  onViewLeave,
  onDeleteLeave,
  onApproveLeave,
  onRejectLeave
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Leaves for {format(selectedDate, 'MMMM d, yyyy')}</CardTitle>
        <CardDescription>
          {isWeekend(selectedDate) ? 'Weekend' : 'Working day'} - {leaves.length} leave record(s)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[300px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Worker</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leaves.length > 0 ? (
                leaves.map((leave) => (
                  <TableRow key={leave.id}>
                    <TableCell>{getWorkerNameById(leave.worker_id)}</TableCell>
                    <TableCell>{getLeaveTypeLabel(leave.leave_type)}</TableCell>
                    <TableCell>
                      <span className={cn(
                        "inline-flex items-center rounded-full px-2 py-1 text-xs font-medium",
                        leave.approval_status === 'approved' && "bg-green-100 text-green-800",
                        leave.approval_status === 'pending' && "bg-yellow-100 text-yellow-800",
                        leave.approval_status === 'rejected' && "bg-red-100 text-red-800"
                      )}>
                        {leave.approval_status.charAt(0).toUpperCase() + leave.approval_status.slice(1)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => onViewLeave(leave)} title="View">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {leave.approval_status === 'pending' && (
                          <>
                            <Button variant="ghost" size="icon" onClick={() => onApproveLeave(leave.id)} title="Approve">
                              <Check className="h-4 w-4 text-green-500" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => onRejectLeave(leave.id)} title="Reject">
                              <X className="h-4 w-4 text-red-500" />
                            </Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => onDeleteLeave(leave)} title="Delete">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">No leaves for this date</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default LeavesList;
