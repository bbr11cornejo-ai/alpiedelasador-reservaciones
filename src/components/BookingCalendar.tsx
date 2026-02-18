import { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { BookingStatus, Booking } from '@/types/booking';

interface BookingCalendarProps {
  year: number;
  bookings: Booking[];
  onDateSelect: (date: Date) => void;
  selectedDate: Date | null;
  isAdmin?: boolean;
}

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export const BookingCalendar = ({ year, bookings, onDateSelect, selectedDate, isAdmin = false }: BookingCalendarProps) => {
  const [currentMonth, setCurrentMonth] = useState(0);

  const getStatusForDate = (date: Date): BookingStatus => {
    const dateStr = date.toISOString().split('T')[0];
    const booking = bookings.find(b => b.date === dateStr);
    const actualStatus = booking?.status || 'free';
    
    // Para visitantes, mostrar "occupied" como "reserved" (amarillo)
    if (!isAdmin && actualStatus === 'occupied') {
      return 'reserved';
    }
    
    return actualStatus;
  };

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, currentMonth, 1);
    const lastDay = new Date(year, currentMonth + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: (Date | null)[] = [];
    
    // Add empty slots for days before the first of the month
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    
    // Add actual days
    for (let day = 1; day <= totalDays; day++) {
      days.push(new Date(year, currentMonth, day));
    }

    return days;
  }, [year, currentMonth]);

  const handlePrevMonth = () => {
    setCurrentMonth(prev => (prev === 0 ? 11 : prev - 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(prev => (prev === 11 ? 0 : prev + 1));
  };

  const isSelected = (date: Date) => {
    if (!selectedDate) return false;
    return date.toDateString() === selectedDate.toDateString();
  };

  const getStatusClasses = (status: BookingStatus) => {
    switch (status) {
      case 'free':
        return 'bg-status-free-light border-status-free text-status-free hover:bg-status-free hover:text-primary-foreground';
      case 'reserved':
        return 'bg-status-reserved-light border-status-reserved text-status-reserved hover:bg-status-reserved hover:text-primary-foreground';
      case 'occupied':
        return 'bg-status-occupied-light border-status-occupied text-status-occupied hover:bg-status-occupied hover:text-primary-foreground';
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-elegant p-6 md:p-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <CalendarIcon className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground">
              {MONTHS[currentMonth]}
            </h2>
            <p className="text-muted-foreground text-sm">{year}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevMonth}
            className="rounded-xl"
          >
            <ChevronLeft className="w-5 h-5" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            className="rounded-xl"
          >
            <ChevronRight className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-2 mb-4">
        {WEEKDAYS.map(day => (
          <div
            key={day}
            className="text-center text-sm font-medium text-muted-foreground py-2"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" />;
          }

          const status = getStatusForDate(date);
          const selected = isSelected(date);
          const dateStr = date.toISOString().split('T')[0];
          const booking = bookings.find(b => b.date === dateStr);

          return (
            <div key={date.toISOString()} className="relative">
            <button
              onClick={() => onDateSelect(date)}
              className={cn(
                  'w-full aspect-square rounded-xl border-2 font-medium transition-all duration-200 flex items-center justify-center text-sm md:text-base',
                getStatusClasses(status),
                selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105'
              )}
            >
              {date.getDate()}
            </button>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-6 mt-8 pt-6 border-t border-border">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-status-free-light border-2 border-status-free" />
          <span className="text-sm text-muted-foreground">Libre</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-status-reserved-light border-2 border-status-reserved" />
          <span className="text-sm text-muted-foreground">Reservado</span>
        </div>
        {isAdmin && (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-md bg-status-occupied-light border-2 border-status-occupied" />
          <span className="text-sm text-muted-foreground">Ocupado</span>
        </div>
        )}
      </div>
    </div>
  );
};
