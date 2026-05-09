import type { DailyEntryData } from './hybrid-data-service'

export type RecurrencePattern = 'daily' | 'weekly' | 'monthly'
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday'

export interface RecurringEntry {
  id: string
  name: string
  description?: string
  pattern: RecurrencePattern
  daysOfWeek?: DayOfWeek[] // For weekly pattern
  dayOfMonth?: number // For monthly pattern
  entryData: Partial<DailyEntryData>
  isActive: boolean
  createdAt: number
  updatedAt: number
}

export class RecurringService {
  private isBrowser = typeof window !== 'undefined'
  private storageKey = 'recurring_entries'

  /**
   * Create a new recurring entry
   */
  async createRecurringEntry(
    name: string,
    pattern: RecurrencePattern,
    entryData: Partial<DailyEntryData>,
    options?: {
      description?: string
      daysOfWeek?: DayOfWeek[]
      dayOfMonth?: number
    }
  ): Promise<RecurringEntry> {
    const entry: RecurringEntry = {
      id: crypto.randomUUID(),
      name,
      description: options?.description,
      pattern,
      daysOfWeek: options?.daysOfWeek,
      dayOfMonth: options?.dayOfMonth,
      entryData,
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    if (this.isBrowser) {
      const entries = this.getEntriesSync()
      entries.push(entry)
      localStorage.setItem(this.storageKey, JSON.stringify(entries))
    }

    return entry
  }

  /**
   * Get all recurring entries
   */
  async getRecurringEntries(): Promise<RecurringEntry[]> {
    if (!this.isBrowser) return []
    return this.getEntriesSync()
  }

  /**
   * Get active recurring entries only
   */
  async getActiveRecurringEntries(): Promise<RecurringEntry[]> {
    const entries = await this.getRecurringEntries()
    return entries.filter(e => e.isActive)
  }

  /**
   * Get recurring entries that should be applied today
   */
  async getRecurringEntriesForToday(): Promise<RecurringEntry[]> {
    const activeEntries = await this.getActiveRecurringEntries()
    const today = new Date()
    const dayOfWeek = this.getDayOfWeekName(today)
    const dayOfMonth = today.getDate()

    return activeEntries.filter(entry => {
      if (entry.pattern === 'daily') {
        return true
      }

      if (entry.pattern === 'weekly') {
        return entry.daysOfWeek?.includes(dayOfWeek) || false
      }

      if (entry.pattern === 'monthly') {
        return entry.dayOfMonth === dayOfMonth
      }

      return false
    })
  }

  /**
   * Update a recurring entry
   */
  async updateRecurringEntry(
    id: string,
    updates: Partial<RecurringEntry>
  ): Promise<RecurringEntry | null> {
    if (!this.isBrowser) return null

    const entries = this.getEntriesSync()
    const index = entries.findIndex(e => e.id === id)

    if (index === -1) return null

    const updated = {
      ...entries[index],
      ...updates,
      id: entries[index].id, // Preserve ID
      updatedAt: Date.now()
    }

    entries[index] = updated
    localStorage.setItem(this.storageKey, JSON.stringify(entries))

    return updated
  }

  /**
   * Toggle a recurring entry active/inactive
   */
  async toggleRecurringEntry(id: string): Promise<RecurringEntry | null> {
    const entry = this.getEntriesSync().find(e => e.id === id)
    if (!entry) return null

    return this.updateRecurringEntry(id, { isActive: !entry.isActive })
  }

  /**
   * Delete a recurring entry
   */
  async deleteRecurringEntry(id: string): Promise<boolean> {
    if (!this.isBrowser) return false

    const entries = this.getEntriesSync()
    const filtered = entries.filter(e => e.id !== id)

    if (filtered.length === entries.length) return false

    localStorage.setItem(this.storageKey, JSON.stringify(filtered))
    return true
  }

  /**
   * Get merged data from applicable recurring entries
   */
  async getMergedDataForToday(): Promise<Partial<DailyEntryData>> {
    const todayRecurring = await this.getRecurringEntriesForToday()
    const merged: Partial<DailyEntryData> = {}

    for (const entry of todayRecurring) {
      // Merge all values, later entries override earlier ones
      Object.assign(merged, entry.entryData)
    }

    return merged
  }

  // ---- Private helper methods ----

  private getEntriesSync(): RecurringEntry[] {
    if (!this.isBrowser) return []

    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('[v0] Error parsing recurring entries:', error)
      return []
    }
  }

  private getDayOfWeekName(date: Date): DayOfWeek {
    const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return days[date.getDay()]
  }
}

export const recurringService = new RecurringService()
