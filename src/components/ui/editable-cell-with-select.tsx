"use client";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type Option = {
  label: string;
  value: string;
};

interface EditableCellWithSelectProps {
  value: string;
  displayValue?: string;
  isEditing: boolean;
  type?: string;
  onChange: (value: string) => void;
  options?: Option[];
  isSelect?: boolean;
}

export function EditableCellWithSelect({
  value,
  displayValue,
  isEditing,
  type = "text",
  onChange,
  options,
  isSelect,
}: EditableCellWithSelectProps) {
  if (!isEditing) {
    if (isSelect && options) {
      const option = options.find((opt) => opt.value === value);
      return (
        <span className="text-sm dark:text-gray-100">
          {option?.label || displayValue || value}
        </span>
      );
    }
    return (
      <span className="text-sm dark:text-gray-100">
        {displayValue || value}
      </span>
    );
  }

  if (isSelect && options) {
    return (
      <Select defaultValue={value} onValueChange={onChange}>
        <SelectTrigger className="h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <Input
      type={type}
      defaultValue={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-8 w-full"
    />
  );
}
