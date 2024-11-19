import React, { useState, useCallback } from 'react';
import { DayPicker, DateRange } from 'react-day-picker';
import { addDays, differenceInDays, isWithinInterval, addBusinessDays, addMonths, startOfMonth } from 'date-fns';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useArrivalRules } from '../hooks/useArrivalRules';
import { getDayName } from '../utils/dateUtils';
import { bookingRules } from '../utils/bookingRules';
import 'react-day-picker/dist/style.css';

interface DateRangePickerProps {
  selected: DateRange | undefined;
  onSelect: (range: DateRange | undefined) => void;
  isExtension?: boolean;
}

export function DateRangePicker({ selected, onSelect, isExtension = false }: DateRangePickerProps) {
  const isLarge = useMediaQuery('(min-width: 1024px)');
  const isMedium = useMediaQuery('(min-width: 768px)');
  const { rules, loading } = useArrivalRules();
  const [selectingDeparture, setSelectingDeparture] = useState(false);
  const [month, setMonth] = useState<Date>(new Date());
  
  const numberOfMonths = isLarge ? 2 : isMedium ? 1 : 1;

  const handleDayClick = useCallback((day: Date | undefined) => {
    if (!day) {
      onSelect(undefined);
      setSelectingDeparture(false);
      return;
    }

    const clickedDayName = getDayName(day);

    // If clicking an arrival day, always start a new selection
    if (clickedDayName === rules.arrival_day) {
      onSelect({ from: day, to: undefined });
      setSelectingDeparture(true);

      // Only advance month if we're in single month view and selection is in last row
      if (numberOfMonths === 1) {
        const startOfNextMonth = startOfMonth(addMonths(month, 1));
        if (day > addDays(startOfNextMonth, -7)) {
          setMonth(startOfNextMonth);
        }
      }
      return;
    }

    // If we're selecting a departure day and have an arrival date
    if (selectingDeparture && selected?.from && clickedDayName === rules.departure_day && day > selected.from) {
      onSelect({ from: selected.from, to: day });
      setSelectingDeparture(false);
      return;
    }

    // Keep existing selection for invalid clicks
    onSelect(selected);
  }, [rules, selected, selectingDeparture, onSelect, month, numberOfMonths]);

  const isDateEnabled = useCallback((date: Date) => {
    const dayName = getDayName(date);
    const minDate = addBusinessDays(new Date(), 3);

    // Check if date is in the past or within 3 business days
    if (date < minDate) {
      return false;
    }

    // If we're selecting a departure date
    if (selectingDeparture && selected?.from) {
      return dayName === rules.departure_day && date > selected.from;
    }

    // Otherwise, only enable arrival days
    return dayName === rules.arrival_day;
  }, [rules, selected, selectingDeparture]);

  const modifiers = {
    arrival: (date: Date) => getDayName(date) === rules.arrival_day,
    departureAvailable: (date: Date) => 
      selectingDeparture && selected?.from && 
      getDayName(date) === rules.departure_day && 
      date > selected.from,
    selected: (date: Date) => 
      (selected?.from && date.getTime() === selected.from.getTime()) ||
      (selected?.to && date.getTime() === selected.to.getTime()),
    inRange: (date: Date) => 
      selected?.from && selected?.to && 
      isWithinInterval(date, { start: selected.from, end: selected.to })
  };

  const modifiersStyles = {
    arrival: {
      color: 'white',
      backgroundColor: '#065F46', // Green
      fontWeight: 'bold',
      borderRadius: '0'
    },
    departureAvailable: {
      color: 'white',
      backgroundColor: '#1E40AF', // Blue
      fontWeight: 'bold',
      borderRadius: '0'
    },
    selected: {
      color: 'white',
      fontWeight: 'bold',
      borderRadius: '0'
    },
    inRange: {
      color: 'white',
      backgroundColor: '#111827', // Black
      fontWeight: 'bold',
      borderRadius: '0'
    }
  };

  const formatDate = (date: Date) => {
    const formatter = new Intl.DateTimeFormat('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
    const parts = formatter.formatToParts(date);
    const month = parts.find(part => part.type === 'month')?.value;
    const day = parts.find(part => part.type === 'day')?.value;
    const year = parts.find(part => part.type === 'year')?.value;
    return `${month} ${day}${getOrdinalSuffix(parseInt(day || '0'))}, ${year}`;
  };

  const getOrdinalSuffix = (day: number) => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="overflow-x-auto">
        <style>
          {`
            .rdp-day {
              border-radius: 0 !important;
            }
            .rdp-day_selected {
              border-radius: 0 !important;
            }
            .rdp-day_selected:not([aria-selected="true"]) {
              background-color: #111827 !important;
              color: white;
            }
            .rdp-day[aria-selected="true"]:first-of-type {
              background-color: #111827 !important;
            }
            .rdp-day[aria-selected="true"]:last-of-type {
              background-color: #111827 !important;
            }
          `}
        </style>
        <DayPicker
          mode="single"
          selected={selected?.to || selected?.from}
          onSelect={handleDayClick}
          numberOfMonths={numberOfMonths}
          showOutsideDays
          disabled={date => !isDateEnabled(date)}
          modifiers={modifiers}
          modifiersStyles={modifiersStyles}
          fromDate={addBusinessDays(new Date(), 3)}
          month={month}
          onMonthChange={setMonth}
          styles={{
            months: { display: 'flex', gap: '1rem' },
            caption: { 
              color: '#1C1917',
              fontSize: '1rem',
              fontFamily: 'Cormorant, serif',
              marginBottom: '0.5rem'
            },
            head_cell: {
              color: '#78716C',
              fontSize: '0.875rem',
              fontFamily: 'Inter, sans-serif'
            },
            cell: {
              fontSize: '0.875rem',
              fontFamily: 'Inter, sans-serif'
            },
            nav_button: {
              color: '#064E3B'
            },
            day: {
              margin: '1px',
              color: '#374151',
              width: '40px',
              height: '40px'
            },
            day_disabled: {
              opacity: '0.35'
            }
          }}
        />
      </div>

      <div className="border-t border-stone-200 pt-6 space-y-4">
        <div className="bg-stone-50 rounded-lg p-4">
          <h3 className="font-display text-lg text-stone-900 mb-2">Stay Details</h3>
          {selected?.from ? (
            <div className="space-y-2 text-sm">
              <p>
                You may arrive {formatDate(selected.from)} from 3-6PM
              </p>
              {selected.to && (
                <p>
                  You may depart {formatDate(selected.to)} by 12PM Noon
                </p>
              )}
              {selected.to && (
                <p>
                  <span className="text-stone-600">Length:</span>{' '}
                  <span className="font-medium">
                    {differenceInDays(selected.to, selected.from) + 1} days
                  </span>
                </p>
              )}
            </div>
          ) : (
            <p className="text-stone-600 text-sm">
              Select your check-in date (highlighted in green)
            </p>
          )}
        </div>
        <div className="text-sm text-stone-600 space-y-1">
          <p>• Minimum stay: 7 days</p>
          <p>• Check-in: {rules.arrival_day.charAt(0).toUpperCase() + rules.arrival_day.slice(1)} at 3 PM</p>
          <p>• Check-out: {rules.departure_day.charAt(0).toUpperCase() + rules.departure_day.slice(1)} at 12 PM</p>
          {!isExtension && (
            <p className="text-emerald-700">• {bookingRules.minAdvance}</p>
          )}
        </div>
      </div>
    </div>
  );
}