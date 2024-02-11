"use client";

import * as React from "react";
import { differenceInDays, format } from "date-fns";
import { Calendar as CalendarIcon, X } from "lucide-react";
import { DateRange } from "react-day-picker";
import { toast } from "sonner";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";

export default function DateRangePicker({
    className,
    handleDateChange,
}: React.HTMLAttributes<HTMLDivElement> & {
    handleDateChange: (dateRange: DateRange | undefined) => void;
}) {
    const [date, setDate] = React.useState<DateRange | undefined>();
    const [isPopoverOpen, setIsPopoverOpen] = React.useState(false);

    return (
        <div className={cn("grid gap-2", className)}>
            <Popover open={isPopoverOpen}>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-[300px] justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                        )}
                        onClick={() => setIsPopoverOpen(true)}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date?.from ? (
                            date.to ? (
                                <>
                                    {format(date.from, "LLL dd, y")} -{" "}
                                    {format(date.to, "LLL dd, y")}
                                    <X
                                        className="ml-auto h-4 w-4"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setDate(undefined);
                                            handleDateChange(undefined);
                                            setIsPopoverOpen(false);
                                        }}
                                    />
                                </>
                            ) : (
                                format(date.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        captionLayout="dropdown-buttons"
                        fromYear={2013}
                        toYear={new Date().getFullYear() + 1}
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={(newDate) => {
                            if (
                                newDate &&
                                newDate.from &&
                                newDate.to &&
                                differenceInDays(newDate.to, newDate.from) > 1825 // 5 years
                            ) {
                                toast.error(
                                    "Date range cannot exceed 5 years"
                                );
                            } else {
                                setDate(newDate);
                                handleDateChange(newDate);
                                if (newDate && newDate.from && newDate.to) {
                                    setIsPopoverOpen(false);
                                }
                            }
                        }}
                        numberOfMonths={2}
                        disabled={[
                            {
                                before: new Date(2013, 0, 1),
                                after: new Date(),
                            },
                        ]}
                    />
                </PopoverContent>
            </Popover>
        </div>
    );
}
