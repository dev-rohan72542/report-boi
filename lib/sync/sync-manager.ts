import { localDB, LocalDailyEntry, LocalGoal, LocalProfile } from '../database/local-db';
import { createClient } from '../supabase/client';

export interface SyncResult {
  success: boolean;
  syncedEntries: number;
  syncedGoals: number;
  syncedProfiles: number;
  errors: string[];
}

export class SyncManager {
  private supabase = createClient();
  private isOnline = true;
  private syncInProgress = false;
  private syncInterval: NodeJS.Timeout | null = null;
  private isBrowser = typeof window !== 'undefined';

  constructor() {
    // Only initialize in browser environment
    if (this.isBrowser) {
      this.initializeNetworkListener();
      this.startPeriodicSync();
    }
  }

  private initializeNetworkListener() {
    // Listen for network changes
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        this.isOnline = true;
        this.syncPendingData();
      });

      window.addEventListener('offline', () => {
        this.isOnline = false;
      });
    }
  }

  private startPeriodicSync() {
    // Sync every 5 minutes when online
    this.syncInterval = setInterval(() => {
      if (this.isOnline && !this.syncInProgress) {
        this.syncPendingData();
      }
    }, 5 * 60 * 1000);
  }

  async syncPendingData(): Promise<SyncResult> {
    if (!this.isBrowser || this.syncInProgress || !this.isOnline || !localDB) {
      return {
        success: false,
        syncedEntries: 0,
        syncedGoals: 0,
        syncedProfiles: 0,
        errors: ['Sync already in progress, offline, not in browser environment, or localDB not available']
      };
    }
    
    this.syncInProgress = true;
    const result: SyncResult = {
      success: true,
      syncedEntries: 0,
      syncedGoals: 0,
      syncedProfiles: 0,
      errors: []
    };
    
    try {
      // Sync daily entries
      const entryResult = await this.syncDailyEntries();
      result.syncedEntries = entryResult.synced;
      result.errors.push(...entryResult.errors);

      // Sync goals
      const goalResult = await this.syncGoals();
      result.syncedGoals = goalResult.synced;
      result.errors.push(...goalResult.errors);

      // Sync profiles
      const profileResult = await this.syncProfiles();
      result.syncedProfiles = profileResult.synced;
      result.errors.push(...profileResult.errors);

      // Clear sync queue if everything was successful
      if (result.errors.length === 0) {
        await localDB.clearSyncQueue();
      }

    } catch (error) {
      console.error('Sync failed:', error);
      result.success = false;
      result.errors.push(`Sync failed: ${error}`);
    } finally {
      this.syncInProgress = false;
    }

    return result;
  }

  private async syncDailyEntries(): Promise<{ synced: number; errors: string[] }> {
    const pendingEntries = await localDB.getPendingSyncEntries();
    const errors: string[] = [];
    let synced = 0;

    for (const entry of pendingEntries) {
      try {
        // Remove sync metadata before sending to server
        const { sync_status, last_modified, ...entryData } = entry;
        
        const { data, error } = await this.supabase
          .from('daily_entries')
          .upsert(entryData, { onConflict: 'user_id,entry_date' });

        if (error) {
          errors.push(`Entry ${entry.entry_date}: ${error.message}`);
          // Mark as error for retry
          await localDB.daily_entries
            .where('id')
            .equals(entry.id!)
            .modify({ sync_status: 'error' });
        } else {
          // Mark as synced
          await localDB.daily_entries
            .where('id')
            .equals(entry.id!)
            .modify({ 
              sync_status: 'synced',
              last_modified: Date.now()
            });
          synced++;
        }
      } catch (error) {
        errors.push(`Entry ${entry.entry_date}: ${error}`);
        await localDB.daily_entries
          .where('id')
          .equals(entry.id!)
          .modify({ sync_status: 'error' });
      }
    }

    return { synced, errors };
  }

  private async syncGoals(): Promise<{ synced: number; errors: string[] }> {
    const pendingGoals = await localDB.getPendingSyncGoals();
    const errors: string[] = [];
    let synced = 0;

    for (const goal of pendingGoals) {
      try {
        const { sync_status, last_modified, ...goalData } = goal;
        
        const { data, error } = await this.supabase
          .from('goals')
          .upsert(goalData, { onConflict: 'id' });

        if (error) {
          errors.push(`Goal ${goal.id}: ${error.message}`);
          await localDB.goals
            .where('id')
            .equals(goal.id!)
            .modify({ sync_status: 'error' });
        } else {
          await localDB.goals
            .where('id')
            .equals(goal.id!)
            .modify({ 
              sync_status: 'synced',
              last_modified: Date.now()
            });
          synced++;
        }
      } catch (error) {
        errors.push(`Goal ${goal.id}: ${error}`);
        await localDB.goals
          .where('id')
          .equals(goal.id!)
          .modify({ sync_status: 'error' });
      }
    }

    return { synced, errors };
  }

  private async syncProfiles(): Promise<{ synced: number; errors: string[] }> {
    const pendingProfiles = await localDB.getPendingSyncProfiles();
    const errors: string[] = [];
    let synced = 0;

    for (const profile of pendingProfiles) {
      try {
        const { sync_status, last_modified, ...profileData } = profile;
        
        const { data, error } = await this.supabase
          .from('profiles')
          .upsert(profileData, { onConflict: 'id' });

        if (error) {
          errors.push(`Profile ${profile.id}: ${error.message}`);
          await localDB.profiles
            .where('id')
            .equals(profile.id)
            .modify({ sync_status: 'error' });
        } else {
          await localDB.profiles
            .where('id')
            .equals(profile.id)
            .modify({ 
              sync_status: 'synced',
              last_modified: Date.now()
            });
          synced++;
        }
      } catch (error) {
        errors.push(`Profile ${profile.id}: ${error}`);
        await localDB.profiles
          .where('id')
          .equals(profile.id)
          .modify({ sync_status: 'error' });
      }
    }

    return { synced, errors };
  }

  // Pull data from server to local database
  async pullFromServer(userId: string): Promise<SyncResult> {
    if (!this.isOnline) {
      return {
        success: false,
        syncedEntries: 0,
        syncedGoals: 0,
        syncedProfiles: 0,
        errors: ['Cannot pull data while offline']
      };
    }

    const result: SyncResult = {
      success: true,
      syncedEntries: 0,
      syncedGoals: 0,
      syncedProfiles: 0,
      errors: []
    };

    try {
      // Pull daily entries
      const { data: entries, error: entriesError } = await this.supabase
        .from('daily_entries')
        .select('*')
        .eq('user_id', userId);

      if (entriesError) {
        result.errors.push(`Failed to pull entries: ${entriesError.message}`);
      } else if (entries) {
        for (const entry of entries) {
          await this.mergeEntry(entry);
          result.syncedEntries++;
        }
      }

      // Pull goals
      const { data: goals, error: goalsError } = await this.supabase
        .from('goals')
        .select('*')
        .eq('user_id', userId);

      if (goalsError) {
        result.errors.push(`Failed to pull goals: ${goalsError.message}`);
      } else if (goals) {
        for (const goal of goals) {
          await this.mergeGoal(goal);
          result.syncedGoals++;
        }
      }

      // Pull profile
      const { data: profile, error: profileError } = await this.supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (profileError) {
        result.errors.push(`Failed to pull profile: ${profileError.message}`);
      } else if (profile) {
        await this.mergeProfile(profile);
        result.syncedProfiles++;
      }

    } catch (error) {
      result.success = false;
      result.errors.push(`Pull failed: ${error}`);
    }

    return result;
  }

  private async mergeEntry(serverEntry: any): Promise<void> {
    const localEntry = await localDB.getDailyEntry(serverEntry.user_id, serverEntry.entry_date);
    
    if (!localEntry) {
      // New entry from server
      await localDB.daily_entries.add({
        ...serverEntry,
        sync_status: 'synced',
        last_modified: Date.now()
      });
    } else if (localEntry.last_modified < new Date(serverEntry.updated_at).getTime()) {
      // Server entry is newer
      await localDB.daily_entries
        .where('id')
        .equals(localEntry.id!)
        .modify({
          ...serverEntry,
          sync_status: 'synced',
          last_modified: Date.now()
        });
    }
  }

  private async mergeGoal(serverGoal: any): Promise<void> {
    const localGoal = await localDB.goals
      .where('id')
      .equals(serverGoal.id)
      .first();
    
    if (!localGoal) {
      // New goal from server
      await localDB.goals.add({
        ...serverGoal,
        sync_status: 'synced',
        last_modified: Date.now()
      });
    } else if (localGoal.last_modified < new Date(serverGoal.updated_at).getTime()) {
      // Server goal is newer
      await localDB.goals
        .where('id')
        .equals(localGoal.id!)
        .modify({
          ...serverGoal,
          sync_status: 'synced',
          last_modified: Date.now()
        });
    }
  }

  private async mergeProfile(serverProfile: any): Promise<void> {
    const localProfile = await localDB.getProfile(serverProfile.id);
    
    if (!localProfile) {
      // New profile from server
      await localDB.profiles.add({
        ...serverProfile,
        sync_status: 'synced',
        last_modified: Date.now()
      });
    } else if (localProfile.last_modified < new Date(serverProfile.updated_at).getTime()) {
      // Server profile is newer
      await localDB.profiles
        .where('id')
        .equals(localProfile.id)
        .modify({
          ...serverProfile,
          sync_status: 'synced',
          last_modified: Date.now()
        });
    }
  }

  // Force sync all data
  async forceSync(userId: string): Promise<SyncResult> {
    const pullResult = await this.pullFromServer(userId);
    const pushResult = await this.syncPendingData();
    
    return {
      success: pullResult.success && pushResult.success,
      syncedEntries: pullResult.syncedEntries + pushResult.syncedEntries,
      syncedGoals: pullResult.syncedGoals + pushResult.syncedGoals,
      syncedProfiles: pullResult.syncedProfiles + pushResult.syncedProfiles,
      errors: [...pullResult.errors, ...pushResult.errors]
    };
  }

  // Get sync status
  async getSyncStatus(): Promise<{
    isOnline: boolean;
    syncInProgress: boolean;
    pendingEntries: number;
    pendingGoals: number;
    pendingProfiles: number;
    lastSync: number | null;
  }> {
    if (!this.isBrowser || !localDB) {
      return {
        isOnline: false,
        syncInProgress: false,
        pendingEntries: 0,
        pendingGoals: 0,
        pendingProfiles: 0,
        lastSync: null
      };
    }

    const pendingEntries = await localDB.daily_entries
      .where('sync_status')
      .equals('pending')
      .count();
    
    const pendingGoals = await localDB.goals
      .where('sync_status')
      .equals('pending')
      .count();
    
    const pendingProfiles = await localDB.profiles
      .where('sync_status')
      .equals('pending')
      .count();

    return {
      isOnline: this.isOnline,
      syncInProgress: this.syncInProgress,
      pendingEntries,
      pendingGoals,
      pendingProfiles,
      lastSync: null // TODO: Implement last sync tracking
    };
  }

  // Cleanup
  destroy() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }
  }
}

// Export singleton instance - only create in browser environment
const isBrowser = typeof window !== 'undefined';
export const syncManager = isBrowser ? new SyncManager() : null as any;
