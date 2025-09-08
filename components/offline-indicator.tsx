"use client"

import { useState, useEffect } from 'react'
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { hybridDataService } from '@/lib/services/hybrid-data-service'

interface SyncStatus {
  isOnline: boolean;
  syncInProgress: boolean;
  pendingEntries: number;
  pendingGoals: number;
  pendingProfiles: number;
  lastSync: number | null;
}

export function OfflineIndicator() {
  const { toast } = useToast()
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: true,
    syncInProgress: false,
    pendingEntries: 0,
    pendingGoals: 0,
    pendingProfiles: 0,
    lastSync: null
  })
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => {
      setIsOnline(true)
      updateSyncStatus()
    }
    const handleOffline = () => {
      setIsOnline(false)
      setSyncStatus(prev => ({ ...prev, isOnline: false }))
    }
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    
    // Initial sync status
    updateSyncStatus()
    
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  const updateSyncStatus = async () => {
    try {
      const status = await hybridDataService.getSyncStatus()
      setSyncStatus(status)
    } catch (error) {
      console.error('Failed to get sync status:', error)
    }
  }

  const handleManualSync = async () => {
    try {
      // Get current user ID from auth context or localStorage
      const userId = localStorage.getItem('userId') // This should be replaced with proper auth context
      if (!userId) {
        toast({
          title: "ত্রুটি!",
          description: "ব্যবহারকারী আইডি পাওয়া যায়নি।",
          variant: "destructive",
        })
        return
      }

      const result = await hybridDataService.forceSync(userId)
      
      if (result.success) {
        toast({
          title: "সিঙ্ক সফল!",
          description: `${result.syncedEntries} এন্ট্রি, ${result.syncedGoals} লক্ষ্য সিঙ্ক হয়েছে।`,
        })
      } else {
        toast({
          title: "সিঙ্ক ত্রুটি!",
          description: result.errors.join(', '),
          variant: "destructive",
        })
      }
      
      updateSyncStatus()
    } catch (error) {
      toast({
        title: "সিঙ্ক ত্রুটি!",
        description: "ম্যানুয়াল সিঙ্কে সমস্যা হয়েছে।",
        variant: "destructive",
      })
    }
  }

  const totalPending = syncStatus.pendingEntries + syncStatus.pendingGoals + syncStatus.pendingProfiles

  // Don't show indicator if everything is synced and online
  if (isOnline && totalPending === 0 && !syncStatus.syncInProgress) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {/* Online/Offline Status */}
      <Badge 
        variant={isOnline ? "default" : "destructive"} 
        className="flex items-center gap-1"
      >
        {isOnline ? (
          <Wifi className="h-3 w-3" />
        ) : (
          <WifiOff className="h-3 w-3" />
        )}
        {isOnline ? "অনলাইন" : "অফলাইন"}
      </Badge>

      {/* Sync Status */}
      {totalPending > 0 && (
        <Badge 
          variant="secondary" 
          className="flex items-center gap-1"
        >
          {syncStatus.syncInProgress ? (
            <RefreshCw className="h-3 w-3 animate-spin" />
          ) : (
            <AlertCircle className="h-3 w-3" />
          )}
          {syncStatus.syncInProgress ? "সিঙ্ক হচ্ছে..." : `${totalPending} পেন্ডিং`}
        </Badge>
      )}

      {/* Manual Sync Button */}
      {isOnline && totalPending > 0 && !syncStatus.syncInProgress && (
        <Button
          size="sm"
          variant="outline"
          onClick={handleManualSync}
          className="text-xs"
        >
          <RefreshCw className="h-3 w-3 mr-1" />
          ম্যানুয়াল সিঙ্ক
        </Button>
      )}

      {/* Success Indicator */}
      {isOnline && totalPending === 0 && !syncStatus.syncInProgress && (
        <Badge 
          variant="default" 
          className="flex items-center gap-1 bg-green-500"
        >
          <CheckCircle className="h-3 w-3" />
          সব সিঙ্ক
        </Badge>
      )}
    </div>
  )
}
