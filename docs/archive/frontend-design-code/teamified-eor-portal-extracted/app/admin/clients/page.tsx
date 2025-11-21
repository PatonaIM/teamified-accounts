"use client"

import type React from "react"

import { useState } from "react"

interface Client {
  id: string
  name: string
  industry: string
  location: string
  activeEORs: number
  totalEORs: number
  status: "active" | "inactive"
  contractStart: string
}

interface EORAssignment {
  id: string
  eorId: string
  eorName: string
  email: string
  clientId: string
  clientName: string
  startDate: string
  endDate?: string
  status: "active" | "transitioning" | "ended"
  country: string
}

const mockClients: Client[] = [
  {
    id: "1",
    name: "Alpha Corp",
    industry: "Technology",
    location: "San Francisco, CA",
    activeEORs: 8,
    totalEORs: 10,
    status: "active",
    contractStart: "2024-01-15",
  },
  {
    id: "2",
    name: "Beta Industries",
    industry: "Manufacturing",
    location: "Chicago, IL",
    activeEORs: 6,
    totalEORs: 8,
    status: "active",
    contractStart: "2024-02-01",
  },
  {
    id: "3",
    name: "Gamma Solutions",
    industry: "Consulting",
    location: "New York, NY",
    activeEORs: 5,
    totalEORs: 6,
    status: "active",
    contractStart: "2024-03-10",
  },
]

const mockAssignments: EORAssignment[] = [
  {
    id: "1",
    eorId: "1",
    eorName: "Alex Johnson",
    email: "alex.johnson@example.com",
    clientId: "1",
    clientName: "Alpha Corp",
    startDate: "2024-06-15",
    status: "active",
    country: "United States",
  },
  {
    id: "2",
    eorId: "2",
    eorName: "Sarah Chen",
    email: "sarah.chen@example.com",
    clientId: "2",
    clientName: "Beta Industries",
    startDate: "2024-07-01",
    status: "active",
    country: "Canada",
  },
]

