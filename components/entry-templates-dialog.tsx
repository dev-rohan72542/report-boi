"use client"

import { useState, useEffect } from "react"
import { templateService, EntryTemplate } from "@/lib/services/template-service"
import { analyticsService } from "@/lib/services/analytics-service"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Copy, Trash2, Plus, TrendingUp, RotateCcw } from "lucide-react"
import { Partial } from "@supabase/supabase-js"
import type { DailyEntryData } from "@/lib/services/hybrid-data-service"

interface TemplateDialogProps {
  onApplyTemplate: (templateData: Partial<DailyEntryData>) => void
  onSaveTemplate: (templateData: Partial<DailyEntryData>) => void
  currentFormData: Partial<DailyEntryData>
}

export function EntryTemplatesDialog({
  onApplyTemplate,
  onSaveTemplate,
  currentFormData
}: TemplateDialogProps) {
  const { toast } = useToast()
  const [isOpen, setIsOpen] = useState(false)
  const [templates, setTemplates] = useState<EntryTemplate[]>([])
  const [newTemplateName, setNewTemplateName] = useState("")
  const [yesterdayData, setYesterdayData] = useState<Partial<DailyEntryData> | null>(null)
  const [averageData, setAverageData] = useState<Partial<DailyEntryData> | null>(null)
  const [halfAverageData, setHalfAverageData] = useState<Partial<DailyEntryData> | null>(null)

  useEffect(() => {
    if (isOpen) {
      loadTemplates()
    }
  }, [isOpen])

  const loadTemplates = async () => {
    try {
      const [savedTemplates, yesterday, average, halfAverage] = await Promise.all([
        templateService.getTemplates(),
        templateService.getYesterdayTemplate(),
        templateService.getAverageTemplate(),
        templateService.getHalfAverageTemplate()
      ])

      setTemplates(savedTemplates)
      setYesterdayData(yesterday)
      setAverageData(average)
      setHalfAverageData(halfAverage)
    } catch (error) {
      console.error('[v0] Error loading templates:', error)
      toast({
        title: "ত্রুটি",
        description: "টেমপ্লেট লোড করতে ব্যর্থ",
        variant: "destructive"
      })
    }
  }

  const handleApplyYesterday = () => {
    if (yesterdayData) {
      onApplyTemplate(yesterdayData)
      toast({
        title: "সফল",
        description: "গতকালের এন্ট্রি প্রয়োগ করা হয়েছে"
      })
      setIsOpen(false)
    }
  }

  const handleApplyAverage = () => {
    if (averageData) {
      onApplyTemplate(averageData)
      toast({
        title: "সফল",
        description: "গড় মান প্রয়োগ করা হয়েছে"
      })
      setIsOpen(false)
    }
  }

  const handleApplyHalfAverage = () => {
    if (halfAverageData) {
      onApplyTemplate(halfAverageData)
      toast({
        title: "সফল",
        description: "অর্ধেক গড় প্রয়োগ করা হয়েছে"
      })
      setIsOpen(false)
    }
  }

  const handleSaveAsTemplate = async () => {
    if (!newTemplateName.trim()) {
      toast({
        title: "ত্রুটি",
        description: "টেমপ্লেট নাম প্রবেশ করুন",
        variant: "destructive"
      })
      return
    }

    try {
      await templateService.saveTemplate(newTemplateName, currentFormData)
      setNewTemplateName("")
      toast({
        title: "সফল",
        description: "টেমপ্লেট সংরক্ষণ করা হয়েছে"
      })
      loadTemplates()
    } catch (error) {
      console.error('[v0] Error saving template:', error)
      toast({
        title: "ত্রুটি",
        description: "টেমপ্লেট সংরক্ষণ করতে ব্যর্থ",
        variant: "destructive"
      })
    }
  }

  const handleApplySavedTemplate = (template: EntryTemplate) => {
    onApplyTemplate(template.data)
    toast({
      title: "সফল",
      description: `"${template.name}" টেমপ্লেট প্রয়োগ করা হয়েছে`
    })
    setIsOpen(false)
  }

  const handleDeleteTemplate = async (id: string) => {
    try {
      await templateService.deleteTemplate(id)
      toast({
        title: "সফল",
        description: "টেমপ্লেট মুছে ফেলা হয়েছে"
      })
      loadTemplates()
    } catch (error) {
      console.error('[v0] Error deleting template:', error)
      toast({
        title: "ত্রুটি",
        description: "টেমপ্লেট মুছতে ব্যর্থ",
        variant: "destructive"
      })
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Copy className="mr-2 h-4 w-4" />
          টেমপ্লেট
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>এন্ট্রি টেমপ্লেট</DialogTitle>
          <DialogDescription>
            দ্রুত এন্ট্রি পূরণের জন্য টেমপ্লেট ব্যবহার করুন
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Quick Actions */}
          <div className="space-y-2">
            <h3 className="text-sm font-medium">দ্রুত ক্রিয়া</h3>
            
            {yesterdayData && (
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={handleApplyYesterday}
              >
                <RotateCcw className="mr-2 h-4 w-4" />
                গতকালের মতো
              </Button>
            )}

            {averageData && (
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={handleApplyAverage}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                গড় মান ব্যবহার করুন
              </Button>
            )}

            {halfAverageData && (
              <Button
                variant="secondary"
                className="w-full justify-start"
                onClick={handleApplyHalfAverage}
              >
                <TrendingUp className="mr-2 h-4 w-4" />
                অর্ধেক গড় ব্যবহার করুন
              </Button>
            )}
          </div>

          {/* Save New Template */}
          <div className="space-y-2 border-t pt-4">
            <h3 className="text-sm font-medium">নতুন টেমপ্লেট সংরক্ষণ করুন</h3>
            <div className="flex gap-2">
              <Input
                placeholder="টেমপ্লেট নাম"
                value={newTemplateName}
                onChange={(e) => setNewTemplateName(e.target.value)}
                className="flex-1"
              />
              <Button
                size="sm"
                onClick={handleSaveAsTemplate}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Saved Templates */}
          {templates.length > 0 && (
            <div className="space-y-2 border-t pt-4">
              <h3 className="text-sm font-medium">সংরক্ষিত টেমপ্লেট</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="flex items-center justify-between p-2 rounded-md border hover:bg-accent"
                  >
                    <button
                      onClick={() => handleApplySavedTemplate(template)}
                      className="flex-1 text-left"
                    >
                      <p className="text-sm font-medium">{template.name}</p>
                      {template.description && (
                        <p className="text-xs text-muted-foreground">{template.description}</p>
                      )}
                    </button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
