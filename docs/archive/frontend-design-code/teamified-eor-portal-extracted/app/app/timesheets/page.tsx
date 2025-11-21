"use client"

import { useState } from "react"
import Link from "next/link"

interface TimesheetEntry {
  id: string
  weekEnding: string
  totalHours: number
  status: "draft" | "submitted" | "approved" | "rejected"
  submittedDate?: string
}

const mockTimesheets: TimesheetEntry[] = [
  {
    id: "1",
    weekEnding: "2024-09-01",
    totalHours: 40,
    status: "approved",
    submittedDate: "2024-08-30",
  },
  {
    id: "2",
    weekEnding: "2024-08-25",
    totalHours: 38.5,
    status: "approved",
    submittedDate: "2024-08-23",
  },
  {
    id: "3",
    weekEnding: "2024-08-18",
    totalHours: 42,
    status: "submitted",
    submittedDate: "2024-08-16",
  },
]

export default function TimesheetsPage() {
  const [filter, setFilter] = useState<string>("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800"
      case "submitted":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredTimesheets = mockTimesheets.filter((timesheet) => {
    if (filter === "all") return true
    return timesheet.status === filter
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="h2">Timesheets</h1>
        <Link href="/app/timesheets/new" className="btn btn-primary">
          New Timesheet
        </Link>
      </div>

      {/* Current Week Alert */}
      <div className="card mb-6 border-l-4 border-l-blue-500">
        <div className="card-body">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="h4 mb-2">Current Week (Sep 2-8, 2024)</h3>
              <p className="body-md mb-2">32.5 hours logged • Draft status</p>
              <p className="body-sm text-gray-600">Remember to submit by Friday at 5 PM</p>
            </div>
            <Link href="/app/timesheets/current" className="btn btn-primary btn-sm">
              Continue
            </Link>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex flex-wrap gap-2">
            <button
              className={`btn btn-sm ${filter === "all" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setFilter("all")}
              type="button"
            >
              All
            </button>
            <button
              className={`btn btn-sm ${filter === "draft" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setFilter("draft")}
              type="button"
            >
              Draft
            </button>
            <button
              className={`btn btn-sm ${filter === "submitted" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setFilter("submitted")}
              type="button"
            >
              Submitted
            </button>
            <button
              className={`btn btn-sm ${filter === "approved" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setFilter("approved")}
              type="button"
            >
              Approved
            </button>
            <button
              className={`btn btn-sm ${filter === "rejected" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setFilter("rejected")}
              type="button"
            >
              Rejected
            </button>
          </div>
        </div>
      </div>

      {/* Timesheets List */}
      <div className="card">
        <div className="card-header">
          <h2 className="h3">Timesheet History</h2>
        </div>
        <div className="card-body">
          {filteredTimesheets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Week Ending</th>
                    <th>Total Hours</th>
                    <th>Status</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTimesheets.map((timesheet) => (
                    <tr key={timesheet.id}>
                      <td className="body-md">{new Date(timesheet.weekEnding).toLocaleDateString()}</td>
                      <td className="body-md">{timesheet.totalHours}</td>
                      <td>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(timesheet.status)}`}
                        >
                          {timesheet.status.charAt(0).toUpperCase() + timesheet.status.slice(1)}
                        </span>
                      </td>
                      <td className="body-sm text-gray-600">
                        {timesheet.submittedDate ? new Date(timesheet.submittedDate).toLocaleDateString() : "-"}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <Link href={`/app/timesheets/${timesheet.id}`} className="btn btn-secondary btn-sm">
                            View
                          </Link>
                          {timesheet.status === "draft" && (
                            <Link href={`/app/timesheets/${timesheet.id}/edit`} className="btn btn-primary btn-sm">
                              Edit
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="body-md text-gray-600 mb-4">No timesheets found for the selected filter.</p>
              <Link href="/app/timesheets/new" className="btn btn-primary">
                Create Your First Timesheet
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