export default function ClientsPage() {
  const [selectedClient, setSelectedClient] = useState<string>("1")
  const [showAssignModal, setShowAssignModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [assignmentForm, setAssignmentForm] = useState({
    eorId: "",
    startDate: "",
    endDate: "",
    notes: "",
  })

  const selectedClientData = mockClients.find((c) => c.id === selectedClient)
  const clientAssignments = mockAssignments.filter((a) => a.clientId === selectedClient)

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "transitioning":
        return "bg-yellow-100 text-yellow-800"
      case "ended":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleAssignSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (!assignmentForm.eorId || !assignmentForm.startDate) {
      setToastMessage("Please fill in all required fields")
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
      return
    }

    // Check for overlapping assignments
    const hasActiveAssignment = mockAssignments.some((a) => a.eorId === assignmentForm.eorId && a.status === "active")

    if (hasActiveAssignment) {
      setToastMessage("Warning: EOR has an active assignment. Consider transitioning first.")
      setShowToast(true)
      setTimeout(() => setShowToast(false), 5000)
      return
    }

    // Success
    setToastMessage("EOR assigned successfully")
    setShowToast(true)
    setShowAssignModal(false)
    setAssignmentForm({ eorId: "", startDate: "", endDate: "", notes: "" })
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleTransition = (assignmentId: string) => {
    setToastMessage("Transition initiated. EOR will be notified.")
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="h2">Client Management</h1>
        <div className="flex gap-2">
          <button className="btn btn-primary" onClick={() => setShowAssignModal(true)} type="button">
            Assign EOR
          </button>
          <button className="btn btn-secondary" type="button">
            Export Roster
          </button>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 z-50">
          <span className="body-sm">{toastMessage}</span>
        </div>
      )}

      {/* Client Selection */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockClients.map((client) => (
              <button
                key={client.id}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  selectedClient === client.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                }`}
                onClick={() => setSelectedClient(client.id)}
                type="button"
              >
                <h3 className="h4 mb-2">{client.name}</h3>
                <p className="body-sm text-gray-600 mb-2">
                  {client.industry} • {client.location}
                </p>
                <div className="flex justify-between items-center">
                  <span className="body-sm font-medium">
                    {client.activeEORs} / {client.totalEORs} EORs
                  </span>
                  <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(client.status)}`}>
                    {client.status.charAt(0).toUpperCase() + client.status.slice(1)}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Client Details */}
      {selectedClientData && (
        <div className="card mb-6">
          <div className="card-header">
            <h2 className="h3">{selectedClientData.name} - Roster</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="display-2 text-blue-600 mb-1">{selectedClientData.activeEORs}</p>
                <p className="body-sm text-gray-600">Active EORs</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="display-2 text-green-600 mb-1">{selectedClientData.totalEORs}</p>
                <p className="body-sm text-gray-600">Total EORs</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <p className="display-2 text-purple-600 mb-1">0</p>
                <p className="body-sm text-gray-600">Transitioning</p>
              </div>
              <div className="text-center p-4 bg-gray-50 rounded-lg">
                <p className="display-2 text-gray-600 mb-1">2</p>
                <p className="body-sm text-gray-600">Ended</p>
              </div>
            </div>

            {/* Assignments Table */}
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>EOR</th>
                    <th>Country</th>
                    <th>Start Date</th>
                    <th>End Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {clientAssignments.map((assignment) => (
                    <tr key={assignment.id}>
                      <td>
                        <div>
                          <p className="body-md font-medium">{assignment.eorName}</p>
                          <p className="body-sm text-gray-600">{assignment.email}</p>
                        </div>
                      </td>
                      <td className="body-md">{assignment.country}</td>
                      <td className="body-sm">{new Date(assignment.startDate).toLocaleDateString()}</td>
                      <td className="body-sm">
                        {assignment.endDate ? new Date(assignment.endDate).toLocaleDateString() : "Ongoing"}
                      </td>
                      <td>
                        <span
                          className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(assignment.status)}`}
                        >
                          {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          {assignment.status === "active" && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleTransition(assignment.id)}
                              type="button"
                            >
                              Transition
                            </button>
                          )}
                          <button className="btn btn-secondary btn-sm" type="button">
                            View Details
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {clientAssignments.length === 0 && (
              <div className="text-center py-8">
                <p className="body-md text-gray-600 mb-4">No EORs assigned to this client yet.</p>
                <button className="btn btn-primary" onClick={() => setShowAssignModal(true)} type="button">
                  Assign First EOR
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Assignment Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="h3">Assign EOR to {selectedClientData?.name}</h3>
              <button
                className="text-gray-400 hover:text-gray-600"
                onClick={() => setShowAssignModal(false)}
                type="button"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAssignSubmit}>
              <div className="space-y-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="eor-select">
                    Select EOR *
                  </label>
                  <select
                    id="eor-select"
                    className="form-select"
                    value={assignmentForm.eorId}
                    onChange={(e) => setAssignmentForm((prev) => ({ ...prev, eorId: e.target.value }))}
                    required
                  >
                    <option value="">Choose an EOR</option>
                    <option value="3">Maria Rodriguez</option>
                    <option value="4">James Wilson</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="start-date">
                    Start Date *
                  </label>
                  <input
                    id="start-date"
                    className="form-input"
                    type="date"
                    value={assignmentForm.startDate}
                    onChange={(e) => setAssignmentForm((prev) => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="end-date">
                    End Date (Optional)
                  </label>
                  <input
                    id="end-date"
                    className="form-input"
                    type="date"
                    value={assignmentForm.endDate}
                    onChange={(e) => setAssignmentForm((prev) => ({ ...prev, endDate: e.target.value }))}
                  />
                  <p className="form-help">Leave blank for ongoing assignment</p>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="notes">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    className="form-input"
                    rows={3}
                    placeholder="Optional assignment notes..."
                    value={assignmentForm.notes}
                    onChange={(e) => setAssignmentForm((prev) => ({ ...prev, notes: e.target.value }))}
                  />
                </div>

                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="body-sm text-yellow-700">
                    <strong>Note:</strong> EORs can only have one active client assignment at a time. If the selected
                    EOR has an existing assignment, it will need to be transitioned first.
                  </p>
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <button className="btn btn-primary" type="submit">
                  Assign EOR
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => setShowAssignModal(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
