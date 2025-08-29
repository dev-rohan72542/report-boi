import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data, error } = await supabase.auth.getUser()

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">প্রোফাইল</h1>
        <p className="text-sm md:text-base text-muted-foreground">
          আপনার অ্যাকাউন্ট পরিচালনা করুন
        </p>
      </div>

      <div className="space-y-6">
        <div className="p-4 border rounded-lg">
          <p className="text-sm text-muted-foreground">Email</p>
          <p className="font-semibold">{data.user.email}</p>
        </div>

        <form action="/auth/logout" method="post">
          <Button variant="outline" className="w-full md:w-auto">
            <LogOut className="h-4 w-4 mr-2" />
            লগআউট
          </Button>
        </form>
      </div>
    </div>
  )
}
