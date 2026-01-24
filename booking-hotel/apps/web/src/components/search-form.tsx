"use client";

import * as React from "react";
import { format } from "date-fns";
import type { DateRange } from "react-day-picker";
import { CalendarIcon, Loader2, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { cn } from "@/lib/utils";
import { getDestinations } from "@/lib/data";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  destinationId: z.string().min(1, "目的地を選択してください"),
  dateRange: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .superRefine((value, ctx) => {
      if (!value.from || !value.to) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "チェックイン/アウト日を選択してください",
        });
      }
    }),
  adults: z.number().int().min(1, "1以上を入力してください").max(10),
  children: z.number().int().min(0).max(10),
  rooms: z.number().int().min(1).max(8),
});

type FormValues = z.infer<typeof schema>;

function toYmd(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function safeNumber(value: number, fallback: number) {
  return Number.isFinite(value) ? value : fallback;
}

export function SearchForm() {
  const router = useRouter();
  const [isPending, startTransition] = React.useTransition();

  const destinations = React.useMemo(() => getDestinations(), []);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      destinationId: "",
      dateRange: { from: undefined, to: undefined },
      adults: 2,
      children: 0,
      rooms: 1,
    },
    mode: "onBlur",
  });

  const onSubmit = (values: FormValues) => {
    const from = values.dateRange.from;
    const to = values.dateRange.to;
    if (!from || !to) return;

    const params = new URLSearchParams();
    params.set("destinationId", values.destinationId);
    params.set("checkIn", toYmd(from));
    params.set("checkOut", toYmd(to));
    params.set("adults", String(values.adults));
    params.set("children", String(values.children));
    params.set("rooms", String(values.rooms));

    startTransition(() => {
      router.push(`/search?${params.toString()}`);
    });
  };

  return (
    <Card className="p-5 sm:p-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="destinationId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>目的地</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="都市を選択" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {destinations.map((d) => (
                        <SelectItem key={d.id} value={d.id}>
                          {d.name} ({d.country})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dateRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>日付</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          type="button"
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !field.value?.from && "text-muted-foreground",
                          )}
                        >
                          <CalendarIcon className="mr-2 size-4" />
                          {field.value?.from && field.value?.to
                            ? `${format(field.value.from, "MMM d")} – ${format(
                                field.value.to,
                                "MMM d",
                              )}`
                            : "チェックイン / チェックアウト"}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="range"
                        selected={field.value as DateRange}
                        onSelect={(range) => field.onChange(range)}
                        numberOfMonths={2}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <FormField
              control={form.control}
              name="adults"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>大人</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={10}
                      value={field.value}
                      onChange={(e) => field.onChange(safeNumber(e.currentTarget.valueAsNumber, field.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="children"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>子供</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={10}
                      value={field.value}
                      onChange={(e) => field.onChange(safeNumber(e.currentTarget.valueAsNumber, field.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="rooms"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>部屋数</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      max={8}
                      value={field.value}
                      onChange={(e) => field.onChange(safeNumber(e.currentTarget.valueAsNumber, field.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button type="submit" size="lg" disabled={isPending} className="w-full">
            {isPending ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                検索中…
              </>
            ) : (
              <>
                <Search className="mr-2 size-4" />
                検索
              </>
            )}
          </Button>
        </form>
      </Form>
    </Card>
  );
}
