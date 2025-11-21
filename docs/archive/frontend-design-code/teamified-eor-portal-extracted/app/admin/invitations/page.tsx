"use client"

import type React from "react"

import { useState } from "react"

interface Invitation {
  id: string
  firstName: string
  lastName: string
  email: string
  country: string
  client: string
  role: "EOR" | "Admin"
  status: "pending" | "accepted" | "expired" | "revoked"
  sentDate: string
  expiryDate: string
  lastReminder?: string
}

const mockInvitations: Invitation[] = [
  {
    id: "1",
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    country: "United States",
    client: "Alpha Corp",
    role: "EOR",
    status: "pending",
    sentDate: "2024-09-01",
    expiryDate: "2024-09-08",
  },
  {
    id: "2",
    firstName: "Jane",
    lastName: "Smith",
    email: "jane.smith@example.com",
    country: "Canada",
    client: "Beta Industries",
    role: "EOR",
    status: "expired",
    sentDate: "2024-08-20",
    expiryDate: "2024-08-27",
    lastReminder: "2024-08-24",
  },
  {
    id: "3",
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike.johnson@example.com",
    country: "United Kingdom",
    client: "Gamma Solutions",
    role: "Admin",
    status: "accepted",
    sentDate: "2024-08-25",
    expiryDate: "2024-09-01",
  },
]

