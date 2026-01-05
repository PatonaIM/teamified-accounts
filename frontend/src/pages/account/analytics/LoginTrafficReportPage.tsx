import React from 'react';
import { ReportPageLayout, LoginTrafficContent } from './AnalyticsShared';

export default function LoginTrafficReportPage() {
  return (
    <ReportPageLayout title="Login Traffic">
      <LoginTrafficContent />
    </ReportPageLayout>
  );
}
