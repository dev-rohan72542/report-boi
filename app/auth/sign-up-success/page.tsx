import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-semibold">সফলভাবে সাইন আপ!</CardTitle>
            <CardDescription>আপনার ইমেইল চেক করুন এবং অ্যাকাউন্ট যাচাই করুন</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              আমরা আপনার ইমেইলে একটি যাচাইকরণ লিঙ্ক পাঠিয়েছি। অ্যাকাউন্ট সক্রিয় করতে লিঙ্কে ক্লিক করুন।
            </p>
            <Link href="/auth/login" className="text-sm underline underline-offset-4">
              লগইন পেজে ফিরে যান
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
