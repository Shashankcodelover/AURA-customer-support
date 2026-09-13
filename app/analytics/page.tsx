'use client';

import { useAppState } from '@/lib/context/AppStateContext';
import ChurnRadar from '@/components/ChurnRadar';
import TrendingIssues from '@/components/TrendingIssues';

export default function AnalyticsPage() {
  const { tickets } = useAppState();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl font-bold mb-1">Customer Experience Analytics</h1>
        <p className="text-gray-400 text-sm">Recurring issues, emerging complaints, and churn signals — computed live from ticket history.</p>
      </div>
      <ChurnRadar tickets={tickets} />
      <TrendingIssues tickets={tickets} />
    </div>
  );
}
