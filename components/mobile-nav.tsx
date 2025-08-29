"use client"

import { Button } from "@/components/ui/button"
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Menu, User, BarChart3, Target, FileText, LogOut } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import Image from "next/image"

interface MobileNavProps {
  user: any
}

export function MobileNav({ user }: MobileNavProps) {
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
  }

  const navItems = [
    { href: "/dashboard", label: "এন্ট্রি", icon: User },
    { href: "/analytics", label: "বিশ্লেষণ", icon: BarChart3 },
    { href: "/goals", label: "লক্ষ্য", icon: Target },
    { href: "/reports", label: "রিপোর্ট", icon: FileText },
  ]

  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="ghost" size="sm" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-[80%]">
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center gap-2 pb-4 border-b mb-4">
            <Image src="/placeholder-logo.svg" alt="Logo" width={24} height={24} />
            <div className="text-lg font-bold">রিপোর্ট বই</div>
          </div>

          <nav className="flex-1">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:text-foreground hover:bg-accent"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </nav>

          <div className="border-t pt-4 mt-auto">
            <div className="px-3 py-2 text-sm text-muted-foreground mb-2">{user.email}</div>
            <Button
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive text-base"
              onClick={handleSignOut}
            >
              <LogOut className="h-5 w-5 mr-2" />
              লগআউট
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  )
}
