import { LocalDBTest } from '@/components/local-db-test'
import { OfflineIndicator } from '@/components/offline-indicator'

export default function TestPage() {
  return (
    <div className="min-h-screen bg-background p-4">
      <OfflineIndicator />
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">হাইব্রিড ডাটা টেস্ট</h1>
          <p className="text-muted-foreground">
            স্থানীয় ডাটাবেস এবং সিঙ্ক সিস্টেম টেস্ট করুন
          </p>
        </div>
        
        <LocalDBTest />
      </div>
    </div>
  )
}
