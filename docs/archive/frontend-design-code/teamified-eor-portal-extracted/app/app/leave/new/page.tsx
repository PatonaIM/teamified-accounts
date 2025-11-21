"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function NewLeaveRequestPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    type: "",
    startDate: "",
    endDate: "",
    reason: "",
  })
  const [showToast, setShowToast] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const calculateDays = (start: string, end: string) => {
    if (!start || !end) return 0
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.type) {
      newErrors.type = "Leave type is required"
    }

    if (!formData.startDate) {
      newErrors.startDate = "Start date is required"
    }

    if (!formData.endDate) {
      newErrors.endDate = "End date is required"
    }

    if (formData.startDate && formData.endDate) {
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      if (startDate < today) {
        newErrors.startDate = "Start date cannot be in the past"
      }

      if (endDate < startDate) {
        newErrors.endDate = "End date cannot be before start date"
      }
    }

    if (formData.reason.length > 500) {
      newErrors.reason = "Reason cannot exceed 500 characters"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    // TODO: Submit to API
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
      router.push("/app/leave")
    }, 2000)
  }

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }))
    }
  }

  const totalDays = calculateDays(formData.startDate, formData.endDate)

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="h2">Request Leave</h1>
        <button className="btn btn-secondary" onClick={() => router.back()} type="button">
          Cancel
        </button>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 z-50">
          <span className="body-sm">Leave request submitted successfully!</span>
        </div>
      )}

      <div className="max-w-2xl">
        <form onSubmit={handleSubmit}>
          <div className="card">
            <div className="card-header">
              <h2 className="h3">Leave Request Details</h2>
            </div>
            <div className="card-body space-y-4">
              {/* Leave Type */}
              <div className="form-group">
                <label className="form-label" htmlFor="leave-type">
                  Leave Type *
                </label>
                <select
                  id="leave-type"
                  className={`form-select ${errors.type ? "form-input--error" : ""}`}
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  required
                >
                  <option value="">Select leave type</option>
                  <option value="annual">Annual Leave</option>
                  <option value="sick">Sick Leave</option>
                  <option value="personal">Personal Leave</option>
                  <option value="other">Other</option>
                </select>
                {errors.type && <p className="form-error">{errors.type}</p>}
              </div>

              {/* Date Range */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label" htmlFor="start-date">
                    Start Date *
                  </label>
                  <input
                    id="start-date"
                    className={`form-input ${errors.startDate ? "form-input--error" : ""}`}
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange("startDate", e.target.value)}
                    required
                  />
                  {errors.startDate && <p className="form-error">{errors.startDate}</p>}
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="end-date">
                    End Date *
                  </label>
                  <input
                    id="end-date"
                    className={`form-input ${errors.endDate ? "form-input--error" : ""}`}
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange("endDate", e.target.value)}
                    required
                  />
                  {errors.endDate && <p className="form-error">{errors.endDate}</p>}
                </div>
              </div>

              {/* Duration Display */}
              {totalDays > 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                  <p className="body-sm text-blue-700">
                    Duration:{" "}
                    <strong>
                      {totalDays} day{totalDays > 1 ? "s" : ""}
                    </strong>
                  </p>
                </div>
              )}

              {/* Reason */}
              <div className="form-group">
                <label className="form-label" htmlFor="reason">
                  Reason
                </label>
                <textarea
                  id="reason"
                  className={`form-input ${errors.reason ? "form-input--error" : ""}`}
                  rows={4}
                  maxLength={500}
                  placeholder="Optional: Provide additional details about your leave request..."
                  value={formData.reason}
                  onChange={(e) => handleInputChange("reason", e.target.value)}
                />
                <p className="form-help">{formData.reason.length}/500 characters</p>
                {errors.reason && <p className="form-error">{errors.reason}</p>}
              </div>

              {/* Leave Balance Warning */}
              {formData.type === "annual" && totalDays > 18 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="body-sm text-yellow-700">
                    <strong>Warning:</strong> This request exceeds your available annual leave balance (18 days).
                  </p>
                </div>
              )}

              {formData.type === "sick" && totalDays > 5 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="body-sm text-yellow-700">
                    <strong>Warning:</strong> This request exceeds your available sick leave balance (5 days).
                  </p>
                </div>
              )}

              {formData.type === "personal" && totalDays > 3 && (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded">
                  <p className="body-sm text-yellow-700">
                    <strong>Warning:</strong> This request exceeds your available personal leave balance (3 days).
                  </p>
                </div>
              )}
            </div>

            <div className="card-footer">
              <div className="flex gap-2">
                <button className="btn btn-primary" type="submit">
                  Submit Request
                </button>
                <button className="btn btn-secondary" type="button" onClick={() => router.back()}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
