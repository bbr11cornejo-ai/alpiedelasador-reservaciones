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

  const handleKeyDown = (e: React.KeyboardEvent, date: Date) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onDateSelect(date);
    }
  };

  const getStatusLabel = (status: BookingStatus): string => {
    switch (status) {
      case 'free':
        return 'Disponible';
      case 'reserved':
        return 'Reservado';
      case 'occupied':
        return 'Ocupado';
    }
  };

  return (
    <div 
      className="bg-card rounded-2xl shadow-elegant p-4 sm:p-6 md:p-8 animate-fade-in"
      role="region"
      aria-label="Calendario de disponibilidad"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-primary/10 flex items-center justify-center" aria-hidden="true">
            <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl sm:text-2xl font-semibold text-foreground">
              {MONTHS[currentMonth]}
            </h2>
            <p className="text-muted-foreground text-xs sm:text-sm">{year}</p>
          </div>
        </div>
        
        <div className="flex gap-1 sm:gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevMonth}
            className="rounded-xl min-h-[44px] min-w-[44px] focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Mes anterior"
          >
            <ChevronLeft className="w-5 h-5" aria-hidden="true" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextMonth}
            className="rounded-xl min-h-[44px] min-w-[44px] focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Mes siguiente"
          >
            <ChevronRight className="w-5 h-5" aria-hidden="true" />
          </Button>
        </div>
      </div>

      {/* Weekday headers */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-3 sm:mb-4" role="row">
        {WEEKDAYS.map(day => (
          <div
            key={day}
            className="text-center text-xs sm:text-sm font-medium text-muted-foreground py-2"
            role="columnheader"
            aria-label={day}
          >
            <span className="sr-only">{day === 'Dom' ? 'Domingo' : day === 'Lun' ? 'Lunes' : day === 'Mar' ? 'Martes' : day === 'Mié' ? 'Miércoles' : day === 'Jue' ? 'Jueves' : day === 'Vie' ? 'Viernes' : 'Sábado'}</span>
            <span aria-hidden="true">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1 sm:gap-2" role="grid" aria-label={`Calendario de ${MONTHS[currentMonth]} ${year}`}>
        {calendarDays.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="aspect-square" aria-hidden="true" />;
          }

          const status = getStatusForDate(date);
          const selected = isSelected(date);
          const dateStr = date.toISOString().split('T')[0];
          const booking = bookings.find(b => b.date === dateStr);
          const dayNumber = date.getDate();
          const statusLabel = getStatusLabel(status);
          const fullDateLabel = `${dayNumber} de ${MONTHS[currentMonth]} ${year}, ${statusLabel}`;
          const hasBooking = booking ? `, ${booking.clientName || 'Reservación'}` : '';

          return (
            <div key={date.toISOString()} className="relative" role="gridcell">
            <button
              onClick={() => onDateSelect(date)}
              onKeyDown={(e) => handleKeyDown(e, date)}
              className={cn(
                  'w-full aspect-square rounded-lg sm:rounded-xl border-2 font-medium transition-all duration-200 flex items-center justify-center text-sm sm:text-base min-h-[44px] focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
                getStatusClasses(status),
                selected && 'ring-2 ring-primary ring-offset-2 ring-offset-background scale-105 z-10'
              )}
              aria-label={fullDateLabel + hasBooking}
              aria-pressed={selected}
              tabIndex={0}
            >
              {dayNumber}
            </button>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div 
        className="flex flex-wrap gap-4 sm:gap-6 mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border"
        role="list"
        aria-label="Leyenda de estados"
      >
        <div className="flex items-center gap-2" role="listitem">
          <div 
            className="w-4 h-4 rounded-md bg-status-free-light border-2 border-status-free" 
            aria-hidden="true"
          />
          <span className="text-xs sm:text-sm text-muted-foreground">Libre</span>
        </div>
        <div className="flex items-center gap-2" role="listitem">
          <div 
            className="w-4 h-4 rounded-md bg-status-reserved-light border-2 border-status-reserved" 
            aria-hidden="true"
          />
          <span className="text-xs sm:text-sm text-muted-foreground">Reservado</span>
        </div>
        {isAdmin && (
        <div className="flex items-center gap-2" role="listitem">
          <div 
            className="w-4 h-4 rounded-md bg-status-occupied-light border-2 border-status-occupied" 
            aria-hidden="true"
          />
          <span className="text-xs sm:text-sm text-muted-foreground">Ocupado</span>
        </div>
        )}
      </div>
    </div>
  );
};
