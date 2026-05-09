import { User, BarChart3, Target, FileText, Settings } from "lucide-react"
import Link from "next/link"
import { ThemeSwitcher } from "./theme-switcher"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function DashboardHeader() {

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2 md:py-4 relative">
        <div className="flex items-center justify-center h-14 md:h-16">
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

          {/* Right section (theme switch) */}
          <div className="absolute right-0 flex items-center gap-2 md:gap-4">
            <ThemeSwitcher />
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Settings className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel>মেনু</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile">
                      <Settings className="mr-2 h-4 w-4" />
                      <span>প্রোফাইল</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
