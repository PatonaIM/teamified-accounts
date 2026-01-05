import React from 'react';
import { ReportPageLayout, AppUsageContent } from './AnalyticsShared';

export default function AppUsageReportPage() {
  return (
    <ReportPageLayout title="App Usage">
      <AppUsageContent />
    </ReportPageLayout>
  );
}
