"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"
import { OfflineIndicator } from "@/components/offline-indicator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null)
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
    } catch (error) {
      console.error('Auth error:', error)
      window.location.href = '/auth/login'
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut()
      window.location.href = '/auth/login'
    } catch (error) {
      console.error('Logout error:', error)
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

  const userAvatarUrl = user?.user_metadata?.avatar_url
  const userEmail = user?.email || ""
  const userName = user?.user_metadata?.full_name
  const avatarFallback = (userName?.[0] || userEmail?.[0] || "U").toUpperCase()

  return (
    <div className="min-h-screen bg-background">
      <OfflineIndicator />
      <div className="max-w-4xl mx-auto p-4">
        <div className="mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">প্রোফাইল</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            আপনার অ্যাকাউন্ট পরিচালনা করুন
          </p>
        </div>

        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24">
                <AvatarImage src={userAvatarUrl} alt={userName || userEmail} />
                <AvatarFallback>{avatarFallback}</AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold">{userName || 'User'}</h2>
                <p className="text-muted-foreground">{userEmail}</p>
              </div>
            </div>

            <div className="space-y-4">
                <div className="p-4 border rounded-lg bg-muted/20">
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">{userEmail}</p>
                </div>
                {userName && (
                    <div className="p-4 border rounded-lg bg-muted/20">
                        <p className="text-sm text-muted-foreground">Full Name</p>
                        <p className="font-semibold">{userName}</p>
                    </div>
                )}
            </div>

            <Button 
              variant="outline" 
              className="w-full md:w-auto"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4 mr-2" />
              লগআউট
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
