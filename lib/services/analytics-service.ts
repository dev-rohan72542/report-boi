import { localDB, LocalDailyEntry } from '../database/local-db'
import { createClient } from '../supabase/client'
import { DailyEntryData } from './hybrid-data-service'

interface EntryStats {
  average: number
  lastValue: number
  trend: 'increasing' | 'decreasing' | 'stable'
  lastSevenDays: number[]
  currentStreak: number
}

type EntryField = keyof Omit<DailyEntryData, 'user_id' | 'entry_date'>

export class AnalyticsService {
  private supabase = createClient()
  private isBrowser = typeof window !== 'undefined'

  /**
   * Get statistics for a specific field across last N days
   */
  async getFieldStats(field: EntryField, daysBack: number = 30): Promise<EntryStats> {
    if (!this.isBrowser || !localDB) {
      return this.getEmptyStats()
    }

    try {
      // Get all entries from localDB
      const allEntries = await localDB.daily_entries.toArray()
      
      // Filter entries from the last N days
      const now = new Date()
      const cutoffDate = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000)
      
      const relevantEntries = allEntries
        .filter(entry => {
          const entryDate = new Date(entry.entry_date)
          return entryDate >= cutoffDate && entryDate <= now
        })
        .sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime())

      if (relevantEntries.length === 0) {
        return this.getEmptyStats()
      }

      // Get last 7 days values
      const last7Days = relevantEntries.slice(-7).map(entry => entry[field] as number || 0)
      
      // Calculate average
      const sum = relevantEntries.reduce((acc, entry) => acc + (entry[field] as number || 0), 0)
      const average = Math.round(sum / relevantEntries.length * 10) / 10

      // Get last value
      const lastValue = last7Days[last7Days.length - 1] || 0

      // Determine trend
      const trend = this.calculateTrend(last7Days)

      // Calculate current streak (consecutive days with entry)
      const currentStreak = this.calculateConsecutiveEntries(relevantEntries)

      return {
        average,
        lastValue,
        trend,
        lastSevenDays: last7Days,
        currentStreak
      }
    } catch (error) {
      console.error('[v0] Error calculating field stats:', error)
      return this.getEmptyStats()
    }
  }

  /**
   * Get yesterdays entry data for pre-filling
   */
  async getYesterdayEntry(): Promise<Partial<DailyEntryData> | null> {
    if (!this.isBrowser || !localDB) {
      return null
    }

    try {
      const allEntries = await localDB.daily_entries.toArray()
      
      // Get yesterday's date
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]

      // Find yesterday's entry
      const yesterdayEntry = allEntries.find(entry => 
        entry.entry_date.startsWith(yesterdayStr)
      )

      if (yesterdayEntry) {
        const { id, sync_status, created_at, updated_at, ...data } = yesterdayEntry
        return data
      }

      return null
    } catch (error) {
      console.error('[v0] Error fetching yesterday entry:', error)
      return null
    }
  }

  /**
   * Get all entries statistics (for dashboard analytics)
   */
  async getAllStatistics(): Promise<Record<EntryField, EntryStats>> {
    if (!this.isBrowser || !localDB) {
      return {} as Record<EntryField, EntryStats>
    }

    const fields: EntryField[] = [
      'quran_memorization',
      'quran_study',
      'hadith_study',
      'islamic_literature',
      'other_literature',
      'online_work',
      'offline_work',
      'skill_lessons',
      'skill_practice',
      'skill_projects',
      'pull_ups',
      'push_ups',
      'squats',
      'prayers_in_congregation',
      'classes_attended',
      'communication_members',
      'communication_companions',
      'communication_workers',
      'communication_relations',
      'communication_friends',
      'communication_talented_students',
      'communication_well_wishers',
      'communication_mahram',
      'literature_distribution',
      'magazine_distribution',
      'sticker_card_distribution',
      'gift_distribution',
      'dawati_responsibilities',
      'other_responsibilities',
      'newspaper_reading',
      'self_criticism',
    ]

    const statistics: Record<EntryField, EntryStats> = {} as Record<EntryField, EntryStats>

    for (const field of fields) {
      statistics[field] = await this.getFieldStats(field)
    }

    return statistics
  }

  /**
   * Calculate percentage complete for a category
   */
  async getCategoryProgress(category: 'islamic' | 'work' | 'exercise' | 'communication'): Promise<number> {
    const categoryFields: Record<string, EntryField[]> = {
      islamic: ['quran_memorization', 'quran_study', 'hadith_study', 'islamic_literature', 'prayers_in_congregation'],
      work: ['online_work', 'offline_work', 'skill_lessons', 'skill_practice'],
      exercise: ['pull_ups', 'push_ups', 'squats'],
      communication: ['communication_members', 'communication_companions', 'communication_workers', 'communication_friends']
    }

    const fields = categoryFields[category] || []
    if (fields.length === 0) return 0

    try {
      const stats = await Promise.all(fields.map(f => this.getFieldStats(f)))
      const filledCount = stats.filter(s => s.lastValue > 0).length
      return Math.round((filledCount / fields.length) * 100)
    } catch (error) {
      console.error('[v0] Error calculating category progress:', error)
      return 0
    }
  }

  /**
   * Get total entries count
   */
  async getTotalEntriesCount(): Promise<number> {
    if (!this.isBrowser || !localDB) {
      return 0
    }

    try {
      return await localDB.daily_entries.count()
    } catch (error) {
      console.error('[v0] Error getting entries count:', error)
      return 0
    }
  }

  /**
   * Get current streak (consecutive days with at least one entry)
   */
  async getCurrentStreak(): Promise<number> {
    if (!this.isBrowser || !localDB) {
      return 0
    }

    try {
      const allEntries = await localDB.daily_entries.toArray()
      return this.calculateConsecutiveEntries(allEntries)
    } catch (error) {
      console.error('[v0] Error calculating streak:', error)
      return 0
    }
  }

  // ---- Private helper methods ----

  private getEmptyStats(): EntryStats {
    return {
      average: 0,
      lastValue: 0,
      trend: 'stable',
      lastSevenDays: [],
      currentStreak: 0
    }
  }

  private calculateTrend(values: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (values.length < 2) return 'stable'

    const recent = values.slice(-4) // Last 4 values
    const older = values.slice(-8, -4) // 4 values before that

    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length
    const olderAvg = older.length > 0 ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg

    const diff = recentAvg - olderAvg
    if (Math.abs(diff) < 0.5) return 'stable'
    return diff > 0 ? 'increasing' : 'decreasing'
  }

  private calculateConsecutiveEntries(entries: LocalDailyEntry[]): number {
    if (entries.length === 0) return 0

    // Sort by date descending (most recent first)
    const sorted = entries.sort((a, b) => 
      new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
    )

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const entry of sorted) {
      const entryDate = new Date(entry.entry_date)
      entryDate.setHours(0, 0, 0, 0)

      // Check if this entry is from today or yesterday (relative to current streak date)
      const diffDays = Math.floor((currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays === 0) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else if (diffDays === 1) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break // Streak broken
      }
    }

    return streak
  }
}

export const analyticsService = new AnalyticsService()
