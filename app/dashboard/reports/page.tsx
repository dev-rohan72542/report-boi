"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { MonthlyReports } from "@/components/monthly-reports"
import { OfflineIndicator } from "@/components/offline-indicator"

export default function ReportsPage() {
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<any[]>([])
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
      
      // Get all entries for comprehensive reporting
      const { data: entriesData } = await supabase
        .from("daily_entries")
        .select("*")
        .eq("user_id", user.id)
        .order("entry_date", { ascending: true })

      // Get user goals for comparison
      const { data: goalsData } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user.id)
        .eq("is_active", true)

      setEntries(entriesData || [])
      setGoals(goalsData || [])
    } catch (error) {
      console.error('Error loading reports:', error)
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
      <div className="max-w-7xl mx-auto p-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">মাসিক রিপোর্ট</h1>
          <p className="text-muted-foreground">বিস্তারিত বিশ্লেষণ ও কর্মক্ষমতার রিপোর্ট</p>
        </div>
        <MonthlyReports entries={entries} goals={goals} />
      </div>
    </div>
  )
}
