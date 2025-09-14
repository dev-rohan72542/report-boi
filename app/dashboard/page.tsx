"use client"

import { useEffect, useState } from "react"
import { DailyEntryForm } from "@/components/daily-entry-form"
import { OfflineIndicator } from "@/components/offline-indicator"
import { HybridDataService } from "@/lib/services/hybrid-data-service"
import { User } from "@supabase/supabase-js"

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [todayEntry, setTodayEntry] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const dataService = new HybridDataService()

  useEffect(() => {
    const loadDashboardData = async () => {
      if (typeof window === 'undefined') return; // Ensure this runs only on client

      setLoading(true)
      try {
        const localUserJson = localStorage.getItem('session_user')
        if (!localUserJson) {
          window.location.href = '/auth/login'
          return
        }
        
        let authUser: User | null = null;
        try {
          authUser = JSON.parse(localUserJson)
        } catch {
          localStorage.removeItem('session_user');
          window.location.href = '/auth/login'
          return;
        }

        if (!authUser) {
            window.location.href = '/auth/login'
            return;
        }
        
        setUser(authUser)

        const today = new Date().toISOString().split("T")[0]
        const entry = await dataService.getDailyEntry(authUser.id, today)
        setTodayEntry(entry)

      } catch (error) {
        console.error('Error loading dashboard:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

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
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">আজকের এন্ট্রি</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            {new Date().toLocaleDateString("bn-BD", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>
        <DailyEntryForm initialData={todayEntry} userId={user.id} />
      </div>
    </div>
  )
}
