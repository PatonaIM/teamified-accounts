import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { 
  User, 
  Clock, 
  Calendar, 
  Upload, 
  FileText, 
  CheckCircle,
  Download,
  AlertCircle,
  ArrowRight
} from 'lucide-react';
import JobRecommendations from './dashboard/JobRecommendations';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

// Mock data for dashboard
const dashboardData = {
  profileCompletion: 75,
  timesheetProgress: {
    logged: 32.5,
    total: 40,
    status: 'draft',
    weekEnding: 'Sep 1, 2024'
  },
  leaveBalance: {
    annual: 18,
    sick: 5,
    personal: 3
  },
  latestPayslip: {
    month: 'August 2024',
    processed: 'Aug 31, 2024',
    netPay: '$4,250.00'
  },
  systemStatus: 'operational'
};

const recentActivity = [
  {
    id: 1,
    type: 'success',
    message: 'Timesheet for week ending Aug 25 approved',
    time: '2 days ago',
    icon: CheckCircle
  },
  {
    id: 2,
    type: 'info',
    message: 'Profile updated - Emergency contact information',
    time: '1 week ago',
    icon: User
  },
  {
    id: 3,
    type: 'warning',
    message: 'Annual leave request approved (Sep 15-19)',
    time: '2 weeks ago',
    icon: Calendar
  }
];

const quickActions = [
  {
    id: 1,
    title: 'Log Hours',
    icon: Clock,
    href: '/timesheets',
    emoji: '⏰'
  },
  {
    id: 2,
    title: 'Request Leave',
    icon: Calendar,
    href: '/leave',
    emoji: '🏖️'
  },
  {
    id: 3,
    title: 'Update CV',
    icon: Upload,
    href: '/cv',
    emoji: '📄'
  },
  {
    id: 4,
    title: 'View Documents',
    icon: FileText,
    href: '/documents',
    emoji: '📁'
  }
];

