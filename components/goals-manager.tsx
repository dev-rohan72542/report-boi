"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Plus, Target, Calendar, Trash2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface GoalsManagerProps {
  goals: any[]
  userId: string
}

export function GoalsManager({ goals: initialGoals, userId }: GoalsManagerProps) {
  const { toast } = useToast()
  const supabase = createClient()
  const [goals, setGoals] = useState(initialGoals)
  const [isLoading, setIsLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  const [formData, setFormData] = useState({
    category: "",
    target_value: "",
    target_period: "daily",
    start_date: new Date().toISOString().split("T")[0],
  })

  const categories = [
    { value: "quran_study", label: "কুরআন অধ্যয়ন (মিনিট)" },
    { value: "prayers_in_congregation", label: "নামাজ (জামাতে)" },
    { value: "exercise", label: "ব্যায়াম (সংখ্যা)" },
    { value: "skill_development", label: "দক্ষতা উন্নয়ন (মিনিট)" },
    { value: "work_hours", label: "কাজের সময় (মিনিট)" },
    { value: "communication", label: "যোগাযোগ (সংখ্যা)" },
    { value: "distribution", label: "বিতরণ (সংখ্যা)" },
    { value: "self_development", label: "ব্যক্তিগত উন্নয়ন (মিনিট)" },
  ]

  const periods = [
    { value: "daily", label: "দৈনিক" },
    { value: "weekly", label: "সাপ্তাহিক" },
    { value: "monthly", label: "মাসিক" },
    { value: "yearly", label: "বার্ষিক" },
  ]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("goals")
        .insert({
          user_id: userId,
          category: formData.category,
          target_value: Number.parseInt(formData.target_value),
          target_period: formData.target_period,
          start_date: formData.start_date,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      setGoals([data, ...goals])
      setFormData({
        category: "",
        target_value: "",
        target_period: "daily",
        start_date: new Date().toISOString().split("T")[0],
      })
      setShowForm(false)

      toast({
        title: "লক্ষ্য যোগ করা হয়েছে!",
        description: "নতুন লক্ষ্য সফলভাবে তৈরি করা হয়েছে।",
      })
    } catch (error) {
      console.error("Error creating goal:", error)
      toast({
        title: "ত্রুটি!",
        description: "লক্ষ্য তৈরিতে সমস্যা হয়েছে।",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (goalId: string) => {
    try {
      const { error } = await supabase.from("goals").update({ is_active: false }).eq("id", goalId)

      if (error) throw error

      setGoals(goals.filter((goal) => goal.id !== goalId))

      toast({
        title: "লক্ষ্য মুছে ফেলা হয়েছে!",
        description: "লক্ষ্য সফলভাবে মুছে ফেলা হয়েছে।",
      })
    } catch (error) {
      console.error("Error deleting goal:", error)
      toast({
        title: "ত্রুটি!",
        description: "লক্ষ্য মুছতে সমস্যা হয়েছে।",
        variant: "destructive",
      })
    }
  }

  const getCategoryLabel = (category: string) => {
    return categories.find((cat) => cat.value === category)?.label || category
  }

  const getPeriodLabel = (period: string) => {
    return periods.find((p) => p.value === period)?.label || period
  }

  return (
    <div className="space-y-6">
      {/* Add Goal Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">আপনার লক্ষ্যসমূহ</h2>
        <Button onClick={() => setShowForm(!showForm)}>
          <Plus className="h-4 w-4 mr-2" />
          নতুন লক্ষ্য
        </Button>
      </div>

      {/* Add Goal Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle>নতুন লক্ষ্য যোগ করুন</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">বিভাগ</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="বিভাগ নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_value">লক্ষ্যমাত্রা</Label>
                  <Input
                    id="target_value"
                    type="number"
                    min="1"
                    value={formData.target_value}
                    onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                    placeholder="সংখ্যা লিখুন"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="target_period">সময়কাল</Label>
                  <Select
                    value={formData.target_period}
                    onValueChange={(value) => setFormData({ ...formData, target_period: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {periods.map((period) => (
                        <SelectItem key={period.value} value={period.value}>
                          {period.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start_date">শুরুর তারিখ</Label>
                  <Input
                    id="start_date"
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "যোগ করা হচ্ছে..." : "লক্ষ্য যোগ করুন"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                  বাতিল
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Goals List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {goals.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Target className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">কোনো লক্ষ্য নেই</h3>
              <p className="text-muted-foreground text-center mb-4">
                আপনার প্রথম লক্ষ্য তৈরি করুন এবং অগ্রগতি ট্র্যাক করা শুরু করুন।
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                প্রথম লক্ষ্য যোগ করুন
              </Button>
            </CardContent>
          </Card>
        ) : (
          goals.map((goal) => (
            <Card key={goal.id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{getCategoryLabel(goal.category)}</CardTitle>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="secondary">{getPeriodLabel(goal.target_period)}</Badge>
                      <Badge variant="outline">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(goal.start_date).toLocaleDateString("bn-BD")}
                      </Badge>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(goal.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">{goal.target_value}</span>
                    <span className="text-sm text-muted-foreground">
                      {goal.target_period === "daily"
                        ? "প্রতিদিন"
                        : goal.target_period === "weekly"
                          ? "প্রতি সপ্তাহে"
                          : goal.target_period === "monthly"
                            ? "প্রতি মাসে"
                            : "প্রতি বছরে"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {goal.category.includes("quran")
                      ? "কুরআন অধ্যয়নে আরও সময় দিন"
                      : goal.category.includes("prayer")
                        ? "নিয়মিত জামাতে নামাজ পড়ুন"
                        : goal.category.includes("exercise")
                          ? "শারীরিক সুস্থতার জন্য ব্যায়াম করুন"
                          : "আপনার লক্ষ্য অর্জনে নিয়মিত অনুশীলন করুন"}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
