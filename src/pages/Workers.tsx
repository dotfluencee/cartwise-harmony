
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { format, startOfMonth, endOfMonth, parseISO, isValid, addMonths, subMonths, isSameMonth, isSameDay, isWeekend, getDay } from 'date-fns';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Import Worker Components
import WorkersList from '@/components/workers/WorkersList';
import LeaveCalendar from '@/components/workers/LeaveCalendar';
import LeavesList from '@/components/workers/LeavesList';
import AddWorkerDialog from '@/components/workers/dialogs/AddWorkerDialog';
import EditWorkerDialog from '@/components/workers/dialogs/EditWorkerDialog';
import AddPaymentDialog from '@/components/workers/dialogs/AddPaymentDialog';
import AddLeaveDialog from '@/components/workers/dialogs/AddLeaveDialog';
import PaymentDetailsDialog from '@/components/workers/dialogs/PaymentDetailsDialog';
import LeaveDetailsDialog from '@/components/workers/dialogs/LeaveDetailsDialog';

const Workers = () => {
  const { 
    workers, 
    addWorker, 
    updateWorker, 
    deleteWorker, 
    workerPayments, 
    addWorkerPayment,
    updateWorkerPayment,
    deleteWorkerPayment,
    getWorkerPaymentsByMonth,
    getWorkerAdvanceTotal,
    calculateRemainingMonthlySalary,
    workerLeaves,
    addWorkerLeave,
    updateWorkerLeave,
    deleteWorkerLeave,
    updateLeaveApprovalStatus,
    getWorkerLeavesByMonth,
    getMonthlyWorkingDays,
    getMonthlyApprovedLeaveDays,
    calculateMonthlySalaryAfterLeaves,
    loading 
  } = useData();
  
  const [activeTab, setActiveTab] = useState("workers");
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
  const [addWorkerOpen, setAddWorkerOpen] = useState(false);
  const [editWorkerOpen, setEditWorkerOpen] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState<any>(null);
  const [addPaymentOpen, setAddPaymentOpen] = useState(false);
  const [paymentsDialogOpen, setPaymentsDialogOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [workerToDelete, setWorkerToDelete] = useState<any>(null);
  const [deletePaymentDialogOpen, setDeletePaymentDialogOpen] = useState(false);
  const [paymentToDelete, setPaymentToDelete] = useState<any>(null);
  const [currentMonth, setCurrentMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [addLeaveOpen, setAddLeaveOpen] = useState(false);
  const [leaveDetailsOpen, setLeaveDetailsOpen] = useState(false);
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [deleteLeaveDialogOpen, setDeleteLeaveDialogOpen] = useState(false);
  const [leaveToDelete, setLeaveToDelete] = useState<any>(null);
  
  // Worker Handlers
  const handleAddWorker = async (values: any) => {
    try {
      await addWorker(
        values.name, 
        values.payment_type, 
        values.payment_type === 'monthly' ? values.monthly_salary || 0 : 0,
        values.payment_type === 'daily' ? values.daily_wage || 0 : 0
      );
      setAddWorkerOpen(false);
    } catch (error) {
      toast.error('Failed to add worker');
    }
  };
  
  const handleUpdateWorker = async (values: any) => {
    if (!selectedWorker) return;
    
    try {
      const updatedWorker = {
        ...selectedWorker,
        name: values.name,
        payment_type: values.payment_type,
        monthly_salary: values.payment_type === 'monthly' ? values.monthly_salary || 0 : 0,
        daily_wage: values.payment_type === 'daily' ? values.daily_wage || 0 : 0,
      };
      
      await updateWorker(updatedWorker);
      setEditWorkerOpen(false);
    } catch (error) {
      toast.error('Failed to update worker');
    }
  };

  const handleEdit = (worker: any) => {
    setSelectedWorker(worker);
    setEditWorkerOpen(true);
  };
  
  const handleDelete = (worker: any) => {
    setWorkerToDelete(worker);
    setDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (!workerToDelete) return;
    
    try {
      await deleteWorker(workerToDelete.id);
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete worker');
    }
  };
  
  // Payment Handlers
  const handleAddPayment = async (values: any) => {
    try {
      await addWorkerPayment(
        values.worker_id,
        values.amount,
        format(values.payment_date, 'yyyy-MM-dd'),
        values.payment_type,
        values.notes || undefined
      );
      setAddPaymentOpen(false);
    } catch (error) {
      toast.error('Failed to add payment');
    }
  };
  
  const handleViewPayments = (workerId: string) => {
    setSelectedWorkerId(workerId);
    setPaymentsDialogOpen(true);
  };
  
  const handleDeletePayment = (payment: any) => {
    setPaymentToDelete(payment);
    setDeletePaymentDialogOpen(true);
  };
  
  const confirmDeletePayment = async () => {
    if (!paymentToDelete) return;
    
    try {
      await deleteWorkerPayment(paymentToDelete.id);
      setDeletePaymentDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete payment');
    }
  };
  
  // Leave Handlers
  const handleAddLeave = async (values: any) => {
    try {
      await addWorkerLeave(
        values.worker_id,
        format(values.leave_date, 'yyyy-MM-dd'),
        values.leave_type,
        values.reason
      );
      setAddLeaveOpen(false);
    } catch (error) {
      toast.error('Failed to add leave application');
    }
  };
  
  const handleViewLeave = (leave: any) => {
    setSelectedLeave(leave);
    setLeaveDetailsOpen(true);
  };
  
  const handleDeleteLeave = (leave: any) => {
    setLeaveToDelete(leave);
    setDeleteLeaveDialogOpen(true);
  };
  
  const confirmDeleteLeave = async () => {
    if (!leaveToDelete) return;
    
    try {
      await deleteWorkerLeave(leaveToDelete.id);
      setDeleteLeaveDialogOpen(false);
    } catch (error) {
      toast.error('Failed to delete leave application');
    }
  };
  
  const handleApproveLeave = async (id: string) => {
    try {
      await updateLeaveApprovalStatus(id, 'approved');
      if (selectedLeave && selectedLeave.id === id) {
        setSelectedLeave({
          ...selectedLeave,
          approval_status: 'approved'
        });
      }
    } catch (error) {
      toast.error('Failed to approve leave');
    }
  };
  
  const handleRejectLeave = async (id: string) => {
    try {
      await updateLeaveApprovalStatus(id, 'rejected');
      if (selectedLeave && selectedLeave.id === id) {
        setSelectedLeave({
          ...selectedLeave,
          approval_status: 'rejected'
        });
      }
    } catch (error) {
      toast.error('Failed to reject leave');
    }
  };

  // Calendar Handlers
  const handleSelectDate = (date: Date) => {
    setSelectedDate(date);
    
    if (!isSameMonth(date, calendarMonth)) {
      setCalendarMonth(date);
    }
  };
  
  const handlePreviousMonth = () => {
    setCalendarMonth(prevMonth => subMonths(prevMonth, 1));
  };
  
  const handleNextMonth = () => {
    setCalendarMonth(prevMonth => addMonths(prevMonth, 1));
  };
  
  // Utility Functions
  const getWorkerPayments = (workerId: string) => {
    return getWorkerPaymentsByMonth(workerId, currentMonth);
  };
  
  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'daily_wage': return 'Daily Wage';
      case 'monthly_salary': return 'Monthly Salary';
      case 'advance': return 'Advance';
      default: return type;
    }
  };
  
  const getDayLeaveStatus = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    const dayLeaves = workerLeaves.filter(leave => leave.leave_date === formattedDate);
    
    if (!dayLeaves.length) return null;
    
    const approved = dayLeaves.filter(l => l.approval_status === 'approved').length;
    const pending = dayLeaves.filter(l => l.approval_status === 'pending').length;
    const rejected = dayLeaves.filter(l => l.approval_status === 'rejected').length;
    
    if (approved > 0) return 'approved';
    if (pending > 0) return 'pending';
    if (rejected > 0) return 'rejected';
    return null;
  };
  
  const getWorkerNameById = (workerId: string) => {
    const worker = workers.find(w => w.id === workerId);
    return worker ? worker.name : 'Unknown';
  };
  
  const getLeaveTypeLabel = (type: string) => {
    switch (type) {
      case 'full_day': return 'Full Day';
      case 'half_day': return 'Half Day';
      default: return type;
    }
  };
  
  const getLeavesForDate = (date: Date) => {
    const formattedDate = format(date, 'yyyy-MM-dd');
    return workerLeaves.filter(leave => leave.leave_date === formattedDate);
  };
  
  if (loading) {
    return <p>Loading workers data...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Workers & Salary</h2>
        <div className="flex space-x-2">
          {activeTab === "workers" && (
            <>
              <AddPaymentDialog 
                open={addPaymentOpen}
                onOpenChange={setAddPaymentOpen}
                workers={workers}
                onSubmit={handleAddPayment}
              />
              
              <AddWorkerDialog
                open={addWorkerOpen}
                onOpenChange={setAddWorkerOpen}
                onSubmit={handleAddWorker}
              />
            </>
          )}
          
          {activeTab === "leaves" && (
            <AddLeaveDialog
              open={addLeaveOpen}
              onOpenChange={setAddLeaveOpen}
              workers={workers}
              onSubmit={handleAddLeave}
            />
          )}
        </div>
      </div>
      
      <Tabs defaultValue="workers" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="workers">Workers</TabsTrigger>
          <TabsTrigger value="leaves">Leaves Management</TabsTrigger>
        </TabsList>
        
        <TabsContent value="workers">
          <WorkersList 
            workers={workers}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onViewPayments={handleViewPayments}
          />
        </TabsContent>
        
        <TabsContent value="leaves">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <LeaveCalendar
              calendarMonth={calendarMonth}
              selectedDate={selectedDate}
              workingDays={getMonthlyWorkingDays(format(calendarMonth, 'yyyy-MM'))}
              getDayLeaveStatus={getDayLeaveStatus}
              onSelectDate={handleSelectDate}
              onPreviousMonth={handlePreviousMonth}
              onNextMonth={handleNextMonth}
            />
            
            <LeavesList
              selectedDate={selectedDate}
              leaves={getLeavesForDate(selectedDate)}
              getWorkerNameById={getWorkerNameById}
              getLeaveTypeLabel={getLeaveTypeLabel}
              onViewLeave={handleViewLeave}
              onDeleteLeave={handleDeleteLeave}
              onApproveLeave={handleApproveLeave}
              onRejectLeave={handleRejectLeave}
            />
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Worker Dialog */}
      <EditWorkerDialog 
        open={editWorkerOpen}
        onOpenChange={setEditWorkerOpen}
        worker={selectedWorker}
        onSubmit={handleUpdateWorker}
      />

      {/* Payment Details Dialog */}
      <PaymentDetailsDialog
        open={paymentsDialogOpen}
        onOpenChange={setPaymentsDialogOpen}
        workerId={selectedWorkerId}
        workerName={selectedWorkerId ? getWorkerNameById(selectedWorkerId) : ''}
        payments={selectedWorkerId ? getWorkerPayments(selectedWorkerId) : []}
        currentMonth={currentMonth}
        setCurrentMonth={setCurrentMonth}
        getPaymentTypeLabel={getPaymentTypeLabel}
        onDeletePayment={handleDeletePayment}
      />

      {/* Leave Details Dialog */}
      <LeaveDetailsDialog
        open={leaveDetailsOpen}
        onOpenChange={setLeaveDetailsOpen}
        leave={selectedLeave}
        workerName={selectedLeave ? getWorkerNameById(selectedLeave.worker_id) : ''}
        getLeaveTypeLabel={getLeaveTypeLabel}
        onApproveLeave={handleApproveLeave}
        onRejectLeave={handleRejectLeave}
      />

      {/* Delete Worker Alert Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the worker record and all associated payments and leaves.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Payment Alert Dialog */}
      <AlertDialog open={deletePaymentDialogOpen} onOpenChange={setDeletePaymentDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this payment record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeletePayment}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete Leave Alert Dialog */}
      <AlertDialog open={deleteLeaveDialogOpen} onOpenChange={setDeleteLeaveDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete this leave record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteLeave}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Workers;
