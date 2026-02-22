import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Moon, Clock, Calendar } from "lucide-react";

interface QuietHoursSettingsProps {
  enabled: boolean;
  startTime: string;
  endTime: string;
  days: string[];
  onUpdate: (settings: {
    quietHoursEnabled: boolean;
    quietHoursStart: string;
    quietHoursEnd: string;
    quietHoursDays: string[];
  }) => void;
  isLoading?: boolean;
}

const ALL_DAYS = [
  { value: "monday", label: "Mon" },
  { value: "tuesday", label: "Tue" },
  { value: "wednesday", label: "Wed" },
  { value: "thursday", label: "Thu" },
  { value: "friday", label: "Fri" },
  { value: "saturday", label: "Sat" },
  { value: "sunday", label: "Sun" },
];

const TIME_OPTIONS = [
  "00:00", "01:00", "02:00", "03:00", "04:00", "05:00",
  "06:00", "07:00", "08:00", "09:00", "10:00", "11:00",
  "12:00", "13:00", "14:00", "15:00", "16:00", "17:00",
  "18:00", "19:00", "20:00", "21:00", "22:00", "23:00",
];

export default function QuietHoursSettings({
  enabled,
  startTime,
  endTime,
  days,
  onUpdate,
  isLoading = false,
}: QuietHoursSettingsProps) {
  const [localEnabled, setLocalEnabled] = useState(enabled);
  const [localStart, setLocalStart] = useState(startTime);
  const [localEnd, setLocalEnd] = useState(endTime);
  const [localDays, setLocalDays] = useState<string[]>(days);

  useEffect(() => {
    setLocalEnabled(enabled);
    setLocalStart(startTime);
    setLocalEnd(endTime);
    setLocalDays(days);
  }, [enabled, startTime, endTime, days]);

  const handleToggleDay = (day: string) => {
    const newDays = localDays.includes(day)
      ? localDays.filter((d) => d !== day)
      : [...localDays, day];
    setLocalDays(newDays);
    onUpdate({
      quietHoursEnabled: localEnabled,
      quietHoursStart: localStart,
      quietHoursEnd: localEnd,
      quietHoursDays: newDays,
    });
  };

  const handleEnabledChange = (checked: boolean) => {
    setLocalEnabled(checked);
    onUpdate({
      quietHoursEnabled: checked,
      quietHoursStart: localStart,
      quietHoursEnd: localEnd,
      quietHoursDays: localDays,
    });
  };

  const handleStartChange = (value: string) => {
    setLocalStart(value);
    onUpdate({
      quietHoursEnabled: localEnabled,
      quietHoursStart: value,
      quietHoursEnd: localEnd,
      quietHoursDays: localDays,
    });
  };

  const handleEndChange = (value: string) => {
    setLocalEnd(value);
    onUpdate({
      quietHoursEnabled: localEnabled,
      quietHoursStart: localStart,
      quietHoursEnd: value,
      quietHoursDays: localDays,
    });
  };

  const formatTime = (time: string) => {
    const [hours] = time.split(":");
    const hour = parseInt(hours);
    if (hour === 0) return "12:00 AM";
    if (hour === 12) return "12:00 PM";
    if (hour > 12) return `${hour - 12}:00 PM`;
    return `${hour}:00 AM`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Moon className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold">Quiet Hours</h3>
            <p className="text-sm text-muted-foreground">
              Pause notifications during specific times
            </p>
          </div>
        </div>
        <Switch
          checked={localEnabled}
          onCheckedChange={handleEnabledChange}
          disabled={isLoading}
        />
      </div>

      {localEnabled && (
        <div className="space-y-6 pt-4 border-t">
          {/* Time Range */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-muted-foreground" />
              Time Range
            </div>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground mb-1 block">
                  Start Time
                </Label>
                <Select value={localStart} onValueChange={handleStartChange}>
                  <SelectTrigger>
                    <SelectValue>{formatTime(localStart)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {formatTime(time)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <span className="text-muted-foreground pt-5">to</span>
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground mb-1 block">
                  End Time
                </Label>
                <Select value={localEnd} onValueChange={handleEndChange}>
                  <SelectTrigger>
                    <SelectValue>{formatTime(localEnd)}</SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_OPTIONS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {formatTime(time)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Notifications will be paused from {formatTime(localStart)} to {formatTime(localEnd)}
            </p>
          </div>

          {/* Days Selection */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Active Days
            </div>
            <div className="flex flex-wrap gap-2">
              {ALL_DAYS.map((day) => (
                <Button
                  key={day.value}
                  variant={localDays.includes(day.value) ? "default" : "outline"}
                  size="sm"
                  onClick={() => handleToggleDay(day.value)}
                  className={
                    localDays.includes(day.value)
                      ? "bg-primary hover:bg-primary/90"
                      : ""
                  }
                >
                  {day.label}
                </Button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              Select which days quiet hours should be active
            </p>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-lg bg-muted/50 border">
            <div className="flex items-center gap-2 mb-2">
              <Moon className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Quiet Hours Preview</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Notifications will be paused from{" "}
              <span className="font-medium text-foreground">{formatTime(localStart)}</span> to{" "}
              <span className="font-medium text-foreground">{formatTime(localEnd)}</span> on{" "}
              {localDays.length === 7 ? (
                <span className="font-medium text-foreground">every day</span>
              ) : localDays.length === 0 ? (
                <span className="font-medium text-destructive">no days selected</span>
              ) : (
                <span className="font-medium text-foreground">
                  {localDays.map((d) => ALL_DAYS.find((day) => day.value === d)?.label).join(", ")}
                </span>
              )}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}
