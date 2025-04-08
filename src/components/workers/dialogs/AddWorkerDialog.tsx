
import React from 'react';
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from 'lucide-react';

const workerFormSchema = z.object({
  name: z.string().min(2, {
    message: "Worker name must be at least 2 characters.",
  }),
  payment_type: z.enum(['daily', 'monthly']),
  monthly_salary: z.number().min(0).optional(),
  daily_wage: z.number().min(0).optional(),
});

interface AddWorkerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: z.infer<typeof workerFormSchema>) => Promise<void>;
}

const AddWorkerDialog: React.FC<AddWorkerDialogProps> = ({ 
  open, 
  onOpenChange, 
  onSubmit 
}) => {
  const form = useForm<z.infer<typeof workerFormSchema>>({
    resolver: zodResolver(workerFormSchema),
    defaultValues: {
      name: "",
      payment_type: "daily",
      monthly_salary: 0,
      daily_wage: 0,
    },
  });
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="default">
          <Plus className="mr-2 h-4 w-4" />
          Add Worker
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Worker</DialogTitle>
          <DialogDescription>
            Add a new worker to the system.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 p-1">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Worker Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="payment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="daily">Daily Wage</SelectItem>
                        <SelectItem value="monthly">Monthly Salary</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              {form.watch('payment_type') === 'monthly' && (
                <FormField
                  control={form.control}
                  name="monthly_salary"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monthly Salary</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Monthly Salary" 
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              {form.watch('payment_type') === 'daily' && (
                <FormField
                  control={form.control}
                  name="daily_wage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Daily Wage</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Daily Wage" 
                          {...field}
                          onChange={e => field.onChange(Number(e.target.value))} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </form>
          </Form>
        </ScrollArea>
        <DialogFooter>
          <Button type="button" onClick={form.handleSubmit(onSubmit)}>Add Worker</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddWorkerDialog;
