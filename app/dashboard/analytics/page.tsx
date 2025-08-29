import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProgressDashboard } from "@/components/progress-dashboard"

export default async function AnalyticsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get last 30 days of entries
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const { data: entries } = await supabase
    .from("daily_entries")
    .select("*")
    .eq("user_id", data.user.id)
    .gte("entry_date", thirtyDaysAgo.toISOString().split("T")[0])
    .order("entry_date", { ascending: true })

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">অগ্রগতি বিশ্লেষণ</h1>
        <p className="text-muted-foreground">গত ৩০ দিনের কার্যক্রমের বিস্তারিত বিশ্লেষণ</p>
      </div>
      <ProgressDashboard entries={entries || []} />
    </div>
  )
}
