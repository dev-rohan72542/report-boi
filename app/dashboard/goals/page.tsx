"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { GoalsManager } from "@/components/goals-manager"
import { OfflineIndicator } from "@/components/offline-indicator"

export default function GoalsPage() {
  const [user, setUser] = useState<any>(null)
  const [goals, setGoals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    checkUser()
  }, [])

  const checkUser = async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()
      
      if (error || !user) {
        window.location.href = '/auth/login'
        return
      }

      setUser(user)
      
      // Get user's active goals
      const { data: goalsData } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })

      setGoals(goalsData || [])
    } catch (error) {
      console.error('Error loading goals:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">লোড হচ্ছে...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <OfflineIndicator />
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">লক্ষ্য নির্ধারণ</h1>
          <p className="text-muted-foreground">আপনার ব্যক্তিগত ও আধ্যাত্মিক লক্ষ্য নির্ধারণ ও ট্র্যাক করুন</p>
        </div>
        <GoalsManager goals={goals} userId={user.id} />
      </div>
    </div>
  )
}
