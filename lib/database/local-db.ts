import Dexie, { Table } from 'dexie';

// Check if we're in a browser environment
const isBrowser = typeof window !== 'undefined' && typeof window.indexedDB !== 'undefined';

// Types for local database
export interface LocalDailyEntry {
  id?: string;
  user_id: string;
  entry_date: string;
  
  // Quran and Islamic Studies (in minutes)
  quran_memorization: number;
  quran_study: number;
  hadith_study: number;
  islamic_literature: number;
  other_literature: number;
  
  // Work Hours (in minutes)
  online_work: number;
  offline_work: number;
  
  // Skills Development (in minutes)
  skill_lessons: number;
  skill_practice: number;
  skill_projects: number;
  
  // Physical Exercise (count)
  pull_ups: number;
  push_ups: number;
  squats: number;
  
  // Religious Practice (count)
  prayers_in_congregation: number;
  classes_attended: number;
  
  // Communication (count of interactions)
  communication_members: number;
  communication_companions: number;
  communication_workers: number;
  communication_relations: number;
  communication_friends: number;
  communication_talented_students: number;
  communication_well_wishers: number;
  communication_mahram: number;
  
  // Distribution Activities (count)
  literature_distribution: number;
  magazine_distribution: number;
  sticker_card_distribution: number;
  gift_distribution: number;
  
  // Responsibilities (in minutes)
  dawati_responsibilities: number;
  other_responsibilities: number;
  
  // Personal Development (in minutes)
  newspaper_reading: number;
  self_criticism: number;
  
  // Sync metadata
  sync_status: 'pending' | 'synced' | 'error';
  last_modified: number;
  created_at: string;
  updated_at: string;
}

export interface LocalGoal {
  id?: string;
  user_id: string;
  category: string;
  target_value: number;
  target_period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  is_active: boolean;
  
  // Sync metadata
  sync_status: 'pending' | 'synced' | 'error';
  last_modified: number;
  created_at: string;
  updated_at: string;
}

export interface SyncQueueItem {
  id: string;
  table: 'daily_entries' | 'goals';
  action: 'create' | 'update' | 'delete';
  data: any;
  created_at: number;
}

export interface LocalProfile {
  id: string;
  full_name?: string;
  sync_status: 'pending' | 'synced' | 'error';
  last_modified: number;
  created_at: string;
  updated_at: string;
}

// Local Database class using Dexie
export class LocalDatabase extends Dexie {
  daily_entries!: Table<LocalDailyEntry>;
  goals!: Table<LocalGoal>;
  profiles!: Table<LocalProfile>;
  sync_queue!: Table<SyncQueueItem>;

  constructor() {
    super('ReportTrackerDB');
    
    // Only initialize database if we're in a browser environment
    if (isBrowser) {
      this.version(2).stores({
        daily_entries: 'id, [user_id+entry_date], user_id, entry_date, sync_status, last_modified',
        goals: 'id, user_id, sync_status, last_modified',
        profiles: 'id, sync_status, last_modified',
        sync_queue: 'id, table, action, created_at'
      });
    }
  }

  // Helper methods for daily entries
  async getDailyEntry(userId: string, entryDate: string): Promise<LocalDailyEntry | undefined> {
    if (!isBrowser) return undefined;
    return await this.daily_entries
      .where(['user_id', 'entry_date'])
      .equals([userId, entryDate])
      .first();
  }

  async getDailyEntriesByDateRange(userId: string, startDate: string, endDate: string): Promise<LocalDailyEntry[]> {
    if (!isBrowser) return [];
    return await this.daily_entries
      .where('user_id')
      .equals(userId)
      .filter(entry => entry.entry_date >= startDate && entry.entry_date <= endDate)
      .toArray();
  }

  async getPendingSyncEntries(): Promise<LocalDailyEntry[]> {
    if (!isBrowser) return [];
    return await this.daily_entries
      .where('sync_status')
      .equals('pending')
      .toArray();
  }

  // Helper methods for goals
  async getActiveGoals(userId: string): Promise<LocalGoal[]> {
    if (!isBrowser) return [];
    return await this.goals
      .where('user_id')
      .equals(userId)
      .filter(goal => goal.is_active)
      .toArray();
  }

  async getPendingSyncGoals(): Promise<LocalGoal[]> {
    if (!isBrowser) return [];
    return await this.goals
      .where('sync_status')
      .equals('pending')
      .toArray();
  }

  // Helper methods for sync queue
  async addToSyncQueue(table: string, action: string, data: any): Promise<void> {
    if (!isBrowser) return;
    const queueItem: SyncQueueItem = {
      id: crypto.randomUUID(),
      table: table as 'daily_entries' | 'goals',
      action: action as 'create' | 'update' | 'delete',
      data,
      created_at: Date.now()
    };
    
    await this.sync_queue.add(queueItem);
  }

  async getSyncQueue(): Promise<SyncQueueItem[]> {
    if (!isBrowser) return [];
    return await this.sync_queue
      .orderBy('created_at')
      .toArray();
  }

  async clearSyncQueue(): Promise<void> {
    if (!isBrowser) return;
    await this.sync_queue.clear();
  }

  // Helper methods for profiles
  async getProfile(userId: string): Promise<LocalProfile | undefined> {
    if (!isBrowser) return undefined;
    return await this.profiles
      .where('id')
      .equals(userId)
      .first();
  }

  async getPendingSyncProfiles(): Promise<LocalProfile[]> {
    if (!isBrowser) return [];
    return await this.profiles
      .where('sync_status')
      .equals('pending')
      .toArray();
  }

  // Utility methods
  async clearAllData(): Promise<void> {
    if (!isBrowser) return;
    await this.daily_entries.clear();
    await this.goals.clear();
    await this.profiles.clear();
    await this.sync_queue.clear();
  }

  async getDatabaseSize(): Promise<number> {
    if (!isBrowser) return 0;
    const entries = await this.daily_entries.count();
    const goals = await this.goals.count();
    const profiles = await this.profiles.count();
    const queue = await this.sync_queue.count();
    
    return entries + goals + profiles + queue;
  }
}

// Export singleton instance - only create in browser environment
export const localDB = isBrowser ? new LocalDatabase() : null as any;

// Export types for use in other files
export type { LocalDailyEntry, LocalGoal, LocalProfile, SyncQueueItem };
