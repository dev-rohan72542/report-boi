"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Minus, Plus } from "lucide-react"
import { useState } from "react"

interface QuickNumberInputProps {
  label: string
  field: string
  unit?: string
  value: number
  onChange: (field: string, value: string) => void
  min?: number
  max?: number
  step?: number
}

export function QuickNumberInput({
  label,
  field,
  unit = "",
  value,
  onChange,
  min = 0,
  max = 999,
  step = 1,
}: QuickNumberInputProps) {
  const handleIncrement = () => {
    const newValue = Math.min(value + step, max)
    onChange(field, newValue.toString())
  }

  const handleDecrement = () => {
    const newValue = Math.max(value - step, min)
    onChange(field, newValue.toString())
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value
    if (newValue === "") {
      onChange(field, "0")
      return
    }
    const numValue = parseInt(newValue, 10)
    if (!isNaN(numValue)) {
      const clamped = Math.max(min, Math.min(numValue, max))
      onChange(field, clamped.toString())
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor={field} className="text-sm font-medium">
        {label} {unit && <span className="text-muted-foreground">({unit})</span>}
      </Label>
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleDecrement}
          className="h-10 w-10"
          disabled={value <= min}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <Input
          id={field}
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={handleChange}
          className="flex-1 text-center text-lg font-semibold"
          inputMode="numeric"
          pattern="[0-9]*"
        />
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={handleIncrement}
          className="h-10 w-10"
          disabled={value >= max}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
