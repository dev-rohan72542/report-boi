"use client"

import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"

interface ToggleFieldProps {
  label: string
  field: string
  value: boolean
  onChange: (field: string, value: boolean) => void
}

export function ToggleField({
  label,
  field,
  value,
  onChange,
}: ToggleFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={field} className="text-sm font-medium">
        {label}
      </Label>
      <Button
        type="button"
        id={field}
        onClick={() => onChange(field, !value)}
        variant={value ? "default" : "outline"}
        className="w-full justify-start"
        size="lg"
      >
        <Check className={`mr-2 h-4 w-4 ${value ? "" : "opacity-0"}`} />
        {value ? "সম্পন্ন" : "সম্পন্ন নয়"}
      </Button>
    </div>
  )
}
