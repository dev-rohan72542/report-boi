"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import dynamic from "next/dynamic"

const PDFReportGenerator = dynamic(() => import("./pdf-report-generator").then((mod) => mod.PDFReportGenerator), { ssr: false })
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, TrendingDown, Award, AlertTriangle, Calendar, FileText } from "lucide-react"

interface MonthlyReportsProps {
  entries: any[]
  goals: any[]
}

export function MonthlyReports({ entries, goals }: MonthlyReportsProps) {
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date()
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`
  })

  // Get available months
  const availableMonths = Array.from(new Set(entries.map((entry) => entry.entry_date.substring(0, 7))))
    .sort()
    .reverse()

  // Filter entries for selected month
  const monthEntries = entries.filter((entry) => entry.entry_date.startsWith(selectedMonth))
  const monthName = new Date(selectedMonth + "-01").toLocaleDateString("bn-BD", { year: "numeric", month: "long" })

  // Calculate monthly statistics
  const calculateMonthlyStats = () => {
    if (monthEntries.length === 0) return null

    const totalDays = monthEntries.length
    const stats = {
      // Islamic Studies
      quranMemorization: monthEntries.reduce((sum, entry) => sum + (entry.quran_memorization || 0), 0),
      quranStudy: monthEntries.reduce((sum, entry) => sum + (entry.quran_study || 0), 0),
      hadithStudy: monthEntries.reduce((sum, entry) => sum + (entry.hadith_study || 0), 0),
      islamicLiterature: monthEntries.reduce((sum, entry) => sum + (entry.islamic_literature || 0), 0),

      // Work & Skills
      totalWorkHours: monthEntries.reduce((sum, entry) => sum + (entry.online_work + entry.offline_work || 0), 0),
      skillDevelopment: monthEntries.reduce(
        (sum, entry) => sum + (entry.skill_lessons + entry.skill_practice + entry.skill_projects || 0),
        0,
      ),

      // Physical & Spiritual
      totalExercise: monthEntries.reduce(
        (sum, entry) => sum + (entry.pull_ups + entry.push_ups + entry.squats || 0),
        0,
      ),
      prayersInCongregation: monthEntries.reduce((sum, entry) => sum + (entry.prayers_in_congregation || 0), 0),
      classesAttended: monthEntries.reduce((sum, entry) => sum + (entry.classes_attended || 0), 0),

      // Communication
      totalCommunication: monthEntries.reduce(
        (sum, entry) =>
          sum +
          ((entry.communication_members || 0) +
            (entry.communication_companions || 0) +
            (entry.communication_workers || 0) +
            (entry.communication_relations || 0) +
            (entry.communication_friends || 0) +
            (entry.communication_talented_students || 0) +
            (entry.communication_well_wishers || 0) +
            (entry.communication_mahram || 0)),
        0,
      ),

      // Distribution
      totalDistribution: monthEntries.reduce(
        (sum, entry) =>
          sum +
          ((entry.literature_distribution || 0) +
            (entry.magazine_distribution || 0) +
            (entry.sticker_card_distribution || 0) +
            (entry.gift_distribution || 0)),
        0,
      ),

      // Personal Development
      newspaperReading: monthEntries.reduce((sum, entry) => sum + (entry.newspaper_reading || 0), 0),
      selfCriticism: monthEntries.reduce((sum, entry) => sum + (entry.self_criticism || 0), 0),

      // Responsibilities
      dawaResponsibilities: monthEntries.reduce((sum, entry) => sum + (entry.dawati_responsibilities || 0), 0),
      otherResponsibilities: monthEntries.reduce((sum, entry) => sum + (entry.other_responsibilities || 0), 0),

      totalDays,
    }

    return stats
  }

  const monthlyStats = calculateMonthlyStats()

  // Performance radar data
  const radarData = monthlyStats
    ? [
        { subject: "কুরআন অধ্যয়ন", A: Math.min((monthlyStats.quranStudy / 1800) * 100, 100) },
        { subject: "নামাজ (জামাতে)", A: Math.min((monthlyStats.prayersInCongregation / 150) * 100, 100) },
        { subject: "ব্যায়াম", A: Math.min((monthlyStats.totalExercise / 900) * 100, 100) },
        { subject: "দক্ষতা উন্নয়ন", A: Math.min((monthlyStats.skillDevelopment / 1500) * 100, 100) },
        { subject: "যোগাযোগ", A: Math.min((monthlyStats.totalCommunication / 60) * 100, 100) },
        { subject: "বিতরণ", A: Math.min((monthlyStats.totalDistribution / 30) * 100, 100) },
      ]
    : []

  // Daily consistency data
  const consistencyData = monthEntries.map((entry) => ({
    date: new Date(entry.entry_date).getDate(),
    consistency:
      ((entry.quran_study > 0 ? 1 : 0) +
        (entry.prayers_in_congregation > 0 ? 1 : 0) +
        (entry.pull_ups + entry.push_ups + entry.squats > 0 ? 1 : 0) +
        (entry.online_work + entry.offline_work > 0 ? 1 : 0) +
        (entry.skill_lessons + entry.skill_practice + entry.skill_projects > 0 ? 1 : 0)) *
      20, // Convert to percentage
  }))

  // Goal achievement analysis
  const goalAchievements = goals.map((goal) => {
    let achieved = 0
    let target = goal.target_value

    if (goal.target_period === "monthly") {
      // Calculate monthly achievement
      switch (goal.category) {
        case "quran_study":
          achieved = monthlyStats?.quranStudy || 0
          break
        case "prayers_in_congregation":
          achieved = monthlyStats?.prayersInCongregation || 0
          break
        case "exercise":
          achieved = monthlyStats?.totalExercise || 0
          break
        case "skill_development":
          achieved = monthlyStats?.skillDevelopment || 0
          break
        case "work_hours":
          achieved = monthlyStats?.totalWorkHours || 0
          break
        case "communication":
          achieved = monthlyStats?.totalCommunication || 0
          break
        case "distribution":
          achieved = monthlyStats?.totalDistribution || 0
          break
      }
    } else if (goal.target_period === "daily") {
      // Calculate average daily achievement
      target = goal.target_value * (monthlyStats?.totalDays || 1)
      // Same calculation as monthly but for daily average
    }

    const percentage = target > 0 ? Math.min((achieved / target) * 100, 100) : 0
    return { ...goal, achieved, percentage }
  })

  // Generate insights
  const generateInsights = () => {
    if (!monthlyStats) return []

    const insights = []

    // Consistency insight
    const avgConsistency = consistencyData.reduce((sum, day) => sum + day.consistency, 0) / consistencyData.length
    if (avgConsistency >= 80) {
      insights.push({ type: "success", message: "চমৎকার! আপনি এই মাসে খুবই নিয়মিত ছিলেন।" })
    } else if (avgConsistency >= 60) {
      insights.push({ type: "warning", message: "ভালো! আরও নিয়মিত হওয়ার চেষ্টা করুন।" })
    } else {
      insights.push({ type: "danger", message: "নিয়মিততা বাড়ানোর প্রয়োজন।" })
    }

    // Quran study insight
    const avgQuranDaily = monthlyStats.quranStudy / monthlyStats.totalDays
    if (avgQuranDaily >= 60) {
      insights.push({ type: "success", message: "কুরআন অধ্যয়নে আপনার অগ্রগতি প্রশংসনীয়।" })
    } else {
      insights.push({ type: "info", message: "কুরআন অধ্যয়নে আরও সময় দেওয়ার চেষ্টা করুন।" })
    }

    // Prayer insight
    const prayerPercentage = (monthlyStats.prayersInCongregation / (monthlyStats.totalDays * 5)) * 100
    if (prayerPercentage >= 80) {
      insights.push({ type: "success", message: "জামাতে নামাজের ব্যাপারে আপনি খুবই সচেতন।" })
    }

    // Exercise insight
    const avgExerciseDaily = monthlyStats.totalExercise / monthlyStats.totalDays
    if (avgExerciseDaily < 10) {
      insights.push({ type: "warning", message: "শারীরিক ব্যায়ামে আরও মনোযোগ দিন।" })
    }

    return insights
  }

  const insights = generateInsights()

  const exportReport = () => {
    // This function is now handled by the PDFReportGenerator component
    return null
  }

  if (!monthlyStats) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">কোনো ডেটা নেই</h3>
          <p className="text-muted-foreground text-center">নির্বাচিত মাসের জন্য কোনো এন্ট্রি পাওয়া যায়নি।</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-8">
      {/* Month selector and export */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">মাস নির্বাচন করুন</label>
          <Select value={selectedMonth} onValueChange={setSelectedMonth}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableMonths.map((month) => (
                <SelectItem key={month} value={month}>
                  {new Date(month + "-01").toLocaleDateString("bn-BD", { year: "numeric", month: "long" })}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <PDFReportGenerator
          monthName={monthName}
          monthlyStats={monthlyStats}
          insights={insights}
          goalAchievements={goalAchievements}
        />
      </div>

      {/* Monthly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">মোট দিন</p>
                <p className="text-2xl font-bold">{monthlyStats.totalDays}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">কুরআন অধ্যয়ন</p>
                <p className="text-2xl font-bold">
                  {Math.round(monthlyStats.quranStudy / 60)} <span className="text-sm font-normal">ঘণ্টা</span>
                </p>
              </div>
              <FileText className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">নামাজ (জামাতে)</p>
                <p className="text-2xl font-bold">{monthlyStats.prayersInCongregation}</p>
              </div>
              <Award className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">মোট ব্যায়াম</p>
                <p className="text-2xl font-bold">{monthlyStats.totalExercise}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle>মাসিক অন্তর্দৃষ্টি</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {insights.map((insight, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${
                  insight.type === "success"
                    ? "bg-green-50 border-green-200"
                    : insight.type === "warning"
                      ? "bg-yellow-50 border-yellow-200"
                      : insight.type === "danger"
                        ? "bg-red-50 border-red-200"
                        : "bg-blue-50 border-blue-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  {insight.type === "success" ? (
                    <Award className="h-5 w-5 text-green-600 mt-0.5" />
                  ) : insight.type === "warning" ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  ) : insight.type === "danger" ? (
                    <TrendingDown className="h-5 w-5 text-red-600 mt-0.5" />
                  ) : (
                    <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 dark:text-blue-400 dark:text-blue-400 dark:text-blue-400 dark:text-blue-400 dark:text-blue-400 dark:text-blue-400 dark:text-blue-400 dark:text-blue-400 dark:text-blue-400 dark:text-blue-400 dark:text-blue-400 dark:text-blue-400 dark:text-blue-400 mt-0.5" />
                  )}
                  <p className="text-sm">{insight.message}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts and Analysis */}
      <Tabs defaultValue="performance" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="performance">কর্মক্ষমতা</TabsTrigger>
          <TabsTrigger value="consistency">নিয়মিততা</TabsTrigger>
          <TabsTrigger value="goals">লক্ষ্য অর্জন</TabsTrigger>
          <TabsTrigger value="breakdown">বিস্তারিত</TabsTrigger>
        </TabsList>

        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>কর্মক্ষমতা রাডার</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="অর্জন %" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.3} />
                  <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, "অর্জন"]} />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="consistency">
          <Card>
            <CardHeader>
              <CardTitle>দৈনিক নিয়মিততা</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={consistencyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip formatter={(value: any) => [`${value}%`, "নিয়মিততা"]} />
                  <Line type="monotone" dataKey="consistency" stroke="#82ca9d" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {goalAchievements.map((goal, index) => (
              <Card key={index}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">{goal.category}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span>অর্জিত: {goal.achieved}</span>
                      <span>লক্ষ্য: {goal.target_value}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${goal.percentage >= 100 ? "bg-green-500" : goal.percentage >= 75 ? "bg-blue-500" : "bg-yellow-500"}`}
                        style={{ width: `${Math.min(goal.percentage, 100)}%` }}
                      />
                    </div>
                    <div className="flex justify-between items-center">
                      <Badge
                        variant={goal.percentage >= 100 ? "default" : goal.percentage >= 75 ? "secondary" : "outline"}
                      >
                        {goal.percentage.toFixed(1)}%
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {goal.percentage >= 100
                          ? "সম্পূর্ণ!"
                          : `${(((goal.target_value - goal.achieved) / goal.target_value) * 100).toFixed(1)}% বাকি`}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="breakdown">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ইসলামী অধ্যয়ন</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>কুরআন মুখস্থ:</span>
                  <span>{Math.round(monthlyStats.quranMemorization / 60)} ঘণ্টা</span>
                </div>
                <div className="flex justify-between">
                  <span>কুরআন অধ্যয়ন:</span>
                  <span>{Math.round(monthlyStats.quranStudy / 60)} ঘণ্টা</span>
                </div>
                <div className="flex justify-between">
                  <span>হাদিস:</span>
                  <span>{Math.round(monthlyStats.hadithStudy / 60)} ঘণ্টা</span>
                </div>
                <div className="flex justify-between">
                  <span>ইসলামী সাহিত্য:</span>
                  <span>{Math.round(monthlyStats.islamicLiterature / 60)} ঘণ্টা</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">কাজ ও দক্ষতা</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>মোট কাজ:</span>
                  <span>{Math.round(monthlyStats.totalWorkHours / 60)} ঘণ্টা</span>
                </div>
                <div className="flex justify-between">
                  <span>দক্ষতা উন্নয়ন:</span>
                  <span>{Math.round(monthlyStats.skillDevelopment / 60)} ঘণ্টা</span>
                </div>
                <div className="flex justify-between">
                  <span>ক্লাস:</span>
                  <span>{monthlyStats.classesAttended} টি</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">সামাজিক কার্যক্রম</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex justify-between">
                  <span>যোগাযোগ:</span>
                  <span>{monthlyStats.totalCommunication} বার</span>
                </div>
                <div className="flex justify-between">
                  <span>বিতরণ:</span>
                  <span>{monthlyStats.totalDistribution} টি</span>
                </div>
                <div className="flex justify-between">
                  <span>দাওয়াতি দায়িত্ব:</span>
                  <span>{Math.round(monthlyStats.dawaResponsibilities / 60)} ঘণ্টা</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
