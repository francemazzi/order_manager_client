"use client";

import { Input } from "./input";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "./select";

export interface EditableCellWithSelectProps {
  value: string;
  displayValue?: string;
  isEditing: boolean;
  isSelect?: boolean;
  type?: string;
  options?: { label: string; value: string }[];
  onChange: (value: string) => void;
}

export function EditableCellWithSelect({
  value,
  displayValue,
  isEditing,
  isSelect,
  type = "text",
  options = [],
  onChange,
}: EditableCellWithSelectProps) {
  if (isEditing) {
    if (isSelect) {
      return (
        <Select value={value} onValueChange={onChange}>
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
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-8"
      />
    );
  }
  return <span>{displayValue || value}</span>;
}
