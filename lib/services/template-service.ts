import { localDB } from '../database/local-db'
import { DailyEntryData } from './hybrid-data-service'

export interface EntryTemplate {
  id: string
  name: string
  description?: string
  data: Partial<DailyEntryData>
  isDefault?: boolean
  createdAt: number
  updatedAt: number
}

export class TemplateService {
  private isBrowser = typeof window !== 'undefined'
  private storageKey = 'entry_templates'

  /**
   * Save a template from current form data
   */
  async saveTemplate(
    name: string,
    formData: Partial<DailyEntryData>,
    description?: string
  ): Promise<EntryTemplate> {
    const template: EntryTemplate = {
      id: crypto.randomUUID(),
      name,
      description,
      data: formData,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }

    if (this.isBrowser) {
      const templates = this.getTemplatesSync()
      templates.push(template)
      localStorage.setItem(this.storageKey, JSON.stringify(templates))
    }

    return template
  }

  /**
   * Get all saved templates
   */
  async getTemplates(): Promise<EntryTemplate[]> {
    if (!this.isBrowser) return []
    return this.getTemplatesSync()
  }

  /**
   * Get a specific template by ID
   */
  async getTemplate(id: string): Promise<EntryTemplate | null> {
    const templates = await this.getTemplates()
    return templates.find(t => t.id === id) || null
  }

  /**
   * Update an existing template
   */
  async updateTemplate(id: string, updates: Partial<EntryTemplate>): Promise<EntryTemplate | null> {
    if (!this.isBrowser) return null

    const templates = this.getTemplatesSync()
    const index = templates.findIndex(t => t.id === id)

    if (index === -1) return null

    const updated = {
      ...templates[index],
      ...updates,
      id: templates[index].id, // Preserve ID
      updatedAt: Date.now()
    }

    templates[index] = updated
    localStorage.setItem(this.storageKey, JSON.stringify(templates))

    return updated
  }

  /**
   * Delete a template
   */
  async deleteTemplate(id: string): Promise<boolean> {
    if (!this.isBrowser) return false

    const templates = this.getTemplatesSync()
    const filtered = templates.filter(t => t.id !== id)

    if (filtered.length === templates.length) return false

    localStorage.setItem(this.storageKey, JSON.stringify(filtered))
    return true
  }

  /**
   * Get average values from entry history (for "Use Average" feature)
   */
  async getAverageTemplate(): Promise<Partial<DailyEntryData>> {
    if (!this.isBrowser || !localDB) return {}

    try {
      const allEntries = await localDB.daily_entries.toArray()
      
      if (allEntries.length === 0) return {}

      // Calculate averages for all numeric fields
      const averages: Partial<DailyEntryData> = {}
      const fields = this.getAllDataFields()

      for (const field of fields) {
        const values = allEntries
          .map(e => e[field as keyof Omit<DailyEntryData, 'user_id' | 'entry_date'>] as number)
          .filter(v => typeof v === 'number')

        if (values.length > 0) {
          const avg = Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10
          averages[field as keyof DailyEntryData] = avg
        }
      }

      return averages
    } catch (error) {
      console.error('[v0] Error calculating average template:', error)
      return {}
    }
  }

  /**
   * Get yesterday's entry as a template
   */
  async getYesterdayTemplate(): Promise<Partial<DailyEntryData> | null> {
    if (!this.isBrowser || !localDB) return null

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
        // Remove system fields
        const { id, sync_status, created_at, updated_at, ...data } = yesterdayEntry
        return data
      }

      return null
    } catch (error) {
      console.error('[v0] Error fetching yesterday template:', error)
      return null
    }
  }

  /**
   * Create a template at 50% of average
   */
  async getHalfAverageTemplate(): Promise<Partial<DailyEntryData>> {
    const average = await this.getAverageTemplate()
    const halfAverage: Partial<DailyEntryData> = {}

    for (const [key, value] of Object.entries(average)) {
      if (typeof value === 'number') {
        halfAverage[key as keyof DailyEntryData] = Math.ceil(value / 2)
      }
    }

    return halfAverage
  }

  /**
   * Get default template (average values)
   */
  async getDefaultTemplate(): Promise<EntryTemplate> {
    const data = await this.getAverageTemplate()
    return {
      id: 'default',
      name: 'গড় মান',
      description: 'আপনার গড় এন্ট্রি মান',
      data,
      isDefault: true,
      createdAt: 0,
      updatedAt: 0
    }
  }

  // ---- Private helper methods ----

  private getTemplatesSync(): EntryTemplate[] {
    if (!this.isBrowser) return []

    try {
      const stored = localStorage.getItem(this.storageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('[v0] Error parsing templates:', error)
      return []
    }
  }

  private getAllDataFields(): string[] {
    return [
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
  }
}

export const templateService = new TemplateService()
