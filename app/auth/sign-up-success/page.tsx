"use client"

import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Mail, CheckCircle } from "lucide-react"

export default function SignUpSuccessPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="mb-6">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-2">সাইন আপ সফল!</h1>
          <p className="text-muted-foreground mb-4">আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।</p>
        </div>

        <div className="bg-card border rounded-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Mail className="h-5 w-5 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              নিশ্চিতকরণের জন্য আপনার ইমেইল চেক করুন
            </p>
          </div>
          <p className="text-sm text-muted-foreground">
            আপনার ইনবক্সে একটি নিশ্চিতকরণ লিঙ্ক পাবেন। এটি ক্লিক করুন আপনার অ্যাকাউন্ট সম্পূর্ণ করতে।
          </p>
        </div>

        <Link href="/auth/login">
          <Button className="w-full mb-3">লগইন পেজে ফিরুন</Button>
        </Link>
      </div>
    </div>
  )
}
