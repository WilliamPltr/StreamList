
import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  date: Date | undefined;
  onSelect: (date: Date | undefined) => void;
  label?: string;
}

const DatePicker: React.FC<DatePickerProps> = ({ date, onSelect, label = 'Sélectionner une date' }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !date && "text-muted-foreground"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? (
            format(date, 'dd MMMM yyyy', { locale: fr })
          ) : (
            <span>{label}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={date}
          onSelect={onSelect}
          initialFocus
          locale={fr}
          className="p-3 pointer-events-auto"
        />
      </PopoverContent>
    </Popover>
  );
};

export default DatePicker;
