"use client"

import { useEffect, useState } from "react"
import { analyticsService } from "@/lib/services/analytics-service"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { OfflineIndicator } from "@/components/offline-indicator"
import { Flame, TrendingUp, Target, CheckCircle2 } from "lucide-react"

export default function AnalyticsPage() {
  const [streak, setStreak] = useState(0)
  const [totalEntries, setTotalEntries] = useState(0)
  const [categoryProgress, setCategoryProgress] = useState({
    islamic: 0,
    work: 0,
    exercise: 0,
    communication: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadAnalytics = async () => {
      try {
        const [currentStreak, entriesCount, islamicProg, workProg, exerciseProg, commProg] =
          await Promise.all([
            analyticsService.getCurrentStreak(),
            analyticsService.getTotalEntriesCount(),
            analyticsService.getCategoryProgress("islamic"),
            analyticsService.getCategoryProgress("work"),
            analyticsService.getCategoryProgress("exercise"),
            analyticsService.getCategoryProgress("communication"),
          ])

        setStreak(currentStreak)
        setTotalEntries(entriesCount)
        setCategoryProgress({
          islamic: islamicProg,
          work: workProg,
          exercise: exerciseProg,
          communication: commProg,
        })
      } catch (error) {
        console.error("[v0] Error loading analytics:", error)
      } finally {
        setLoading(false)
      }
    }

    loadAnalytics()
  }, [])

  const getStreakMessage = (days: number): string => {
    if (days === 0) return "শুরু করুন!"
    if (days === 1) return "দুর্দান্ত শুরু!"
    if (days === 3) return "চমৎকার!"
    if (days === 7) return "এক সপ্তাহ!"
    if (days === 14) return "দুই সপ্তাহ!"
    if (days === 30) return "এক মাস!"
    if (days === 100) return "শত দিন!"
    return "চলছে..."
  }

  if (loading) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">বিশ্লেষণ</h1>
        <p className="text-muted-foreground">লোড হচ্ছে...</p>
      </div>
    )
  }

  return (
    <div>
      <OfflineIndicator />
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">বিশ্লেষণ</h1>
          <p className="text-muted-foreground">আপনার অগ্রগতি ট্র্যাক করুন</p>
        </div>

        {/* Streak Card */}
        <Card className="border-2 border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              বর্তমান ধারাবাহিকতা
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-6xl font-bold text-primary">{streak}</div>
                <p className="text-lg text-muted-foreground mt-2">{getStreakMessage(streak)}</p>
                <p className="text-sm text-muted-foreground">ক্রমাগত দিন</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Stats */}
        <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4" />
                মোট এন্ট্রি
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEntries}</div>
              <p className="text-xs text-muted-foreground">সম্পূর্ণ এন্ট্রি</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                গড় সম্পূর্ণতা
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(
                  (categoryProgress.islamic + categoryProgress.work + categoryProgress.exercise + categoryProgress.communication) / 4
                )}
                %
              </div>
              <p className="text-xs text-muted-foreground">সব বিভাগ</p>
            </CardContent>
          </Card>
        </div>

        {/* Category Progress */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">বিভাগ অগ্রগতি</h2>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">ইসলামিক অধ্যয়ন</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={categoryProgress.islamic} className="h-2" />
                <p className="text-sm text-muted-foreground">{categoryProgress.islamic}% সম্পূর্ণ</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">কর্মক্ষেত্র</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={categoryProgress.work} className="h-2" />
                <p className="text-sm text-muted-foreground">{categoryProgress.work}% সম্পূর্ণ</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">ব্যায়াম</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={categoryProgress.exercise} className="h-2" />
                <p className="text-sm text-muted-foreground">{categoryProgress.exercise}% সম্পূর্ণ</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">যোগাযোগ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={categoryProgress.communication} className="h-2" />
                <p className="text-sm text-muted-foreground">{categoryProgress.communication}% সম্পূর্ণ</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