export default function InvitationsPage() {
  const [invitations, setInvitations] = useState<Invitation[]>(mockInvitations)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    country: "",
    client: "",
    role: "EOR" as "EOR" | "Admin",
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "accepted":
        return "bg-green-100 text-green-800"
      case "expired":
        return "bg-red-100 text-red-800"
      case "revoked":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate)
    const now = new Date()
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diffDays <= 2 && diffDays > 0
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.email.trim()) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email format"
    if (!formData.country) newErrors.country = "Country is required"
    if (!formData.client) newErrors.client = "Client is required"

    // Check for duplicate email
    if (invitations.some((inv) => inv.email.toLowerCase() === formData.email.toLowerCase())) {
      newErrors.email = "An invitation already exists for this email"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const newInvitation: Invitation = {
      id: String(invitations.length + 1),
      ...formData,
      status: "pending",
      sentDate: new Date().toISOString().split("T")[0],
      expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 7 days from now
    }

    setInvitations([newInvitation, ...invitations])
    setFormData({
      firstName: "",
      lastName: "",
      email: "",
      country: "",
      client: "",
      role: "EOR",
    })
    setShowCreateForm(false)
    setToastMessage("Invitation sent successfully")
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleResend = (id: string) => {
    setInvitations((prev) =>
      prev.map((inv) =>
        inv.id === id
          ? {
              ...inv,
              status: "pending" as const,
              sentDate: new Date().toISOString().split("T")[0],
              expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
              lastReminder: undefined,
            }
          : inv,
      ),
    )
    setToastMessage("Invitation resent successfully")
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleRevoke = (id: string) => {
    setInvitations((prev) => prev.map((inv) => (inv.id === id ? { ...inv, status: "revoked" as const } : inv)))
    setToastMessage("Invitation revoked")
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="h2">Invitations</h1>
        <button className="btn btn-primary" onClick={() => setShowCreateForm(!showCreateForm)} type="button">
          {showCreateForm ? "Cancel" : "Send Invitation"}
        </button>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 z-50">
          <span className="body-sm">{toastMessage}</span>
        </div>
      )}

      {/* Create Invitation Form */}
      {showCreateForm && (
        <div className="card mb-6">
          <div className="card-header">
            <h2 className="h3">Send New Invitation</h2>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="first-name">
                    First Name *
                  </label>
                  <input
                    id="first-name"
                    className={`form-input ${errors.firstName ? "form-input--error" : ""}`}
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange("firstName", e.target.value)}
                    required
                  />
                  {errors.firstName && <p className="form-error">{errors.firstName}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="last-name">
                    Last Name *
                  </label>
                  <input
                    id="last-name"
                    className={`form-input ${errors.lastName ? "form-input--error" : ""}`}
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange("lastName", e.target.value)}
                    required
                  />
                  {errors.lastName && <p className="form-error">{errors.lastName}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="email">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    className={`form-input ${errors.email ? "form-input--error" : ""}`}
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    required
                  />
                  {errors.email && <p className="form-error">{errors.email}</p>}
                  <p className="form-help">A one-time link will be sent. Expires in 7 days.</p>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="country">
                    Country *
                  </label>
                  <select
                    id="country"
                    className={`form-select ${errors.country ? "form-input--error" : ""}`}
                    value={formData.country}
                    onChange={(e) => handleInputChange("country", e.target.value)}
                    required
                  >
                    <option value="">Select country</option>
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Germany">Germany</option>
                    <option value="Australia">Australia</option>
                    <option value="France">France</option>
                  </select>
                  {errors.country && <p className="form-error">{errors.country}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="client">
                    Client *
                  </label>
                  <select
                    id="client"
                    className={`form-select ${errors.client ? "form-input--error" : ""}`}
                    value={formData.client}
                    onChange={(e) => handleInputChange("client", e.target.value)}
                    required
                  >
                    <option value="">Select client</option>
                    <option value="Alpha Corp">Alpha Corp</option>
                    <option value="Beta Industries">Beta Industries</option>
                    <option value="Gamma Solutions">Gamma Solutions</option>
                    <option value="Delta Tech">Delta Tech</option>
                    <option value="Epsilon Labs">Epsilon Labs</option>
                  </select>
                  {errors.client && <p className="form-error">{errors.client}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="role">
                    Role *
                  </label>
                  <select
                    id="role"
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => handleInputChange("role", e.target.value as "EOR" | "Admin")}
                  >
                    <option value="EOR">EOR</option>
                    <option value="Admin">Admin</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2">
                <button className="btn btn-primary" type="submit">
                  Send Invitation
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => setShowCreateForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Invitations List */}
      <div className="card">
        <div className="card-header">
          <h2 className="h3">Pending Invitations</h2>
        </div>
        <div className="card-body">
          {invitations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Invitee</th>
                    <th>Role</th>
                    <th>Client</th>
                    <th>Country</th>
                    <th>Status</th>
                    <th>Sent</th>
                    <th>Expires</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {invitations.map((invitation) => (
                    <tr key={invitation.id}>
                      <td>
                        <div>
                          <p className="body-md font-medium">
                            {invitation.firstName} {invitation.lastName}
                          </p>
                          <p className="body-sm text-gray-600">{invitation.email}</p>
                        </div>
                      </td>
                      <td className="body-md">{invitation.role}</td>
                      <td className="body-md">{invitation.client}</td>
                      <td className="body-md">{invitation.country}</td>
                      <td>
                        <div className="flex flex-col gap-1">
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(invitation.status)}`}
                          >
                            {invitation.status.charAt(0).toUpperCase() + invitation.status.slice(1)}
                          </span>
                          {invitation.status === "pending" && isExpiringSoon(invitation.expiryDate) && (
                            <span className="inline-block px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                              Expiring Soon
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="body-sm">{new Date(invitation.sentDate).toLocaleDateString()}</td>
                      <td className="body-sm">
                        <div>
                          <span>{new Date(invitation.expiryDate).toLocaleDateString()}</span>
                          {invitation.lastReminder && (
                            <p className="text-xs text-gray-500 mt-1">
                              Reminded: {new Date(invitation.lastReminder).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </td>
                      <td>
                        <div className="flex gap-1">
                          {(invitation.status === "pending" || invitation.status === "expired") && (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => handleResend(invitation.id)}
                              type="button"
                            >
                              Resend
                            </button>
                          )}
                          {invitation.status === "pending" && (
                            <button
                              className="btn btn-secondary btn-sm text-red-600 hover:bg-red-50"
                              onClick={() => handleRevoke(invitation.id)}
                              type="button"
                            >
                              Revoke
                            </button>
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
              <p className="body-md text-gray-600 mb-4">No invitations sent yet.</p>
              <button className="btn btn-primary" onClick={() => setShowCreateForm(true)} type="button">
                Send Your First Invitation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
