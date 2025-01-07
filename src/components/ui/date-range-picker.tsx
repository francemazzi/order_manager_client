"use client";

import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { DateRange } from "react-day-picker";
import { it } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface DatePickerWithRangeProps {
  date: DateRange | undefined;
  onDateChange: (date: DateRange | undefined) => void;
}

export function DatePickerWithRange({
  date,
  onDateChange,
}: DatePickerWithRangeProps) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="grid gap-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-[300px] justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "dd/MM/yyyy", { locale: it })} -{" "}
                  {format(date.to, "dd/MM/yyyy", { locale: it })}
                </>
              ) : (
                format(date.from, "dd/MM/yyyy", { locale: it })
              )
            ) : (
              <span>Seleziona un periodo</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(newDate) => {
              onDateChange(newDate);
              if (newDate?.from && newDate?.to) {
                setOpen(false);
              }
            }}
            numberOfMonths={2}
            locale={it}
            showOutsideDays={false}
            className="dark:bg-zinc-950 dark:text-white"
            classNames={{
              months:
                "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
              month: "space-y-4",
              caption: "flex justify-center pt-1 relative items-center text-sm",
              caption_label: "text-sm font-medium",
              nav: "space-x-1 flex items-center",
              nav_button: "h-7 w-7 bg-transparent p-0 hover:opacity-100",
              nav_button_previous: "absolute left-1",
              nav_button_next: "absolute right-1",
              table: "w-full border-collapse space-y-1",
              head_row: "flex",
              head_cell:
                "rounded-md w-9 font-normal text-[0.8rem] dark:text-zinc-400",
              row: "flex w-full mt-2",
              cell: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20 [&:has([aria-selected])]:bg-zinc-100 dark:[&:has([aria-selected])]:bg-zinc-800 first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md",
              day: "h-9 w-9 p-0 font-normal hover:bg-zinc-100 dark:hover:bg-zinc-800 aria-selected:opacity-100",
              day_range_start:
                "rounded-l-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900",
              day_range_end:
                "rounded-r-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900",
              day_range_middle: "bg-zinc-100 dark:bg-zinc-800",
              day_selected:
                "bg-zinc-900 text-white hover:bg-zinc-900 hover:text-white focus:bg-zinc-900 focus:text-white dark:bg-white dark:text-zinc-900",
              day_today:
                "bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-white",
              day_outside: "text-zinc-400 opacity-50 dark:text-zinc-500",
              day_disabled: "text-zinc-400 opacity-50 dark:text-zinc-500",
              day_hidden: "invisible",
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
