"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { DashboardHeader } from "@/components/dashboard-header"
import { BottomNav } from "@/components/bottom-nav"
import { User } from "@supabase/supabase-js"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      if (typeof window === 'undefined') return; // Ensure this runs only on client

      const { data: { session } } = await supabase.auth.getSession()

      if (session) {
        setUser(session.user)
        localStorage.setItem('session_user', JSON.stringify(session.user))
      } else {
        const localUserJson = localStorage.getItem('session_user')
        if (localUserJson) {
          try {
            setUser(JSON.parse(localUserJson))
          } catch {
            localStorage.removeItem('session_user');
            window.location.href = '/auth/login'
          }
        } else {
          window.location.href = '/auth/login'
        }
      }
      setLoading(false)
    }

    getSession()

    const { data: authListener } = supabase.auth.onAuthStateChange((_event, session) => {
      if (typeof window === 'undefined') return;

      const newSessionUser = session?.user ?? null
      setUser(newSessionUser)
      if (newSessionUser) {
        localStorage.setItem('session_user', JSON.stringify(newSessionUser))
      } else {
        localStorage.removeItem('session_user')
        window.location.href = '/auth/login'
      }
    })

    return () => {
      authListener?.subscription.unsubscribe()
    }
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
      <DashboardHeader user={user} />
      <main className="container mx-auto px-3 sm:px-4 py-4 md:py-6 pb-24 md:pb-8 no-scrollbar">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
