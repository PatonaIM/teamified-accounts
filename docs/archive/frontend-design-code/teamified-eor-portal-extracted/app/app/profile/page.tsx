"use client"

import { useState } from "react"

interface ProfileSection {
  id: string
  title: string
  lastUpdated?: string
  updatedBy?: string
}

export default function ProfilePage() {
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const handleSectionSave = (sectionId: string, sectionTitle: string) => {
    setEditingSection(null)
    setToastMessage(`${sectionTitle} updated successfully`)
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleSectionEdit = (sectionId: string) => {
    setEditingSection(sectionId)
  }

  const handleSectionCancel = () => {
    setEditingSection(null)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="h2">My Profile</h1>
        <div className="flex items-center gap-2">
          <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
          <span className="body-sm text-gray-600">Profile 75% complete</span>
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4 z-50">
          <span className="body-sm">{toastMessage}</span>
        </div>
      )}

      <div className="space-y-6">
        {/* Personal Information Section */}
        <section className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="h3">Personal Information</h2>
              {editingSection !== "personal" && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleSectionEdit("personal")}
                  type="button"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
          <div className="card-body">
            {editingSection === "personal" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSectionSave("personal", "Personal Information")
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="legal-first-name">
                      Legal First Name *
                    </label>
                    <input id="legal-first-name" className="form-input" type="text" defaultValue="Alex" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="legal-last-name">
                      Legal Last Name *
                    </label>
                    <input id="legal-last-name" className="form-input" type="text" defaultValue="Johnson" required />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="preferred-first-name">
                      Preferred First Name
                    </label>
                    <input id="preferred-first-name" className="form-input" type="text" defaultValue="Alex" />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="preferred-last-name">
                      Preferred Last Name
                    </label>
                    <input id="preferred-last-name" className="form-input" type="text" defaultValue="Johnson" />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="btn btn-primary" type="submit">
                    Save Changes
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={handleSectionCancel}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="body-sm text-gray-600 mb-1">Legal Name</p>
                  <p className="body-md">Alex Johnson</p>
                </div>
                <div>
                  <p className="body-sm text-gray-600 mb-1">Preferred Name</p>
                  <p className="body-md">Alex Johnson</p>
                </div>
              </div>
            )}
            {editingSection !== "personal" && (
              <p className="caption mt-3 text-gray-500">Last updated: Aug 15, 2024 by Alex Johnson</p>
            )}
          </div>
        </section>

        {/* Contact Information Section */}
        <section className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="h3">Contact Information</h2>
              {editingSection !== "contact" && (
                <button className="btn btn-secondary btn-sm" onClick={() => handleSectionEdit("contact")} type="button">
                  Edit
                </button>
              )}
            </div>
          </div>
          <div className="card-body">
            {editingSection === "contact" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSectionSave("contact", "Contact Information")
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="email">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      className="form-input"
                      type="email"
                      defaultValue="alex.johnson@example.com"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="phone">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      className="form-input"
                      type="tel"
                      defaultValue="+1 (555) 123-4567"
                      placeholder="+1 (555) 123-4567"
                    />
                    <p className="form-help">Use E.164 format (e.g., +1 555 123 4567)</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="btn btn-primary" type="submit">
                    Save Changes
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={handleSectionCancel}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="body-sm text-gray-600 mb-1">Email Address</p>
                  <p className="body-md">alex.johnson@example.com</p>
                </div>
                <div>
                  <p className="body-sm text-gray-600 mb-1">Phone Number</p>
                  <p className="body-md">+1 (555) 123-4567</p>
                </div>
              </div>
            )}
            {editingSection !== "contact" && (
              <p className="caption mt-3 text-gray-500">Last updated: Aug 10, 2024 by Alex Johnson</p>
            )}
          </div>
        </section>

        {/* Address Section */}
        <section className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="h3">Address</h2>
              {editingSection !== "address" && (
                <button className="btn btn-secondary btn-sm" onClick={() => handleSectionEdit("address")} type="button">
                  Edit
                </button>
              )}
            </div>
          </div>
          <div className="card-body">
            {editingSection === "address" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSectionSave("address", "Address")
                }}
              >
                <div className="space-y-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="address-line-1">
                      Address Line 1 *
                    </label>
                    <input
                      id="address-line-1"
                      className="form-input"
                      type="text"
                      defaultValue="123 Main Street"
                      maxLength={100}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="address-line-2">
                      Address Line 2
                    </label>
                    <input
                      id="address-line-2"
                      className="form-input"
                      type="text"
                      defaultValue="Apt 4B"
                      maxLength={100}
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="form-group">
                      <label className="form-label" htmlFor="city">
                        City *
                      </label>
                      <input id="city" className="form-input" type="text" defaultValue="San Francisco" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="state">
                        State/Province *
                      </label>
                      <input id="state" className="form-input" type="text" defaultValue="CA" required />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="postal-code">
                        Postal Code *
                      </label>
                      <input id="postal-code" className="form-input" type="text" defaultValue="94105" required />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group">
                      <label className="form-label" htmlFor="country">
                        Country *
                      </label>
                      <select id="country" className="form-select" required>
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="GB">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="DE">Germany</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor="timezone">
                        Timezone *
                      </label>
                      <select id="timezone" className="form-select" required>
                        <option value="America/Los_Angeles">Pacific Time (PT)</option>
                        <option value="America/Denver">Mountain Time (MT)</option>
                        <option value="America/Chicago">Central Time (CT)</option>
                        <option value="America/New_York">Eastern Time (ET)</option>
                        <option value="Europe/London">Greenwich Mean Time (GMT)</option>
                        <option value="Europe/Berlin">Central European Time (CET)</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="btn btn-primary" type="submit">
                    Save Changes
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={handleSectionCancel}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="body-sm text-gray-600 mb-1">Address</p>
                  <p className="body-md">123 Main Street, Apt 4B</p>
                  <p className="body-md">San Francisco, CA 94105</p>
                  <p className="body-md">United States</p>
                </div>
                <div>
                  <p className="body-sm text-gray-600 mb-1">Timezone</p>
                  <p className="body-md">Pacific Time (PT)</p>
                </div>
              </div>
            )}
            {editingSection !== "address" && (
              <p className="caption mt-3 text-gray-500">Last updated: Aug 5, 2024 by Alex Johnson</p>
            )}
          </div>
        </section>

        {/* Emergency Contact Section */}
        <section className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="h3">Emergency Contact</h2>
              {editingSection !== "emergency" && (
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => handleSectionEdit("emergency")}
                  type="button"
                >
                  Edit
                </button>
              )}
            </div>
          </div>
          <div className="card-body">
            {editingSection === "emergency" ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault()
                  handleSectionSave("emergency", "Emergency Contact")
                }}
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-group">
                    <label className="form-label" htmlFor="emergency-name">
                      Full Name *
                    </label>
                    <input
                      id="emergency-name"
                      className="form-input"
                      type="text"
                      defaultValue="Sarah Johnson"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="emergency-relationship">
                      Relationship *
                    </label>
                    <select id="emergency-relationship" className="form-select" required>
                      <option value="">Select relationship</option>
                      <option value="spouse">Spouse</option>
                      <option value="parent">Parent</option>
                      <option value="sibling">Sibling</option>
                      <option value="child">Child</option>
                      <option value="friend">Friend</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="emergency-phone">
                      Phone Number *
                    </label>
                    <input
                      id="emergency-phone"
                      className="form-input"
                      type="tel"
                      defaultValue="+1 (555) 987-6543"
                      placeholder="+1 (555) 123-4567"
                      required
                    />
                    <p className="form-help">Use E.164 format (e.g., +1 555 123 4567)</p>
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="emergency-email">
                      Email Address
                    </label>
                    <input
                      id="emergency-email"
                      className="form-input"
                      type="email"
                      defaultValue="sarah.johnson@example.com"
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-4">
                  <button className="btn btn-primary" type="submit">
                    Save Changes
                  </button>
                  <button className="btn btn-secondary" type="button" onClick={handleSectionCancel}>
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="body-sm text-gray-600 mb-1">Name</p>
                  <p className="body-md">Sarah Johnson</p>
                </div>
                <div>
                  <p className="body-sm text-gray-600 mb-1">Relationship</p>
                  <p className="body-md">Spouse</p>
                </div>
                <div>
                  <p className="body-sm text-gray-600 mb-1">Phone Number</p>
                  <p className="body-md">+1 (555) 987-6543</p>
                </div>
                <div>
                  <p className="body-sm text-gray-600 mb-1">Email Address</p>
                  <p className="body-md">sarah.johnson@example.com</p>
                </div>
              </div>
            )}
            {editingSection !== "emergency" && (
              <p className="caption mt-3 text-gray-500">Last updated: Jul 28, 2024 by Alex Johnson</p>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}
