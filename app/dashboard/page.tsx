import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DailyEntryForm } from "@/components/daily-entry-form"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get today's entry if it exists
  const today = new Date().toISOString().split("T")[0]
  const { data: todayEntry } = await supabase
    .from("daily_entries")
    .select("*")
    .eq("user_id", data.user.id)
    .eq("entry_date", today)
    .single()

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">আজকের এন্ট্রি</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          {new Date().toLocaleDateString("bn-BD", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>
      <DailyEntryForm initialData={todayEntry} userId={data.user.id} />
    </div>
  )
}
