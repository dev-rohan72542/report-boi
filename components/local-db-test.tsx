"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import { localDB } from '@/lib/database/local-db'
import { hybridDataService } from '@/lib/services/hybrid-data-service'

export function LocalDBTest() {
  const { toast } = useToast()
  const [dbSize, setDbSize] = useState<number>(0)
  const [testEntry, setTestEntry] = useState<any>(null)

  useEffect(() => {
    updateDbSize()
  }, [])

  const updateDbSize = async () => {
    try {
      if (!localDB) {
        setDbSize(0)
        return
      }
      const size = await localDB.getDatabaseSize()
      setDbSize(size)
    } catch (error) {
      console.error('Failed to get DB size:', error)
    }
  }

  const testSaveEntry = async () => {
    try {
      const testData = {
        user_id: 'test-user-123',
        entry_date: new Date().toISOString().split('T')[0],
        quran_memorization: 30,
        quran_study: 45,
        hadith_study: 20,
        islamic_literature: 15,
        other_literature: 10,
        online_work: 240,
        offline_work: 120,
        skill_lessons: 60,
        skill_practice: 90,
        skill_projects: 120,
        pull_ups: 10,
        push_ups: 20,
        squats: 15,
        prayers_in_congregation: 5,
        classes_attended: 2,
        communication_members: 3,
        communication_companions: 2,
        communication_workers: 1,
        communication_relations: 4,
        communication_friends: 2,
        communication_talented_students: 1,
        communication_well_wishers: 3,
        communication_mahram: 2,
        literature_distribution: 5,
        magazine_distribution: 3,
        sticker_card_distribution: 10,
        gift_distribution: 2,
        dawati_responsibilities: 60,
        other_responsibilities: 30,
        newspaper_reading: 15,
        self_criticism: 10,
      }

      const savedEntry = await hybridDataService.saveDailyEntry(testData)
      setTestEntry(savedEntry)
      
      toast({
        title: "টেস্ট এন্ট্রি সংরক্ষিত!",
        description: "স্থানীয় ডাটাবেসে সফলভাবে সংরক্ষিত হয়েছে।",
      })
      
      updateDbSize()
    } catch (error) {
      console.error('Test save failed:', error)
      toast({
        title: "টেস্ট ত্রুটি!",
        description: "এন্ট্রি সংরক্ষণে সমস্যা হয়েছে।",
        variant: "destructive",
      })
    }
  }

  const testGetEntries = async () => {
    try {
      const entries = await hybridDataService.getDailyEntries('test-user-123')
      toast({
        title: "এন্ট্রি লোড হয়েছে!",
        description: `${entries.length} টি এন্ট্রি পাওয়া গেছে।`,
      })
      console.log('Retrieved entries:', entries)
    } catch (error) {
      console.error('Test get failed:', error)
      toast({
        title: "টেস্ট ত্রুটি!",
        description: "এন্ট্রি লোডে সমস্যা হয়েছে।",
        variant: "destructive",
      })
    }
  }

  const clearTestData = async () => {
    try {
      if (!localDB) {
        toast({
          title: "ডাটাবেস অনুপলব্ধ!",
          description: "স্থানীয় ডাটাবেস ব্রাউজারে উপলব্ধ নেই।",
          variant: "destructive",
        })
        return
      }

      await localDB.clearAllData()
      setTestEntry(null)
      updateDbSize()
      
      toast({
        title: "ডাটা মুছে ফেলা হয়েছে!",
        description: "সমস্ত টেস্ট ডাটা মুছে ফেলা হয়েছে।",
      })
    } catch (error) {
      console.error('Clear failed:', error)
      toast({
        title: "মুছে ফেলার ত্রুটি!",
        description: "ডাটা মুছে ফেলায় সমস্যা হয়েছে।",
        variant: "destructive",
      })
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>স্থানীয় ডাটাবেস টেস্ট</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-sm">
          <strong>ডাটাবেস সাইজ:</strong> {dbSize} রেকর্ড
        </div>
        
        <div className="flex flex-col gap-2">
          <Button onClick={testSaveEntry} variant="default">
            টেস্ট এন্ট্রি সংরক্ষণ
          </Button>
          
          <Button onClick={testGetEntries} variant="outline">
            এন্ট্রি লোড করুন
          </Button>
          
          <Button onClick={clearTestData} variant="destructive">
            সব ডাটা মুছুন
          </Button>
        </div>

        {testEntry && (
          <div className="text-xs bg-muted p-2 rounded">
            <strong>সর্বশেষ সংরক্ষিত এন্ট্রি:</strong>
            <pre className="mt-1 overflow-auto">
              {JSON.stringify(testEntry, null, 2)}
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
