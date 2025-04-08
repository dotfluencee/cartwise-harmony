
import React from 'react';
import { format, isSameDay, isWeekend, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Calendar } from "@/components/ui/calendar";

interface LeaveCalendarProps {
  calendarMonth: Date;
  selectedDate: Date;
  workingDays: number;
  getDayLeaveStatus: (date: Date) => string | null;
  onSelectDate: (date: Date) => void;
  onPreviousMonth: () => void;
  onNextMonth: () => void;
}

const LeaveCalendar: React.FC<LeaveCalendarProps> = ({
  calendarMonth,
  selectedDate,
  workingDays,
  getDayLeaveStatus,
  onSelectDate,
  onPreviousMonth,
  onNextMonth
}) => {
  
  const renderDay = (date: Date) => {
    const dayLeaveStatus = getDayLeaveStatus(date);
    const isSelected = isSameDay(date, selectedDate);
    const isWeekendDay = isWeekend(date);
    
    return (
      <div
        className={cn(
          "relative w-full h-full flex items-center justify-center",
          isSelected && "rounded-full bg-primary text-primary-foreground",
          !isSelected && dayLeaveStatus === 'approved' && "bg-green-100 text-green-800",
          !isSelected && dayLeaveStatus === 'pending' && "bg-yellow-100 text-yellow-800",
          !isSelected && dayLeaveStatus === 'rejected' && "bg-red-100 text-red-800",
          !isSelected && isWeekendDay && "text-muted-foreground bg-muted/50"
        )}
      >
        {date.getDate()}
        {dayLeaveStatus && (
          <div className={cn(
            "absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 rounded-full",
            dayLeaveStatus === 'approved' && "bg-green-500",
            dayLeaveStatus === 'pending' && "bg-yellow-500",
            dayLeaveStatus === 'rejected' && "bg-red-500"
          )} />
        )}
      </div>
    );
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Leave Calendar</CardTitle>
        <CardDescription>
          Monthly working days: {workingDays}
        </CardDescription>
        <div className="flex items-center justify-between space-x-2">
          <Button variant="outline" size="sm" onClick={onPreviousMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-sm font-medium">
            {format(calendarMonth, 'MMMM yyyy')}
          </h3>
          <Button variant="outline" size="sm" onClick={onNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <Calendar
          mode="single"
          selected={selectedDate}
          onSelect={(day) => day && onSelectDate(day)}
          month={calendarMonth}
          className="rounded-md border"
          components={{
            Day: ({ date }) => renderDay(date)
          }}
        />
      </CardContent>
    </Card>
  );
};

export default LeaveCalendar;
