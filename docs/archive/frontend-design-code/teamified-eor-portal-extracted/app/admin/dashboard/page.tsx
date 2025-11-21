"use client"

import Link from "next/link"

export default function AdminDashboard() {
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="h2">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
          <span className="body-sm text-gray-600">All systems operational</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Link href="/admin/invitations" className="card hover:shadow-md transition-shadow">
          <div className="card-body">
            <h3 className="h4 mb-2 text-gray-700">Pending Invites</h3>
            <p className="display-2 text-orange-600 mb-2">3</p>
            <p className="body-sm text-gray-600">Awaiting response</p>
            <div className="mt-3">
              <span className="body-sm text-orange-600 font-medium">2 expiring soon</span>
            </div>
          </div>
        </Link>

        <Link href="/admin/approvals" className="card hover:shadow-md transition-shadow">
          <div className="card-body">
            <h3 className="h4 mb-2 text-gray-700">Approvals Queue</h3>
            <p className="display-2 text-red-600 mb-2">7</p>
            <p className="body-sm text-gray-600">Timesheets & Leave</p>
            <div className="mt-3">
              <span className="body-sm text-red-600 font-medium">4 timesheets, 3 leave</span>
            </div>
          </div>
        </Link>

        <Link href="/admin/people" className="card hover:shadow-md transition-shadow">
          <div className="card-body">
            <h3 className="h4 mb-2 text-gray-700">Active EORs</h3>
            <p className="display-2 text-green-600 mb-2">24</p>
            <p className="body-sm text-gray-600">Across 8 clients</p>
            <div className="mt-3">
              <span className="body-sm text-green-600 font-medium">2 new this month</span>
            </div>
          </div>
        </Link>

        <div className="card">
          <div className="card-body">
            <h3 className="h4 mb-2 text-gray-700">Recent Changes</h3>
            <p className="display-2 text-purple-600 mb-2">12</p>
            <p className="body-sm text-gray-600">Last 24 hours</p>
            <div className="mt-3">
              <span className="body-sm text-purple-600 font-medium">View audit log</span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="card mb-8">
        <div className="card-header">
          <h2 className="h3">Quick Actions</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/admin/invitations"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl mb-2">✉️</span>
              <span className="body-sm text-center">Send Invite</span>
            </Link>
            <Link
              href="/admin/approvals"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl mb-2">✅</span>
              <span className="body-sm text-center">Review Approvals</span>
            </Link>
            <Link
              href="/admin/people"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl mb-2">👥</span>
              <span className="body-sm text-center">Manage People</span>
            </Link>
            <Link
              href="/admin/documents"
              className="flex flex-col items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl mb-2">📁</span>
              <span className="body-sm text-center">Publish Docs</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <section className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="h3">Recent Activity</h2>
              <button className="btn btn-secondary btn-sm" type="button">
                View All
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="body-md">New timesheet submitted by Alex Johnson</p>
                  <p className="body-sm text-gray-600">2 hours ago • Requires approval</p>
                </div>
                <Link href="/admin/approvals" className="btn btn-secondary btn-sm">
                  Review
                </Link>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-green-600 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="body-md">Leave request approved for Sarah Chen</p>
                  <p className="body-sm text-gray-600">4 hours ago • Annual leave Sep 15-19</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-orange-600 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="body-md">New invitation sent to john.doe@example.com</p>
                  <p className="body-sm text-gray-600">6 hours ago • Expires Sep 8, 2024</p>
                </div>
                <Link href="/admin/invitations" className="btn btn-secondary btn-sm">
                  Manage
                </Link>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-purple-600 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="body-md">Profile updated by Maria Rodriguez</p>
                  <p className="body-sm text-gray-600">8 hours ago • Emergency contact information</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 bg-red-600 rounded-full mt-2 flex-shrink-0"></div>
                <div className="flex-1">
                  <p className="body-md">Invitation expired for jane.smith@example.com</p>
                  <p className="body-sm text-gray-600">12 hours ago • Requires resend</p>
                </div>
                <Link href="/admin/invitations" className="btn btn-secondary btn-sm">
                  Resend
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Roster by Client */}
        <section className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="h3">Roster by Client</h2>
              <Link href="/admin/clients" className="btn btn-secondary btn-sm">
                Manage All
              </Link>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="body-md font-medium">Alpha Corp</p>
                  <p className="body-sm text-gray-600">Technology • San Francisco</p>
                </div>
                <div className="text-right">
                  <p className="body-md font-medium">8 EORs</p>
                  <p className="body-sm text-green-600">2 active timesheets</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="body-md font-medium">Beta Industries</p>
                  <p className="body-sm text-gray-600">Manufacturing • Chicago</p>
                </div>
                <div className="text-right">
                  <p className="body-md font-medium">6 EORs</p>
                  <p className="body-sm text-orange-600">1 pending approval</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="body-md font-medium">Gamma Solutions</p>
                  <p className="body-sm text-gray-600">Consulting • New York</p>
                </div>
                <div className="text-right">
                  <p className="body-md font-medium">5 EORs</p>
                  <p className="body-sm text-gray-600">All current</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="body-md font-medium">Delta Tech</p>
                  <p className="body-sm text-gray-600">Software • Austin</p>
                </div>
                <div className="text-right">
                  <p className="body-md font-medium">3 EORs</p>
                  <p className="body-sm text-blue-600">1 new hire</p>
                </div>
              </div>
              <div className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                <div>
                  <p className="body-md font-medium">Epsilon Labs</p>
                  <p className="body-sm text-gray-600">Research • Boston</p>
                </div>
                <div className="text-right">
                  <p className="body-md font-medium">2 EORs</p>
                  <p className="body-sm text-gray-600">All current</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* System Status */}
      <div className="card mt-6">
        <div className="card-header">
          <h2 className="h3">System Status</h2>
        </div>
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="body-md font-medium">Payroll Processing</p>
                <p className="body-sm text-gray-600">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div>
                <p className="body-md font-medium">Document Storage</p>
                <p className="body-sm text-gray-600">Operational</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div>
                <p className="body-md font-medium">Email Notifications</p>
                <p className="body-sm text-gray-600">Minor delays</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
