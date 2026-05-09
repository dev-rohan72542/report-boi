import { localDB, LocalDailyEntry } from '../database/local-db'

export interface StreakData {
  currentStreak: number
  longestStreak: number
  totalDays: number
  lastEntryDate: string | null
  streakMilestones: number[] // [3, 7, 14, 30, 100, 365]
}

export class StreakService {
  private isBrowser = typeof window !== 'undefined'
  private storageKey = 'streak_milestones'

  /**
   * Calculate current streak and all streak data
   */
  async calculateStreaks(): Promise<StreakData> {
    if (!this.isBrowser || !localDB) {
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalDays: 0,
        lastEntryDate: null,
        streakMilestones: []
      }
    }

    try {
      const allEntries = await localDB.daily_entries.toArray()

      if (allEntries.length === 0) {
        return {
          currentStreak: 0,
          longestStreak: 0,
          totalDays: 0,
          lastEntryDate: null,
          streakMilestones: this.getAchievedMilestones(0)
        }
      }

      // Sort by date descending (most recent first)
      const sorted = allEntries.sort((a, b) => 
        new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
      )

      const currentStreak = this.calculateCurrentStreak(sorted)
      const longestStreak = this.calculateLongestStreak(sorted)
      const totalDays = new Set(allEntries.map(e => e.entry_date)).size
      const lastEntryDate = sorted[0]?.entry_date || null

      return {
        currentStreak,
        longestStreak,
        totalDays,
        lastEntryDate,
        streakMilestones: this.getAchievedMilestones(currentStreak)
      }
    } catch (error) {
      console.error('[v0] Error calculating streaks:', error)
      return {
        currentStreak: 0,
        longestStreak: 0,
        totalDays: 0,
        lastEntryDate: null,
        streakMilestones: []
      }
    }
  }

  /**
   * Check if a milestone was just achieved
   */
  async checkMilestoneAchieved(newStreak: number): Promise<number | null> {
    const milestones = [3, 7, 14, 30, 50, 100, 365]
    const previousStreak = newStreak - 1

    const achieved = milestones.find(m => 
      previousStreak < m && newStreak >= m
    )

    if (achieved) {
      this.recordMilestone(achieved)
    }

    return achieved || null
  }

  /**
   * Get milestone achievement message
   */
  getMilestoneMessage(milestone: number): string {
    const messages: Record<number, string> = {
      3: '3 দিনের চ্যাম্পিয়ন!',
      7: 'এক সপ্তাহ সম্পন্ন!',
      14: 'দুই সপ্তাহ অর্জন!',
      30: 'পুরো মাস সম্পূর্ণ!',
      50: '50 দিন! আশ্চর্যজনক!',
      100: 'শত দিন! আপনি অসাধারণ!',
      365: 'এক বছর! আপনি একটি কিংবদন্তি!'
    }
    return messages[milestone] || `${milestone} দিন অর্জন!`
  }

  // ---- Private helper methods ----

  private calculateCurrentStreak(entries: LocalDailyEntry[]): number {
    if (entries.length === 0) return 0

    let streak = 0
    let currentDate = new Date()
    currentDate.setHours(0, 0, 0, 0)

    for (const entry of entries) {
      const entryDate = new Date(entry.entry_date)
      entryDate.setHours(0, 0, 0, 0)

      const diffDays = Math.floor(
        (currentDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diffDays === 0 || diffDays === 1) {
        streak++
        currentDate.setDate(currentDate.getDate() - 1)
      } else {
        break
      }
    }

    return streak
  }

  private calculateLongestStreak(entries: LocalDailyEntry[]): number {
    if (entries.length === 0) return 0

    const sorted = entries.sort((a, b) => 
      new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime()
    )

    let maxStreak = 1
    let currentStreak = 1

    for (let i = 1; i < sorted.length; i++) {
      const prevDate = new Date(sorted[i - 1].entry_date)
      const currDate = new Date(sorted[i].entry_date)

      const diffDays = Math.floor(
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      )

      if (diffDays === 1) {
        currentStreak++
        maxStreak = Math.max(maxStreak, currentStreak)
      } else if (diffDays > 1) {
        currentStreak = 1
      }
    }

    return maxStreak
  }

  private getAchievedMilestones(currentStreak: number): number[] {
    const allMilestones = [3, 7, 14, 30, 50, 100, 365]
    return allMilestones.filter(m => currentStreak >= m)
  }

  private recordMilestone(milestone: number): void {
    if (!this.isBrowser) return

    try {
      const milestones = this.getRecordedMilestones()
      if (!milestones.includes(milestone)) {
        milestones.push(milestone)
        localStorage.setItem(this.storageKey, JSON.stringify(milestones))
      }
    } catch (error) {
      console.error('[v0] Error recording milestone:', error)
    }
  }

  private getRecordedMilestones(): number[] {
    if (!this.isBrowser) return []

    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('[v0] Error reading milestones:', error)
      return []
    }
  }
}

export const streakService = new StreakService()
