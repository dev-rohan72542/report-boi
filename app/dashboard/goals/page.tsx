import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GoalsManager } from "@/components/goals-manager"

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Get user's active goals
  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", data.user.id)
    .eq("is_active", true)
    .order("created_at", { ascending: false })

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-2">লক্ষ্য নির্ধারণ</h1>
        <p className="text-muted-foreground">আপনার ব্যক্তিগত ও আধ্যাত্মিক লক্ষ্য নির্ধারণ ও ট্র্যাক করুন</p>
      </div>
      <GoalsManager goals={goals || []} userId={data.user.id} />
    </div>
  )
}
