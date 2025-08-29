import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { MonthlyReports } from "@/components/monthly-reports"

export default async function ReportsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get all entries for comprehensive reporting
  const { data: entries } = await supabase
    .from("daily_entries")
    .select("*")
    .eq("user_id", data.user.id)
    .order("entry_date", { ascending: true })

  // Get user goals for comparison
  const { data: goals } = await supabase.from("goals").select("*").eq("user_id", data.user.id).eq("is_active", true)

  return (
    <div className="max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">মাসিক রিপোর্ট</h1>
        <p className="text-muted-foreground">বিস্তারিত বিশ্লেষণ ও কর্মক্ষমতার রিপোর্ট</p>
      </div>
      <MonthlyReports entries={entries || []} goals={goals || []} />
    </div>
  )
}
