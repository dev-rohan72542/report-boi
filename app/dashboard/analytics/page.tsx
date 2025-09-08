"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ProgressDashboard } from "@/components/progress-dashboard"
import { OfflineIndicator } from "@/components/offline-indicator"

export default function AnalyticsPage() {
  const [user, setUser] = useState<any>(null)
  const [entries, setEntries] = useState<any[]>([])
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
      
      // Get last 30 days of entries
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const { data: entriesData } = await supabase
        .from("daily_entries")
        .select("*")
        .eq("user_id", user.id)
        .gte("entry_date", thirtyDaysAgo.toISOString().split("T")[0])
        .order("entry_date", { ascending: true })

      setEntries(entriesData || [])
    } catch (error) {
      console.error('Error loading analytics:', error)
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
          <h1 className="text-3xl font-bold text-foreground mb-2">অগ্রগতি বিশ্লেষণ</h1>
          <p className="text-muted-foreground">গত ৩০ দিনের কার্যক্রমের বিস্তারিত বিশ্লেষণ</p>
        </div>
        <ProgressDashboard entries={entries} />
      </div>
    </div>
  )
}
