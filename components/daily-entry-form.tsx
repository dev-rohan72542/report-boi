"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Save, BookOpen, Briefcase, Dumbbell, Users, Gift, FileText, Heart, ChevronDown, ChevronUp } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// --- Helper Components moved outside ---

const InputField = ({
  label,
  field,
  unit = "",
  type = "number",
  value,
  onChange,
}: {
  label: string
  field: string
  unit?: string
  type?: string
  value: number
  onChange: (field: string, value: string) => void
}) => {
  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === '0') {
      e.target.select();
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={field} className="text-sm font-medium">
        {label} {unit && <span className="text-muted-foreground">({unit})</span>}
      </Label>
      <Input
        id={field}
        type={type}
        min="0"
        value={value}
        onChange={(e) => onChange(field, e.target.value)}
        onFocus={handleFocus}
        className="w-full"
        inputMode="numeric"
        pattern="[0-9]*"
      />
    </div>
  )
}

const FormSection = ({
  title,
  icon: Icon,
  children,
  sectionKey,
  isOpen,
  onOpenChange,
}: {
  title: string
  icon: any
  children: React.ReactNode
  sectionKey: string
  isOpen: boolean
  onOpenChange: (key: string, open: boolean) => void
}) => (
  <Collapsible
    open={isOpen}
    onOpenChange={(open) => onOpenChange(sectionKey, open)}
  >
    <Card className="mb-4">
      <CollapsibleTrigger asChild>
        <CardHeader className="pb-4 cursor-pointer hover:bg-accent/50 transition-colors">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center gap-2">
              <Icon className="h-5 w-5 text-primary" />
              {title}
            </div>
            {isOpen ? (
              <ChevronUp className="h-4 w-4 md:hidden" />
            ) : (
              <ChevronDown className="h-4 w-4 md:hidden" />
            )}
          </CardTitle>
        </CardHeader>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">{children}</div>
        </CardContent>
      </CollapsibleContent>
    </Card>
  </Collapsible>
)

// --- Main Component ---

interface DailyEntryFormProps {
  initialData?: any
  userId: string
}

