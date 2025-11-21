"use client"

import { useState } from "react"

interface TimesheetApproval {
  id: string
  eorName: string
  eorEmail: string
  client: string
  weekEnding: string
  totalHours: number
  submittedDate: string
  status: "pending" | "approved" | "rejected"
  notes?: string
}

interface LeaveApproval {
  id: string
  eorName: string
  eorEmail: string
  client: string
  leaveType: string
  startDate: string
  endDate: string
  days: number
  reason: string
  submittedDate: string
  status: "pending" | "approved" | "rejected"
  conflicts?: string[]
}

const mockTimesheets: TimesheetApproval[] = [
  {
    id: "1",
    eorName: "Alex Johnson",
    eorEmail: "alex.johnson@example.com",
    client: "Alpha Corp",
    weekEnding: "2024-09-01",
    totalHours: 40,
    submittedDate: "2024-08-30",
    status: "pending",
  },
  {
    id: "2",
    eorName: "Sarah Chen",
    eorEmail: "sarah.chen@example.com",
    client: "Beta Industries",
    weekEnding: "2024-09-01",
    totalHours: 38.5,
    submittedDate: "2024-08-29",
    status: "pending",
  },
]

const mockLeaveRequests: LeaveApproval[] = [
  {
    id: "1",
    eorName: "Maria Rodriguez",
    eorEmail: "maria.rodriguez@example.com",
    client: "Gamma Solutions",
    leaveType: "Annual",
    startDate: "2024-09-15",
    endDate: "2024-09-19",
    days: 5,
    reason: "Family vacation",
    submittedDate: "2024-08-20",
    status: "pending",
  },
  {
    id: "2",
    eorName: "James Wilson",
    eorEmail: "james.wilson@example.com",
    client: "Delta Tech",
    leaveType: "Sick",
    startDate: "2024-09-10",
    endDate: "2024-09-12",
    days: 3,
    reason: "Medical appointment",
    submittedDate: "2024-09-05",
    status: "pending",
    conflicts: ["Overlaps with project deadline"],
  },
]

export default function ApprovalsPage() {
  const [activeTab, setActiveTab] = useState<"timesheets" | "leave">("timesheets")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const handleBulkAction = (action: "approve" | "reject") => {
    if (selectedItems.length === 0) {
      setToastMessage("Please select items to process")
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
      return
    }

    const actionText = action === "approve" ? "approved" : "rejected"
    setToastMessage(`${selectedItems.length} item(s) ${actionText} successfully`)
    setSelectedItems([])
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleSelectAll = (items: any[]) => {
    if (selectedItems.length === items.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(items.map((item) => item.id))
    }
  }

  const handleSelectItem = (id: string) => {
    setSelectedItems((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]))
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="h2">Approvals</h1>
        <div className="flex gap-2">
          <button className="btn btn-secondary" type="button">
            Export CSV
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 z-50">
          <span className="body-sm">{toastMessage}</span>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex gap-2">
            <button
              className={`btn btn-sm ${activeTab === "timesheets" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab("timesheets")}
              type="button"
            >
              Timesheets ({mockTimesheets.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === "leave" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab("leave")}
              type="button"
            >
              Leave Requests ({mockLeaveRequests.length})
            </button>
          </div>
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <div className="card mb-6 border-l-4 border-l-blue-500">
          <div className="card-body">
            <div className="flex items-center justify-between">
              <span className="body-md">{selectedItems.length} item(s) selected</span>
              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm" onClick={() => handleBulkAction("approve")} type="button">
                  Approve Selected
                </button>
                <button
                  className="btn btn-secondary btn-sm text-red-600 hover:bg-red-50"
                  onClick={() => handleBulkAction("reject")}
                  type="button"
                >
                  Reject Selected
                </button>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedItems([])} type="button">
                  Clear Selection
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Timesheets Tab */}
      {activeTab === "timesheets" && (
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="h3">Timesheet Approvals</h2>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleSelectAll(mockTimesheets)}
                type="button"
              >
                {selectedItems.length === mockTimesheets.length ? "Deselect All" : "Select All"}
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>
                      <input
                        type="checkbox"
                        checked={selectedItems.length === mockTimesheets.length}
                        onChange={() => handleSelectAll(mockTimesheets)}
                      />
                    </th>
                    <th>EOR</th>
                    <th>Client</th>
                    <th>Week Ending</th>
                    <th>Hours</th>
                    <th>Submitted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {mockTimesheets.map((timesheet) => (
                    <tr key={timesheet.id}>
                      <td>
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(timesheet.id)}
                          onChange={() => handleSelectItem(timesheet.id)}
                        />
                      </td>
                      <td>
                        <div>
                          <p className="body-md font-medium">{timesheet.eorName}</p>
                          <p className="body-sm text-gray-600">{timesheet.eorEmail}</p>
                        </div>
                      </td>
                      <td className="body-md">{timesheet.client}</td>
                      <td className="body-md">{new Date(timesheet.weekEnding).toLocaleDateString()}</td>
                      <td className="body-md font-medium">{timesheet.totalHours}h</td>
                      <td className="body-sm">{new Date(timesheet.submittedDate).toLocaleDateString()}</td>
                      <td>
                        <div className="flex gap-1">
                          <button className="btn btn-secondary btn-sm" type="button">
                            View
                          </button>
                          <button className="btn btn-primary btn-sm" type="button">
                            Approve
                          </button>
                          <button className="btn btn-secondary btn-sm text-red-600 hover:bg-red-50" type="button">
                            Reject
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Leave Requests Tab */}
      {activeTab === "leave" && (
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="h3">Leave Request Approvals</h2>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleSelectAll(mockLeaveRequests)}
                type="button"
              >
                {selectedItems.length === mockLeaveRequests.length ? "Deselect All" : "Select All"}
              </button>
            </div>
          </div>
          <div className="card-body">
            <div className="space-y-4">
              {mockLeaveRequests.map((request) => (
                <div key={request.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(request.id)}
                      onChange={() => handleSelectItem(request.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="h4 mb-1">{request.eorName}</h4>
                          <p className="body-sm text-gray-600">
                            {request.eorEmail} • {request.client}
                          </p>
                        </div>
                        <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                          {request.leaveType}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div>
                          <p className="body-sm text-gray-600">Dates</p>
                          <p className="body-md">
                            {new Date(request.startDate).toLocaleDateString()} -{" "}
                            {new Date(request.endDate).toLocaleDateString()}
                          </p>
                          <p className="body-sm text-gray-600">{request.days} days</p>
                        </div>
                        <div>
                          <p className="body-sm text-gray-600">Reason</p>
                          <p className="body-md">{request.reason}</p>
                        </div>
                        <div>
                          <p className="body-sm text-gray-600">Submitted</p>
                          <p className="body-md">{new Date(request.submittedDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      {request.conflicts && request.conflicts.length > 0 && (
                        <div className="p-3 bg-yellow-50 border border-yellow-200 rounded mb-3">
                          <p className="body-sm text-yellow-700 font-medium mb-1">Potential Conflicts:</p>
                          <ul className="body-sm text-yellow-700">
                            {request.conflicts.map((conflict, index) => (
                              <li key={index}>• {conflict}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <button className="btn btn-secondary btn-sm" type="button">
                          View Details
                        </button>
                        <button className="btn btn-primary btn-sm" type="button">
                          Approve
                        </button>
                        <button className="btn btn-secondary btn-sm text-red-600 hover:bg-red-50" type="button">
                          Reject
                        </button>
                        <button className="btn btn-secondary btn-sm" type="button">
                          Add Comment
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
