"use client"

import Link from "next/link"

export default function EORDashboard() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="h2">My Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
          <span className="body-sm text-gray-600">All systems operational</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <section className="card">
          <div className="card-header">
            <h2 className="h3">Profile Completion</h2>
          </div>
          <div className="card-body">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="body-md">Progress</span>
                <span className="body-sm font-medium">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: "75%" }}
                ></div>
              </div>
            </div>
            <p className="body-sm text-gray-600 mb-4">Complete your profile to access all features</p>
            <Link href="/app/profile" className="btn btn-primary btn-sm">
              Update Profile
            </Link>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="h3">This Week's Timesheet</h2>
          </div>
          <div className="card-body">
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <span className="body-md">Hours logged</span>
                <span className="body-sm font-medium">32.5 / 40</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-green-600 h-3 rounded-full transition-all duration-300"
                  style={{ width: "81.25%" }}
                ></div>
              </div>
            </div>
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-block px-3 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full font-medium">
                Draft
              </span>
              <span className="body-sm text-gray-600">Week ending Sep 1, 2024</span>
            </div>
            <Link href="/app/timesheets" className="btn btn-primary btn-sm">
              Open Timesheet
            </Link>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="h3">Leave at a Glance</h2>
          </div>
          <div className="card-body">
            <div className="space-y-3 mb-4">
              <div className="flex justify-between items-center">
                <span className="body-sm text-gray-600">Annual Leave</span>
                <span className="body-sm font-medium">18 days remaining</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="body-sm text-gray-600">Sick Leave</span>
                <span className="body-sm font-medium">5 days remaining</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="body-sm text-gray-600">Personal Leave</span>
                <span className="body-sm font-medium">3 days remaining</span>
              </div>
            </div>
            <Link href="/app/leave" className="btn btn-primary btn-sm">
              Request Leave
            </Link>
          </div>
        </section>

        <section className="card">
          <div className="card-header">
            <h2 className="h3">Latest Payslip</h2>
          </div>
          <div className="card-body">
            <div className="mb-4">
              <p className="body-md font-medium">August 2024</p>
              <p className="body-sm text-gray-600">Processed on Aug 31, 2024</p>
              <p className="body-sm text-gray-600 mt-1">Net Pay: $4,250.00</p>
            </div>
            <div className="flex gap-2">
              <Link href="/app/documents" className="btn btn-primary btn-sm">
                View Payslips
              </Link>
              <button className="btn btn-secondary btn-sm" type="button">
                Download PDF
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Quick Actions */}
      <section className="card">
        <div className="card-header">
          <h2 className="h3">Quick Actions</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/app/timesheets/new"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl mb-2">⏰</span>
              <span className="body-sm text-center">Log Hours</span>
            </Link>
            <Link
              href="/app/leave/new"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl mb-2">🏖️</span>
              <span className="body-sm text-center">Request Leave</span>
            </Link>
            <Link
              href="/app/cv"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl mb-2">📄</span>
              <span className="body-sm text-center">Update CV</span>
            </Link>
            <Link
              href="/app/documents"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl mb-2">📁</span>
              <span className="body-sm text-center">View Documents</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="card mt-6">
        <div className="card-header">
          <h2 className="h3">Recent Activity</h2>
        </div>
        <div className="card-body">
          <div className="space-y-4">
            <div className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-b-0">
              <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="body-md">Timesheet for week ending Aug 25 approved</p>
                <p className="body-sm text-gray-600">2 days ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-b-0">
              <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="body-md">Profile updated - Emergency contact information</p>
                <p className="body-sm text-gray-600">1 week ago</p>
              </div>
            </div>
            <div className="flex items-start gap-3 pb-3 border-b border-gray-100 last:border-b-0">
              <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
              <div className="flex-1">
                <p className="body-md">Annual leave request approved (Sep 15-19)</p>
                <p className="body-sm text-gray-600">2 weeks ago</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
