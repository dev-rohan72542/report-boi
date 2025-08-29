"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { User, LogOut, BarChart3, Target, FileText } from "lucide-react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ThemeSwitcher } from "./theme-switcher"

interface DashboardHeaderProps {
  user: any
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 relative"> {/* Added relative */}
        <div className="flex items-center justify-center h-16"> {/* Added flex, justify-center, h-16 */}
          {/* Desktop Nav (hidden on mobile, positioned left on desktop) */}
          <div className="absolute left-0 hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <User className="h-4 w-4" />
                এন্ট্রি
              </Link>
              <Link
                href="/dashboard/analytics"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <BarChart3 className="h-4 w-4" />
                বিশ্লেষণ
              </Link>
              <Link
                href="/dashboard/goals"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <Target className="h-4 w-4" />
                লক্ষ্য
              </Link>
              <Link
                href="/dashboard/reports"
                className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                <FileText className="h-4 w-4" />
                রিপোর্ট
              </Link>
            </nav>
          </div>

          {/* Logo (always centered) */}
          <Link href="/dashboard" className="text-3xl font-bold text-foreground font-li-shobuj-nolua">
            রিপোর্ট বই
          </Link>

          {/* Right section (theme switch and user info) */}
          <div className="absolute right-0 flex items-center gap-4"> {/* Positioned right */}
            <ThemeSwitcher />
            {/* User info and logout (hidden on mobile, positioned right on desktop) */}
            <div className="hidden md:flex items-center gap-4">
              <Link href="/dashboard/profile">
                <span className="text-sm text-muted-foreground hidden sm:block">{user.email}</span>
              </Link>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                <LogOut className="h-4 w-4 mr-2" />
                লগআউট
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
