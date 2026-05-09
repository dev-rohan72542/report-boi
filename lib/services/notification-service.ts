import { localDB } from '../database/local-db'

export interface NotificationPreferences {
  enabled: boolean
  reminderTime: string // HH:MM format
  skipWeekends: boolean
  skipIfEntryExists: boolean
}

export interface NotificationEvent {
  id: string
  type: 'daily_reminder' | 'milestone' | 'streak'
  title: string
  message: string
  timestamp: number
  read: boolean
}

export class NotificationService {
  private isBrowser = typeof window !== 'undefined'
  private prefsKey = 'notification_prefs'
  private eventsKey = 'notification_events'
  private defaultPrefs: NotificationPreferences = {
    enabled: true,
    reminderTime: '08:00',
    skipWeekends: false,
    skipIfEntryExists: true
  }

  /**
   * Request notification permission from the user
   */
  async requestPermission(): Promise<boolean> {
    if (!this.isBrowser || !('Notification' in window)) {
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }

  /**
   * Show a notification
   */
  async showNotification(title: string, options?: NotificationOptions): Promise<void> {
    if (!this.isBrowser || !('Notification' in window)) {
      return
    }

    if (Notification.permission === 'granted') {
      new Notification(title, {
        icon: '/icon.png',
        ...options
      })
    }
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<NotificationPreferences> {
    if (!this.isBrowser) return this.defaultPrefs

    try {
      const stored = localStorage.getItem(this.prefsKey)
      return stored ? JSON.parse(stored) : this.defaultPrefs
    } catch (error) {
      console.error('[v0] Error getting notification prefs:', error)
      return this.defaultPrefs
    }
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(prefs: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    if (!this.isBrowser) return this.defaultPrefs

    const current = await this.getPreferences()
    const updated = { ...current, ...prefs }

    localStorage.setItem(this.prefsKey, JSON.stringify(updated))
    return updated
  }

  /**
   * Check if daily reminder should be sent
   */
  async shouldSendDailyReminder(): Promise<boolean> {
    if (!this.isBrowser || !localDB) {
      return false
    }

    try {
      const prefs = await this.getPreferences()

      if (!prefs.enabled) return false

      // Check skip weekends
      if (prefs.skipWeekends) {
        const today = new Date()
        const dayOfWeek = today.getDay()
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          return false
        }
      }

      // Check if entry already exists for today
      if (prefs.skipIfEntryExists) {
        const today = new Date().toISOString().split('T')[0]
        const allEntries = await localDB.daily_entries.toArray()
        const todayEntry = allEntries.some(e => e.entry_date.startsWith(today))
        if (todayEntry) {
          return false
        }
      }

      // Check if current time is past reminder time
      const [remHour, remMin] = prefs.reminderTime.split(':').map(Number)
      const now = new Date()
      const remTime = new Date()
      remTime.setHours(remHour, remMin, 0, 0)

      return now >= remTime
    } catch (error) {
      console.error('[v0] Error checking reminder condition:', error)
      return false
    }
  }

  /**
   * Send daily reminder notification
   */
  async sendDailyReminder(): Promise<void> {
    const shouldSend = await this.shouldSendDailyReminder()

    if (shouldSend) {
      await this.showNotification('এন্ট্রি সময়', {
        body: 'আজকের এন্ট্রি পূরণ করুন!',
        tag: 'daily-reminder',
        requireInteraction: false
      })

      this.logNotificationEvent({
        type: 'daily_reminder',
        title: 'দৈনিক অনুস্মারক',
        message: 'আজকের এন্ট্রি পূরণ করুন!'
      })
    }
  }

  /**
   * Send milestone notification
   */
  async sendMilestoneNotification(milestone: number, message: string): Promise<void> {
    await this.showNotification(`${milestone} দিন মাইলস্টোন!`, {
      body: message,
      tag: `milestone-${milestone}`,
      requireInteraction: true
    })

    this.logNotificationEvent({
      type: 'milestone',
      title: `${milestone} দিন সম্পূর্ণ!`,
      message
    })
  }

  /**
   * Send streak notification
   */
  async sendStreakNotification(streak: number): Promise<void> {
    const messages = {
      1: 'আপনার ধারাবাহিকতা শুরু হয়েছে!',
      3: 'দুর্দান্ত! ৩ দিন ধারাবাহিক!',
      7: 'চমৎকার! এক সপ্তাহ সম্পূর্ণ!',
      14: 'অসাধারণ! দুই সপ্তাহ অর্জন!',
      30: 'অবিশ্বাস্য! পুরো মাস!',
      100: 'কিংবদন্তি! শত দিন!'
    }

    const msg = messages[streak as keyof typeof messages] || `${streak} দিনের ধারাবাহিক!`

    await this.showNotification('ধারাবাহিকতা বজায় রাখুন!', {
      body: msg,
      tag: `streak-${streak}`,
      requireInteraction: false
    })

    this.logNotificationEvent({
      type: 'streak',
      title: `${streak} দিনের ধারাবাহিক!`,
      message: msg
    })
  }

  /**
   * Get notification history
   */
  async getNotificationHistory(): Promise<NotificationEvent[]> {
    if (!this.isBrowser) return []

    try {
      const stored = localStorage.getItem(this.eventsKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('[v0] Error getting notification history:', error)
      return []
    }
  }

  /**
   * Clear old notification events
   */
  async clearOldNotifications(olderThanDays: number = 30): Promise<void> {
    if (!this.isBrowser) return

    try {
      const cutoffTime = Date.now() - (olderThanDays * 24 * 60 * 60 * 1000)
      const events = await this.getNotificationHistory()
      const filtered = events.filter(e => e.timestamp > cutoffTime)
      localStorage.setItem(this.eventsKey, JSON.stringify(filtered))
    } catch (error) {
      console.error('[v0] Error clearing notifications:', error)
    }
  }

  // ---- Private helper methods ----

  private logNotificationEvent(event: Omit<NotificationEvent, 'id' | 'timestamp' | 'read'>): void {
    if (!this.isBrowser) return

    try {
      const events = this.getNotificationHistorySync()
      const newEvent: NotificationEvent = {
        ...event,
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        read: false
      }

      events.push(newEvent)
      localStorage.setItem(this.eventsKey, JSON.stringify(events))
    } catch (error) {
      console.error('[v0] Error logging notification:', error)
    }
  }

  private getNotificationHistorySync(): NotificationEvent[] {
    if (!this.isBrowser) return []

    try {
      const stored = localStorage.getItem(this.eventsKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('[v0] Error reading notification history:', error)
      return []
    }
  }
}

export const notificationService = new NotificationService()
