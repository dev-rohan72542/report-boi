"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Mail, Lock, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        setError(error.message)
        setLoading(false)
        return
      }

      router.push("/dashboard")
    } catch (err) {
      setError("An unexpected error occurred")
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setError("Google login is available on web version. Use email/password for now.")
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground font-li-shobuj-nolua mb-2">রিপোর্ট বই</h1>
          <p className="text-muted-foreground">আপনার অ্যাকাউন্টে লগইন করুন</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4 mb-6">
          {error && (
            <div className="bg-destructive/10 border border-destructive rounded-lg p-3 text-sm text-destructive">
              {error}
            </div>
          )}

          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium text-foreground">
              ইমেইল
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="আপনার ইমেইল"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="text-sm font-medium text-foreground">
              পাসওয়ার্ড
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                placeholder="আপনার পাসওয়ার্ড"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                লগইন করছে...
              </>
            ) : (
              "লগইন করুন"
            )}
          </Button>
        </form>



        <p className="text-center text-sm text-muted-foreground mt-6">
          অ্যাকাউন্ট নেই?{" "}
          <Link href="/auth/sign-up" className="text-primary hover:underline font-medium">
            সাইন আপ করুন
          </Link>
        </p>
      </div>
    </div>
  )
}
