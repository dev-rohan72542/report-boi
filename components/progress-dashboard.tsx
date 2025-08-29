"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
} from "recharts"
import { TrendingUp, TrendingDown, Target, Calendar, BookOpen, Dumbbell } from "lucide-react"

interface ProgressDashboardProps {
  entries: any[]
}

export function ProgressDashboard({ entries }: ProgressDashboardProps) {
  // Calculate statistics
  const totalDays = entries.length
  const avgQuranStudy = entries.reduce((sum, entry) => sum + (entry.quran_study || 0), 0) / totalDays || 0
  const avgExercise =
    entries.reduce((sum, entry) => sum + (entry.pull_ups + entry.push_ups + entry.squats || 0), 0) / totalDays || 0
  const totalPrayers = entries.reduce((sum, entry) => sum + (entry.prayers_in_congregation || 0), 0)
  const avgWorkHours =
    entries.reduce((sum, entry) => sum + (entry.online_work + entry.offline_work || 0), 0) / totalDays / 60 || 0

  // Prepare chart data
  const weeklyData = entries.reduce((acc: any[], entry) => {
    const date = new Date(entry.entry_date)
    const weekStart = new Date(date.setDate(date.getDate() - date.getDay()))
    const weekKey = weekStart.toISOString().split("T")[0]

    const existing = acc.find((item) => item.week === weekKey)
    if (existing) {
      existing.quran += entry.quran_study || 0
      existing.exercise += entry.pull_ups + entry.push_ups + entry.squats || 0
      existing.work += entry.online_work + entry.offline_work || 0
      existing.prayers += entry.prayers_in_congregation || 0
    } else {
      acc.push({
        week: weekKey,
        weekLabel: `সপ্তাহ ${acc.length + 1}`,
        quran: entry.quran_study || 0,
        exercise: entry.pull_ups + entry.push_ups + entry.squats || 0,
        work: entry.online_work + entry.offline_work || 0,
        prayers: entry.prayers_in_congregation || 0,
      })
    }
    return acc
  }, [])

  // Category distribution data
  const categoryData = [
    { name: "কুরআন অধ্যয়ন", value: entries.reduce((sum, entry) => sum + (entry.quran_study || 0), 0), color: "#8884d8" },
    {
      name: "কাজের সময়",
      value: entries.reduce((sum, entry) => sum + (entry.online_work + entry.offline_work || 0), 0),
      color: "#82ca9d",
    },
    {
      name: "দক্ষতা উন্নয়ন",
      value: entries.reduce(
        (sum, entry) => sum + (entry.skill_lessons + entry.skill_practice + entry.skill_projects || 0),
        0,
      ),
      color: "#ffc658",
    },
    {
      name: "ব্যক্তিগত উন্নয়ন",
      value: entries.reduce((sum, entry) => sum + (entry.newspaper_reading + entry.self_criticism || 0), 0),
      color: "#ff7300",
    },
  ].filter((item) => item.value > 0)

  // Recent trend calculation
  const recentEntries = entries.slice(-7)
  const previousEntries = entries.slice(-14, -7)
  const recentAvg = recentEntries.reduce((sum, entry) => sum + (entry.quran_study || 0), 0) / 7
  const previousAvg = previousEntries.reduce((sum, entry) => sum + (entry.quran_study || 0), 0) / 7
  const trend = recentAvg > previousAvg ? "up" : "down"
  const trendPercentage = previousAvg > 0 ? Math.abs(((recentAvg - previousAvg) / previousAvg) * 100) : 0

  const StatCard = ({ title, value, unit, icon: Icon, trend, trendValue }: any) => (
    <Card>
      <CardContent className="p-4 md:p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs md:text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-xl md:text-2xl font-bold">
              {value} <span className="text-xs md:text-sm font-normal text-muted-foreground">{unit}</span>
            </p>
            {trend && (
              <div className="flex items-center gap-1 mt-1">
                {trend === "up" ? (
                  <TrendingUp className="h-3 w-3 md:h-4 md:w-4 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 md:h-4 md:w-4 text-red-500" />
                )}
                <span className={`text-xs md:text-sm ${trend === "up" ? "text-green-500" : "text-red-500"}`}>
                  {trendValue}%
                </span>
              </div>
            )}
          </div>
          <Icon className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  )

  const ProgressCard = ({ title, current, target, unit }: any) => {
    const percentage = target > 0 ? Math.min((current / target) * 100, 100) : 0
    return (
      <Card>
        <CardHeader className="pb-2 md:pb-3">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between text-xs md:text-sm">
            <span>
              {current} {unit}
            </span>
            <span className="text-muted-foreground">
              {target} {unit}
            </span>
          </div>
          <Progress value={percentage} className="h-2" />
          <div className="flex justify-between items-center">
            <Badge
              variant={percentage >= 100 ? "default" : percentage >= 75 ? "secondary" : "outline"}
              className="text-xs"
            >
              {percentage.toFixed(0)}%
            </Badge>
            <span className="text-xs text-muted-foreground">
              {percentage >= 100 ? "লক্ষ্য অর্জিত!" : `${(target - current).toFixed(0)} ${unit} বাকি`}
            </span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6 md:space-y-8">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
        <StatCard
          title="গড় কুরআন অধ্যয়ন"
          value={avgQuranStudy.toFixed(0)}
          unit="মিনিট/দিন"
          icon={BookOpen}
          trend={trend}
          trendValue={trendPercentage.toFixed(1)}
        />
        <StatCard title="গড় ব্যায়াম" value={avgExercise.toFixed(0)} unit="সংখ্যা/দিন" icon={Dumbbell} />
        <StatCard title="মোট নামাজ (জামাতে)" value={totalPrayers} unit="বার" icon={Target} />
        <StatCard title="গড় কাজের সময়" value={avgWorkHours.toFixed(1)} unit="ঘণ্টা/দিন" icon={Calendar} />
      </div>

      {/* Progress Targets */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg md:text-xl">
            <Target className="h-4 w-4 md:h-5 md:w-5" />
            মাসিক লক্ষ্যের অগ্রগতি
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            <ProgressCard
              title="কুরআন অধ্যয়ন"
              current={entries.reduce((sum, entry) => sum + (entry.quran_study || 0), 0)}
              target={1800} // 60 minutes * 30 days
              unit="মিনিট"
            />
            <ProgressCard
              title="নামাজ (জামাতে)"
              current={totalPrayers}
              target={150} // 5 prayers * 30 days
              unit="বার"
            />
            <ProgressCard
              title="ব্যায়াম"
              current={entries.reduce((sum, entry) => sum + (entry.pull_ups + entry.push_ups + entry.squats || 0), 0)}
              target={900} // 30 exercises * 30 days
              unit="সংখ্যা"
            />
            <ProgressCard
              title="দক্ষতা উন্নয়ন"
              current={entries.reduce(
                (sum, entry) => sum + (entry.skill_lessons + entry.skill_practice + entry.skill_projects || 0),
                0,
              )}
              target={1500} // 50 minutes * 30 days
              unit="মিনিট"
            />
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Tabs defaultValue="weekly" className="space-y-4 md:space-y-6">
        <div className="overflow-x-auto">
          <TabsList className="grid w-full grid-cols-3 min-w-max">
            <TabsTrigger value="weekly" className="text-xs md:text-sm">
              সাপ্তাহিক ট্রেন্ড
            </TabsTrigger>
            <TabsTrigger value="distribution" className="text-xs md:text-sm">
              বিভাগীয় বিতরণ
            </TabsTrigger>
            <TabsTrigger value="daily" className="text-xs md:text-sm">
              দৈনিক অগ্রগতি
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">সাপ্তাহিক কার্যক্রম ট্রেন্ড</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} className="md:h-96">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="weekLabel" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="quran" fill="#8884d8" name="কুরআন (মিনিট)" />
                  <Bar dataKey="work" fill="#82ca9d" name="কাজ (মিনিট)" />
                  <Bar dataKey="prayers" fill="#ffc658" name="নামাজ (বার)" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="distribution">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">সময় বিতরণ (মোট মিনিট)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} className="md:h-96">
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    className="md:outerRadius-120"
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="daily">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">দৈনিক কুরআন অধ্যয়ন</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300} className="md:h-96">
                <LineChart data={entries}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="entry_date"
                    tickFormatter={(value) =>
                      new Date(value).toLocaleDateString("bn-BD", { month: "short", day: "numeric" })
                    }
                    fontSize={12}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip
                    labelFormatter={(value) => new Date(value).toLocaleDateString("bn-BD")}
                    formatter={(value: any) => [`${value} মিনিট`, "কুরআন অধ্যয়ন"]}
                  />
                  <Line
                    type="monotone"
                    dataKey="quran_study"
                    stroke="#8884d8"
                    strokeWidth={2}
                    dot={{ fill: "#8884d8", strokeWidth: 2, r: 3 }}
                    className="md:dot-r-4"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Activity Heatmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg md:text-xl">কার্যক্রম হিটম্যাপ</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 max-w-sm mx-auto md:max-w-none">
            {Array.from({ length: 35 }, (_, i) => {
              const date = new Date()
              date.setDate(date.getDate() - (34 - i))
              const dateStr = date.toISOString().split("T")[0]
              const entry = entries.find((e) => e.entry_date === dateStr)
              const intensity = entry ? Math.min((entry.quran_study || 0) / 60, 1) : 0

              return (
                <div
                  key={i}
                  className={`aspect-square rounded-sm border text-xs ${
                    intensity === 0
                      ? "bg-muted"
                      : intensity < 0.25
                        ? "bg-green-100"
                        : intensity < 0.5
                          ? "bg-green-200"
                          : intensity < 0.75
                            ? "bg-green-300"
                            : "bg-green-400"
                  }`}
                  title={`${date.toLocaleDateString("bn-BD")}: ${entry?.quran_study || 0} মিনিট`}
                />
              )
            })}
          </div>
          <div className="flex items-center justify-between mt-4 text-xs md:text-sm text-muted-foreground">
            <span>কম</span>
            <div className="flex gap-1">
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-sm bg-muted border" />
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-sm bg-green-100 border" />
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-sm bg-green-200 border" />
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-sm bg-green-300 border" />
              <div className="w-2 h-2 md:w-3 md:h-3 rounded-sm bg-green-400 border" />
            </div>
            <span>বেশি</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
