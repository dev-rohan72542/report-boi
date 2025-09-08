import { localDB, LocalDailyEntry, LocalGoal, LocalProfile } from '../database/local-db';
import { createClient } from '../supabase/client';
import { syncManager, SyncResult } from '../sync/sync-manager';

export interface DailyEntryData {
  user_id: string;
  entry_date: string;
  quran_memorization: number;
  quran_study: number;
  hadith_study: number;
  islamic_literature: number;
  other_literature: number;
  online_work: number;
  offline_work: number;
  skill_lessons: number;
  skill_practice: number;
  skill_projects: number;
  pull_ups: number;
  push_ups: number;
  squats: number;
  prayers_in_congregation: number;
  classes_attended: number;
  communication_members: number;
  communication_companions: number;
  communication_workers: number;
  communication_relations: number;
  communication_friends: number;
  communication_talented_students: number;
  communication_well_wishers: number;
  communication_mahram: number;
  literature_distribution: number;
  magazine_distribution: number;
  sticker_card_distribution: number;
  gift_distribution: number;
  dawati_responsibilities: number;
  other_responsibilities: number;
  newspaper_reading: number;
  self_criticism: number;
}

export interface GoalData {
  user_id: string;
  category: string;
  target_value: number;
  target_period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  start_date: string;
  end_date?: string;
  is_active: boolean;
}

export interface ProfileData {
  id: string;
  full_name?: string;
}

export class HybridDataService {
  private supabase = createClient();
  private isBrowser = typeof window !== 'undefined';

