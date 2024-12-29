"use client";

import { useState, useEffect } from "react";
import { Input } from "./input";

interface EditableCellProps {
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  type?: string;
}

export function EditableCell({
  value,
  isEditing,
  onChange,
  type = "text",
}: EditableCellProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  if (!isEditing) {
    return (
      <span className="text-sm text-gray-900 dark:text-white">
        {localValue}
      </span>
    );
  }

  return (
    <Input
      type={type}
      value={localValue}
      onChange={(e) => {
        setLocalValue(e.target.value);
        onChange(e.target.value);
      }}
      className="h-8 w-full min-w-[100px]"
    />
  );
}
