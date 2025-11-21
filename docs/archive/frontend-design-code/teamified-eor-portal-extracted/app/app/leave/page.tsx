"use client"

import { useState } from "react"
import Link from "next/link"

interface LeaveRequest {
  id: string
  type: "annual" | "sick" | "personal" | "other"
  startDate: string
  endDate: string
  days: number
  status: "pending" | "approved" | "rejected" | "cancelled"
  reason?: string
  submittedDate: string
  responseDate?: string
  responseNote?: string
}

const mockLeaveRequests: LeaveRequest[] = [
  {
    id: "1",
    type: "annual",
    startDate: "2024-09-15",
    endDate: "2024-09-19",
    days: 5,
    status: "approved",
    reason: "Family vacation",
    submittedDate: "2024-08-20",
    responseDate: "2024-08-22",
  },
  {
    id: "2",
    type: "sick",
    startDate: "2024-08-10",
    endDate: "2024-08-10",
    days: 1,
    status: "approved",
    reason: "Doctor appointment",
    submittedDate: "2024-08-09",
    responseDate: "2024-08-09",
  },
  {
    id: "3",
    type: "personal",
    startDate: "2024-09-30",
    endDate: "2024-09-30",
    days: 1,
    status: "pending",
    reason: "Personal matters",
    submittedDate: "2024-08-28",
  },
]

export default function LeavePage() {
  const [filter, setFilter] = useState<string>("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "annual":
        return "bg-blue-100 text-blue-800"
      case "sick":
        return "bg-red-100 text-red-800"
      case "personal":
        return "bg-purple-100 text-purple-800"
      case "other":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredRequests = mockLeaveRequests.filter((request) => {
    if (filter === "all") return true
    return request.status === filter
  })

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="h2">Leave Requests</h1>
        <Link href="/app/leave/new" className="btn btn-primary">
          Request Leave
        </Link>
      </div>

      {/* Leave Balance Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="card">
          <div className="card-body">
            <h3 className="h4 mb-2">Annual Leave</h3>
            <p className="display-2 text-blue-600 mb-1">18</p>
            <p className="body-sm text-gray-600">days remaining</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="h4 mb-2">Sick Leave</h3>
            <p className="display-2 text-red-600 mb-1">5</p>
            <p className="body-sm text-gray-600">days remaining</p>
          </div>
        </div>
        <div className="card">
          <div className="card-body">
            <h3 className="h4 mb-2">Personal Leave</h3>
            <p className="display-2 text-purple-600 mb-1">3</p>
            <p className="body-sm text-gray-600">days remaining</p>
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
              className={`btn btn-sm ${filter === "pending" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setFilter("pending")}
              type="button"
            >
              Pending
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

      {/* Leave Requests List */}
      <div className="card">
        <div className="card-header">
          <h2 className="h3">Leave History</h2>
        </div>
        <div className="card-body">
          {filteredRequests.length > 0 ? (
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`inline-block px-2 py-1 text-xs rounded-full ${getTypeColor(request.type)}`}>
                          {request.type.charAt(0).toUpperCase() + request.type.slice(1)}
                        </span>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(request.status)}`}
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="body-sm text-gray-600">Dates</p>
                          <p className="body-md">
                            {new Date(request.startDate).toLocaleDateString()} -{" "}
                            {new Date(request.endDate).toLocaleDateString()}
                          </p>
                          <p className="body-sm text-gray-600">
                            {request.days} day{request.days > 1 ? "s" : ""}
                          </p>
                        </div>
                        <div>
                          <p className="body-sm text-gray-600">Reason</p>
                          <p className="body-md">{request.reason || "No reason provided"}</p>
                        </div>
                        <div>
                          <p className="body-sm text-gray-600">Submitted</p>
                          <p className="body-md">{new Date(request.submittedDate).toLocaleDateString()}</p>
                          {request.responseDate && (
                            <>
                              <p className="body-sm text-gray-600 mt-1">Responded</p>
                              <p className="body-sm">{new Date(request.responseDate).toLocaleDateString()}</p>
                            </>
                          )}
                        </div>
                      </div>
                      {request.responseNote && (
                        <div className="mt-3 p-3 bg-gray-50 rounded">
                          <p className="body-sm text-gray-600 mb-1">Response Note:</p>
                          <p className="body-sm">{request.responseNote}</p>
                        </div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Link href={`/app/leave/${request.id}`} className="btn btn-secondary btn-sm">
                        View
                      </Link>
                      {request.status === "pending" && (
                        <button className="btn btn-secondary btn-sm" type="button">
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="body-md text-gray-600 mb-4">No leave requests found for the selected filter.</p>
              <Link href="/app/leave/new" className="btn btn-primary">
                Request Your First Leave
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