  // Daily Entries
  async saveDailyEntry(entryData: DailyEntryData): Promise<LocalDailyEntry> {
    const entryWithSync: LocalDailyEntry = {
      ...entryData,
      id: crypto.randomUUID(),
      sync_status: 'pending',
      last_modified: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    // Save locally first if in browser
    if (this.isBrowser && localDB) {
      await localDB.daily_entries.put(entryWithSync);

      // Try to sync immediately if online
      if (navigator.onLine && syncManager) {
        await syncManager.syncPendingData();
      }
    } else {
      // Return the entry without saving if not in browser environment
      return entryWithSync;
    }

    return entryWithSync;
  }

  async updateDailyEntry(entryId: string, updates: Partial<DailyEntryData>): Promise<LocalDailyEntry> {
    if (!this.isBrowser || !localDB) {
      throw new Error('Not available in server environment');
    }

    const existingEntry = await localDB.daily_entries.get(entryId);
    if (!existingEntry) {
      throw new Error('Entry not found');
    }

    const updatedEntry: LocalDailyEntry = {
      ...existingEntry,
      ...updates,
      sync_status: 'pending',
      last_modified: Date.now(),
      updated_at: new Date().toISOString()
    };

    await localDB.daily_entries.put(updatedEntry);

    if (navigator.onLine && syncManager) {
      await syncManager.syncPendingData();
    }

    return updatedEntry;
  }

  async getDailyEntry(userId: string, entryDate: string): Promise<LocalDailyEntry | null> {
    if (!this.isBrowser || !localDB) {
      return null;
    }

    // Try to get from local first
    let entry = await localDB.getDailyEntry(userId, entryDate);

    // If online, try to sync and get latest
    if (navigator.onLine && syncManager) {
      try {
        await syncManager.syncPendingData();
        
        // Fetch from server and merge
        const { data: serverEntry } = await this.supabase
          .from('daily_entries')
          .select('*')
          .eq('user_id', userId)
          .eq('entry_date', entryDate)
          .single();

        if (serverEntry) {
          entry = await this.mergeEntry(entry, serverEntry);
        }
      } catch (error) {
        console.warn('Sync failed during getDailyEntry:', error);
      }
    }

    return entry || null;
  }

  async getDailyEntries(userId: string, startDate?: string, endDate?: string): Promise<LocalDailyEntry[]> {
    if (!this.isBrowser || !localDB) {
      return [];
    }

    // Try to get from local first
    let localEntries = await localDB.daily_entries
      .where('user_id')
      .equals(userId)
      .toArray();

    // If online, try to sync and get latest
    if (navigator.onLine && syncManager) {
      try {
        await syncManager.syncPendingData();
        
        // Fetch from server and merge
        const { data: serverEntries } = await this.supabase
          .from('daily_entries')
          .select('*')
          .eq('user_id', userId)
          .gte('entry_date', startDate || '2020-01-01')
          .lte('entry_date', endDate || new Date().toISOString().split('T')[0]);

        localEntries = this.mergeEntries(localEntries, serverEntries || []);
      } catch (error) {
        console.warn('Sync failed during getDailyEntries:', error);
      }
    }

    // Filter by date range if specified
    if (startDate || endDate) {
      localEntries = localEntries.filter(entry => {
        if (startDate && entry.entry_date < startDate) return false;
        if (endDate && entry.entry_date > endDate) return false;
        return true;
      });
    }

    return localEntries.sort((a, b) => 
      new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime()
    );
  }

  async deleteDailyEntry(entryId: string): Promise<void> {
    if (!this.isBrowser || !localDB) {
      return;
    }

    await localDB.daily_entries.delete(entryId);
    
    // Add to sync queue for server deletion
    await localDB.addToSyncQueue('daily_entries', 'delete', { id: entryId });
    
    if (navigator.onLine && syncManager) {
      try {
        await syncManager.syncPendingData();
      } catch (error) {
        console.warn('Sync failed during deleteDailyEntry:', error);
      }
    }
  }

  // Goals
  async saveGoal(goalData: GoalData): Promise<LocalGoal> {
    const goalWithSync: LocalGoal = {
      ...goalData,
      id: crypto.randomUUID(),
      sync_status: 'pending',
      last_modified: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (this.isBrowser && localDB) {
      await localDB.goals.put(goalWithSync);

      if (navigator.onLine && syncManager) {
        try {
          await syncManager.syncPendingData();
        } catch (error) {
          console.warn('Sync failed during saveGoal:', error);
        }
      }
    }

    return goalWithSync;
  }

  async updateGoal(goalId: string, updates: Partial<GoalData>): Promise<LocalGoal> {
    if (!this.isBrowser || !localDB) {
      throw new Error('Not available in server environment');
    }

    const existingGoal = await localDB.goals.get(goalId);
    if (!existingGoal) {
      throw new Error('Goal not found');
    }

    const updatedGoal: LocalGoal = {
      ...existingGoal,
      ...updates,
      sync_status: 'pending',
      last_modified: Date.now(),
      updated_at: new Date().toISOString()
    };

    await localDB.goals.put(updatedGoal);

    if (navigator.onLine && syncManager) {
      try {
        await syncManager.syncPendingData();
      } catch (error) {
        console.warn('Sync failed during updateGoal:', error);
      }
    }

    return updatedGoal;
  }

  async getGoals(userId: string, activeOnly: boolean = true): Promise<LocalGoal[]> {
    if (!this.isBrowser || !localDB) {
      return [];
    }

    let localGoals = await localDB.goals
      .where('user_id')
      .equals(userId)
      .toArray();

    if (navigator.onLine && syncManager) {
      try {
        await syncManager.syncPendingData();
        
        const { data: serverGoals } = await this.supabase
          .from('goals')
          .select('*')
          .eq('user_id', userId);

        localGoals = this.mergeGoals(localGoals, serverGoals || []);
      } catch (error) {
        console.warn('Sync failed during getGoals:', error);
      }
    }

    if (activeOnly) {
      localGoals = localGoals.filter(goal => goal.is_active);
    }

    return localGoals.sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }

  async deleteGoal(goalId: string): Promise<void> {
    if (!this.isBrowser || !localDB) {
      return;
    }

    await localDB.goals.delete(goalId);
    
    await localDB.addToSyncQueue('goals', 'delete', { id: goalId });
    
    if (navigator.onLine && syncManager) {
      try {
        await syncManager.syncPendingData();
      } catch (error) {
        console.warn('Sync failed during deleteGoal:', error);
      }
    }
  }

  // Profiles
  async saveProfile(profileData: ProfileData): Promise<LocalProfile> {
    const profileWithSync: LocalProfile = {
      ...profileData,
      sync_status: 'pending',
      last_modified: Date.now(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (this.isBrowser && localDB) {
      await localDB.profiles.put(profileWithSync);

      if (navigator.onLine && syncManager) {
        try {
          await syncManager.syncPendingData();
        } catch (error) {
          console.warn('Sync failed during saveProfile:', error);
        }
      }
    }

    return profileWithSync;
  }

  async getProfile(userId: string): Promise<LocalProfile | null> {
    if (!this.isBrowser || !localDB) {
      return null;
    }

    let profile = await localDB.getProfile(userId);

    if (navigator.onLine && syncManager) {
      try {
        await syncManager.syncPendingData();
        
        const { data: serverProfile } = await this.supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single();

        if (serverProfile) {
          profile = await this.mergeProfile(profile, serverProfile);
        }
      } catch (error) {
        console.warn('Sync failed during getProfile:', error);
      }
    }

    return profile || null;
  }

  // Sync operations
  async forceSync(userId: string): Promise<SyncResult> {
    if (!this.isBrowser || !syncManager) {
      return {
        success: false,
        syncedEntries: 0,
        syncedGoals: 0,
        syncedProfiles: 0,
        errors: ['Not available in server environment']
      };
    }
    return await syncManager.forceSync(userId);
  }

  async getSyncStatus() {
    if (!this.isBrowser || !syncManager) {
      return {
        isOnline: false,
        syncInProgress: false,
        pendingEntries: 0,
        pendingGoals: 0,
        pendingProfiles: 0,
        lastSync: null
      };
    }
    return await syncManager.getSyncStatus();
  }

  // Utility methods
  async clearLocalData(): Promise<void> {
    if (!this.isBrowser || !localDB) {
      return;
    }
    await localDB.clearAllData();
  }

  async getDatabaseSize(): Promise<number> {
    if (!this.isBrowser || !localDB) {
      return 0;
    }
    return await localDB.getDatabaseSize();
  }

  // Private merge methods
  private async mergeEntry(localEntry: LocalDailyEntry | undefined, serverEntry: any): Promise<LocalDailyEntry> {
    if (!this.isBrowser || !localDB) {
      throw new Error('Not available in server environment');
    }

    if (!localEntry) {
      // New entry from server
      return await localDB.daily_entries.add({
        ...serverEntry,
        sync_status: 'synced',
        last_modified: Date.now()
      });
    } else if (localEntry.last_modified < new Date(serverEntry.updated_at).getTime()) {
      // Server entry is newer
      const mergedEntry = {
        ...localEntry,
        ...serverEntry,
        sync_status: 'synced',
        last_modified: Date.now()
      };
      await localDB.daily_entries.put(mergedEntry);
      return mergedEntry;
    }
    
    return localEntry;
  }

  private mergeEntries(local: LocalDailyEntry[], server: any[]): LocalDailyEntry[] {
    const merged = new Map<string, LocalDailyEntry>();
    
    // Add local entries
    local.forEach(entry => {
      merged.set(entry.entry_date, entry);
    });
    
    // Add/update with server entries (server wins on conflicts)
    server.forEach(entry => {
      const existing = merged.get(entry.entry_date);
      if (!existing || existing.last_modified < new Date(entry.updated_at).getTime()) {
        merged.set(entry.entry_date, {
          ...entry,
          sync_status: 'synced',
          last_modified: Date.now()
        });
      }
    });
    
    return Array.from(merged.values());
  }

  private mergeGoals(local: LocalGoal[], server: any[]): LocalGoal[] {
    const merged = new Map<string, LocalGoal>();
    
    local.forEach(goal => {
      merged.set(goal.id!, goal);
    });
    
    server.forEach(goal => {
      const existing = merged.get(goal.id);
      if (!existing || existing.last_modified < new Date(goal.updated_at).getTime()) {
        merged.set(goal.id, {
          ...goal,
          sync_status: 'synced',
          last_modified: Date.now()
        });
      }
    });
    
    return Array.from(merged.values());
  }

  private async mergeProfile(localProfile: LocalProfile | undefined, serverProfile: any): Promise<LocalProfile> {
    if (!this.isBrowser || !localDB) {
      throw new Error('Not available in server environment');
    }

    if (!localProfile) {
      // New profile from server
      return await localDB.profiles.add({
        ...serverProfile,
        sync_status: 'synced',
        last_modified: Date.now()
      });
    } else if (localProfile.last_modified < new Date(serverProfile.updated_at).getTime()) {
      // Server profile is newer
      const mergedProfile = {
        ...localProfile,
        ...serverProfile,
        sync_status: 'synced',
        last_modified: Date.now()
      };
      await localDB.profiles.put(mergedProfile);
      return mergedProfile;
    }
    
    return localProfile;
  }
}

// Export singleton instance
export const hybridDataService = new HybridDataService();