export function DailyEntryForm({ initialData, userId }: DailyEntryFormProps) {
  const { toast } = useToast()
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    islamic: true,
    work: false,
    skills: false,
    exercise: false,
    religious: false,
    communication: false,
    distribution: false,
    responsibilities: false,
    personal: false,
  })

  const [formData, setFormData] = useState({
    quran_memorization: 0,
    quran_study: 0,
    hadith_study: 0,
    islamic_literature: 0,
    other_literature: 0,
    online_work: 0,
    offline_work: 0,
    skill_lessons: 0,
    skill_practice: 0,
    skill_projects: 0,
    pull_ups: 0,
    push_ups: 0,
    squats: 0,
    prayers_in_congregation: 0,
    classes_attended: 0,
    communication_members: 0,
    communication_companions: 0,
    communication_workers: 0,
    communication_relations: 0,
    communication_friends: 0,
    communication_talented_students: 0,
    communication_well_wishers: 0,
    communication_mahram: 0,
    literature_distribution: 0,
    magazine_distribution: 0,
    sticker_card_distribution: 0,
    gift_distribution: 0,
    dawati_responsibilities: 0,
    other_responsibilities: 0,
    newspaper_reading: 0,
    self_criticism: 0,
  })

  useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({ ...prev, ...initialData }))
    }
  }, [initialData])

  const handleInputChange = (field: string, value: string) => {
    const numValue = Number.parseInt(value) || 0
    setFormData((prev) => ({ ...prev, [field]: numValue }))
  }

  const handleSectionToggle = (key: string, open: boolean) => {
    setOpenSections((prev) => ({ ...prev, [key]: open }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const today = new Date().toISOString().split("T")[0]
      const { error } = await supabase.from("daily_entries").upsert(
        {
          user_id: userId,
          entry_date: today,
          ...formData,
        },
        {
          onConflict: "user_id,entry_date",
        },
      )
      if (error) throw error
      toast({
        title: "সফলভাবে সংরক্ষিত!",
        description: "আজকের এন্ট্রি সংরক্ষণ করা হয়েছে।",
      })
    } catch (error) {
      console.error("Error saving entry:", error)
      toast({
        title: "ত্রুটি!",
        description: "এন্ট্রি সংরক্ষণে সমস্যা হয়েছে।",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <FormSection 
        title="কুরআন ও ইসলামী অধ্যয়ন" 
        icon={BookOpen} 
        sectionKey="islamic"
        isOpen={openSections.islamic}
        onOpenChange={handleSectionToggle}
      >
        <InputField label="কুরআন—মুখস্থ" field="quran_memorization" unit="মিনিট" value={formData.quran_memorization} onChange={handleInputChange} />
        <InputField label="কুরআন—অধ্যয়ন" field="quran_study" unit="মিনিট" value={formData.quran_study} onChange={handleInputChange} />
        <InputField label="হাদিস" field="hadith_study" unit="মিনিট" value={formData.hadith_study} onChange={handleInputChange} />
        <InputField label="সাহিত্য—ইসলামী" field="islamic_literature" unit="মিনিট" value={formData.islamic_literature} onChange={handleInputChange} />
        <InputField label="সাহিত্য—অন্যান্য" field="other_literature" unit="মিনিট" value={formData.other_literature} onChange={handleInputChange} />
      </FormSection>

      <FormSection 
        title="কর্মঘণ্টা" 
        icon={Briefcase} 
        sectionKey="work"
        isOpen={openSections.work}
        onOpenChange={handleSectionToggle}
      >
        <InputField label="কর্মঘণ্টা—অনলাইন" field="online_work" unit="মিনিট" value={formData.online_work} onChange={handleInputChange} />
        <InputField label="কর্মঘণ্টা—অফলাইন" field="offline_work" unit="মিনিট" value={formData.offline_work} onChange={handleInputChange} />
      </FormSection>

      <FormSection 
        title="দক্ষতা উন্নয়ন" 
        icon={BookOpen} 
        sectionKey="skills"
        isOpen={openSections.skills}
        onOpenChange={handleSectionToggle}
      >
        <InputField label="দক্ষতা—লেসন" field="skill_lessons" unit="মিনিট" value={formData.skill_lessons} onChange={handleInputChange} />
        <InputField label="দক্ষতা—প্র্যাকটিস" field="skill_practice" unit="মিনিট" value={formData.skill_practice} onChange={handleInputChange} />
        <InputField label="দক্ষতা—প্রজেক্ট" field="skill_projects" unit="মিনিট" value={formData.skill_projects} onChange={handleInputChange} />
      </FormSection>

      <FormSection 
        title="শারীরিক ব্যায়াম" 
        icon={Dumbbell} 
        sectionKey="exercise"
        isOpen={openSections.exercise}
        onOpenChange={handleSectionToggle}
      >
        <InputField label="পুল-আপ" field="pull_ups" unit="সংখ্যা" value={formData.pull_ups} onChange={handleInputChange} />
        <InputField label="পুশ-আপ" field="push_ups" unit="সংখ্যা" value={formData.push_ups} onChange={handleInputChange} />
        <InputField label="স্কোয়াট" field="squats" unit="সংখ্যা" value={formData.squats} onChange={handleInputChange} />
      </FormSection>

      <FormSection 
        title="ধর্মীয় অনুশীলন" 
        icon={Heart} 
        sectionKey="religious"
        isOpen={openSections.religious}
        onOpenChange={handleSectionToggle}
      >
        <InputField label="নামাজ (জামাতে)" field="prayers_in_congregation" unit="সংখ্যা" value={formData.prayers_in_congregation} onChange={handleInputChange} />
        <InputField label="ক্লাস" field="classes_attended" unit="সংখ্যা" value={formData.classes_attended} onChange={handleInputChange} />
      </FormSection>

      <FormSection 
        title="যোগাযোগ" 
        icon={Users} 
        sectionKey="communication"
        isOpen={openSections.communication}
        onOpenChange={handleSectionToggle}
      >
        <InputField label="যোগাযোগ—সদস্য" field="communication_members" unit="সংখ্যা" value={formData.communication_members} onChange={handleInputChange} />
        <InputField label="যোগাযোগ—সাথী" field="communication_companions" unit="সংখ্যা" value={formData.communication_companions} onChange={handleInputChange} />
        <InputField label="যোগাযোগ—কর্মী" field="communication_workers" unit="সংখ্যা" value={formData.communication_workers} onChange={handleInputChange} />
        <InputField label="যোগাযোগ—সম্পর্ক" field="communication_relations" unit="সংখ্যা" value={formData.communication_relations} onChange={handleInputChange} />
        <InputField label="যোগাযোগ—বন্ধু" field="communication_friends" unit="সংখ্যা" value={formData.communication_friends} onChange={handleInputChange} />
        <InputField label="যোগাযোগ—মেধাবী ছাত্র" field="communication_talented_students" unit="সংখ্যা" value={formData.communication_talented_students} onChange={handleInputChange} />
        <InputField label="যোগাযোগ—শুভাকাঙ্ক্ষী" field="communication_well_wishers" unit="সংখ্যা" value={formData.communication_well_wishers} onChange={handleInputChange} />
        <InputField label="যোগাযোগ—মুহররমা" field="communication_mahram" unit="সংখ্যা" value={formData.communication_mahram} onChange={handleInputChange} />
      </FormSection>

      <FormSection 
        title="বিতরণ কার্যক্রম" 
        icon={Gift} 
        sectionKey="distribution"
        isOpen={openSections.distribution}
        onOpenChange={handleSectionToggle}
      >
        <InputField label="বিতরণ—সাহিত্য" field="literature_distribution" unit="সংখ্যা" value={formData.literature_distribution} onChange={handleInputChange} />
        <InputField label="বিতরণ—ম্যাগাজিন" field="magazine_distribution" unit="সংখ্যা" value={formData.magazine_distribution} onChange={handleInputChange} />
        <InputField label="বিতরণ—স্টিকার/কার্ড" field="sticker_card_distribution" unit="সংখ্যা" value={formData.sticker_card_distribution} onChange={handleInputChange} />
        <InputField label="বিতরণ—উপহার" field="gift_distribution" unit="সংখ্যা" value={formData.gift_distribution} onChange={handleInputChange} />
      </FormSection>

      <FormSection 
        title="দায়িত্ব" 
        icon={FileText} 
        sectionKey="responsibilities"
        isOpen={openSections.responsibilities}
        onOpenChange={handleSectionToggle}
      >
        <InputField label="দায়িত্ব—দাওয়াতি" field="dawati_responsibilities" unit="মিনিট" value={formData.dawati_responsibilities} onChange={handleInputChange} />
        <InputField label="দায়িত্ব—অন্যান্য" field="other_responsibilities" unit="মিনিট" value={formData.other_responsibilities} onChange={handleInputChange} />
      </FormSection>

      <FormSection 
        title="ব্যক্তিগত উন্নয়ন" 
        icon={BookOpen} 
        sectionKey="personal"
        isOpen={openSections.personal}
        onOpenChange={handleSectionToggle}
      >
        <InputField label="পত্রিকা পাঠ" field="newspaper_reading" unit="মিনিট" value={formData.newspaper_reading} onChange={handleInputChange} />
        <InputField label="আত্ম-সমালোচনা" field="self_criticism" unit="মিনিট" value={formData.self_criticism} onChange={handleInputChange} />
      </FormSection>

      <div className="sticky bottom-4 bg-background/95 backdrop-blur-sm border rounded-lg p-4 md:static md:bg-transparent md:backdrop-blur-none md:border-none md:p-0">
        <Button type="submit" disabled={isLoading} size="lg" className="w-full md:w-auto md:min-w-32">
          {isLoading ? (
            "সংরক্ষণ হচ্ছে..."
          ) : (
            <>
              <Save className="h-4 w-4 mr-2" />
              সংরক্ষণ করুন
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
