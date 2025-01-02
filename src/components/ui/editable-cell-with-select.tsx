"use client";

import { Input } from "./input";

export interface EditableCellWithSelectProps {
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  type?: string;
  onClick?: (e: React.MouseEvent) => void;
}

export function EditableCellWithSelect({
  value,
  isEditing,
  onChange,
  type = "text",
  onClick,
}: EditableCellWithSelectProps) {
  const displayValue = value || "";

  if (isEditing) {
    return (
      <Input
        type={type}
        value={displayValue}
        onChange={(e) => onChange(e.target.value)}
        onClick={onClick}
      />
    );
  }

  return <div onClick={onClick}>{displayValue}</div>;
}