const Dashboard: React.FC = () => {
  const [hasOnboardingRecord, setHasOnboardingRecord] = useState(false);
  const [onboardingProgress, setOnboardingProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const token = localStorage.getItem('teamified_access_token') || localStorage.getItem('access_token');
        console.log('[Dashboard] Token found:', !!token);
        if (!token) {
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE_URL}/v1/auth/me/employment`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        console.log('[Dashboard] Employment records response:', response.data);
        const employmentRecords = Array.isArray(response.data) ? response.data : [];
        console.log('[Dashboard] Employment records array:', employmentRecords);
        
        const onboardingRecord = employmentRecords.find(
          (record: any) => record.status === 'onboarding'
        );
        console.log('[Dashboard] Onboarding record found:', onboardingRecord);

        if (onboardingRecord) {
          setHasOnboardingRecord(true);
          // Calculate progress based on completed steps (for now, hardcoded as 33% for step 1)
          setOnboardingProgress(33);
          console.log('[Dashboard] Onboarding banner should show!');
        } else {
          console.log('[Dashboard] No onboarding record found');
        }
      } catch (error) {
        console.error('[Dashboard] Failed to check onboarding status:', error);
      } finally {
        setLoading(false);
        console.log('[Dashboard] Loading complete, hasOnboardingRecord:', hasOnboardingRecord);
      }
    };

    checkOnboardingStatus();
  }, []);

  const getStatusColor = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'info':
        return 'bg-blue-500';
      case 'warning':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };


  console.log('[Dashboard] Render - loading:', loading, 'hasOnboardingRecord:', hasOnboardingRecord);

  return (
    <div className="dashboard-container">
      {/* Onboarding Banner */}
      {!loading && hasOnboardingRecord && (
        <div className="mb-6 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg shadow-lg p-6 text-white">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="bg-white/20 rounded-full p-3">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold mb-2">Complete Your Onboarding</h3>
                <p className="text-white/90 mb-3">
                  You're {onboardingProgress}% done! Complete your profile and upload required documents to get started.
                </p>
                <div className="w-full bg-white/20 rounded-full h-2 mb-4">
                  <div 
                    className="bg-white h-2 rounded-full transition-all duration-300"
                    style={{ width: `${onboardingProgress}%` }}
                  />
                </div>
              </div>
            </div>
            <Link
              to="/onboarding"
              className="ml-4 bg-white text-purple-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2 whitespace-nowrap"
            >
              <span>Continue</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}

      {/* Header with Status */}
      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <h1 className="dashboard-title">My Dashboard</h1>
          <div className="dashboard-status">
            <span className={`status-indicator ${dashboardData.systemStatus === 'operational' ? 'status-operational' : 'status-warning'}`}></span>
            <span className="status-text">
              {dashboardData.systemStatus === 'operational' ? 'All systems operational' : 'System maintenance in progress'}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Cards Grid */}
      <div className="dashboard-progress-grid">
        {/* Profile Completion Card */}
        <Card className="dashboard-progress-card">
          <CardHeader className="dashboard-progress-card-header">
            <CardTitle className="dashboard-progress-card-title">Profile Completion</CardTitle>
          </CardHeader>
          <CardContent className="dashboard-progress-card-content">
            <div className="progress-section">
              <div className="progress-header">
                <span className="progress-label">Progress</span>
                <span className="progress-value">{dashboardData.profileCompletion}%</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill profile-progress"
                  style={{ width: `${dashboardData.profileCompletion}%` }}
                ></div>
              </div>
            </div>
            <p className="progress-description">Complete your profile to access all features</p>
            <Link to="/profile" className="btn btn-primary btn-sm">
              Update Profile
            </Link>
          </CardContent>
        </Card>

        {/* Timesheet Card */}
        <Card className="dashboard-progress-card">
          <CardHeader className="dashboard-progress-card-header">
            <CardTitle className="dashboard-progress-card-title">This Week's Timesheet</CardTitle>
          </CardHeader>
          <CardContent className="dashboard-progress-card-content">
            <div className="progress-section">
              <div className="progress-header">
                <span className="progress-label">Hours logged</span>
                <span className="progress-value">
                  {dashboardData.timesheetProgress.logged} / {dashboardData.timesheetProgress.total}
                </span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill timesheet-progress"
                  style={{ width: `${(dashboardData.timesheetProgress.logged / dashboardData.timesheetProgress.total) * 100}%` }}
                ></div>
              </div>
            </div>
            <div className="timesheet-status">
              <span className="status-badge status-draft">Draft</span>
              <span className="timesheet-week">Week ending {dashboardData.timesheetProgress.weekEnding}</span>
            </div>
            <Link to="/timesheets" className="btn btn-primary btn-sm">
              Open Timesheet
            </Link>
          </CardContent>
        </Card>

        {/* Leave Balance Card */}
        <Card className="dashboard-progress-card">
          <CardHeader className="dashboard-progress-card-header">
            <CardTitle className="dashboard-progress-card-title">Leave at a Glance</CardTitle>
          </CardHeader>
          <CardContent className="dashboard-progress-card-content">
            <div className="leave-balance">
              <div className="leave-item">
                <span className="leave-type">Annual Leave</span>
                <span className="leave-days">{dashboardData.leaveBalance.annual} days remaining</span>
              </div>
              <div className="leave-item">
                <span className="leave-type">Sick Leave</span>
                <span className="leave-days">{dashboardData.leaveBalance.sick} days remaining</span>
              </div>
              <div className="leave-item">
                <span className="leave-type">Personal Leave</span>
                <span className="leave-days">{dashboardData.leaveBalance.personal} days remaining</span>
              </div>
            </div>
            <Link to="/leave" className="btn btn-primary btn-sm">
              Request Leave
            </Link>
          </CardContent>
        </Card>

        {/* Latest Payslip Card */}
        <Card className="dashboard-progress-card">
          <CardHeader className="dashboard-progress-card-header">
            <CardTitle className="dashboard-progress-card-title">Latest Payslip</CardTitle>
          </CardHeader>
          <CardContent className="dashboard-progress-card-content">
            <div className="payslip-info">
              <p className="payslip-month">{dashboardData.latestPayslip.month}</p>
              <p className="payslip-processed">Processed on {dashboardData.latestPayslip.processed}</p>
              <p className="payslip-amount">Net Pay: {dashboardData.latestPayslip.netPay}</p>
            </div>
            <div className="payslip-actions">
              <Link to="/documents" className="btn btn-primary btn-sm">
                View Payslips
              </Link>
              <button className="btn btn-secondary btn-sm" type="button">
                <Download size={14} />
                Download
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Job Recommendations */}
      <JobRecommendations />

      {/* Quick Actions */}
      <Card className="dashboard-quick-actions-card">
        <CardHeader className="dashboard-quick-actions-header">
          <CardTitle className="dashboard-quick-actions-title">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="dashboard-quick-actions-content">
          <div className="quick-actions-grid">
            {quickActions.map((action) => (
              <Link
                key={action.id}
                to={action.href}
                className="quick-action-item"
              >
                <span className="quick-action-emoji">{action.emoji}</span>
                <span className="quick-action-title">{action.title}</span>
              </Link>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="dashboard-activity-card">
        <CardHeader className="dashboard-activity-header">
          <CardTitle className="dashboard-activity-title">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent className="dashboard-activity-content">
          <div className="activity-list">
            {recentActivity.map((activity) => {
              return (
                <div key={activity.id} className="activity-item">
                  <div className={`activity-indicator ${getStatusColor(activity.type)}`}></div>
                  <div className="activity-content">
                    <p className="activity-message">{activity.message}</p>
                    <p className="activity-time">{activity.time}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
