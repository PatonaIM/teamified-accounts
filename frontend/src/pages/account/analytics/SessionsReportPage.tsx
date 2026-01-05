import React from 'react';
import { ReportPageLayout, SessionsContent } from './AnalyticsShared';

export default function SessionsReportPage() {
  return (
    <ReportPageLayout title="Sessions">
      <SessionsContent />
    </ReportPageLayout>
  );
}
