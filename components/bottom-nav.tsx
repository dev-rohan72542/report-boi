"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, BarChart3, Target, FileText, UserCircle } from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { href: "/dashboard", label: "এন্ট্রি", icon: User },
  { href: "/dashboard/analytics", label: "বিশ্লেষণ", icon: BarChart3 },
  { href: "/dashboard/goals", label: "লক্ষ্য", icon: Target },
  { href: "/dashboard/reports", label: "রিপোর্ট", icon: FileText },
  { href: "/dashboard/profile", label: "প্রোফাইল", icon: UserCircle },
]

export function BottomNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-background border-t z-50">
      <div className="grid grid-cols-5 h-16">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center justify-center gap-1 text-xs font-medium transition-colors",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-primary"
              )}
            >
              <Icon className="h-5 w-5" color="currentColor" />
              <span>{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}