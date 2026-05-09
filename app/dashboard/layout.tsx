import { DashboardHeader } from "@/components/dashboard-header"
import { BottomNav } from "@/components/bottom-nav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container mx-auto px-3 sm:px-4 py-4 md:py-6 pb-24 md:pb-8 no-scrollbar">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
