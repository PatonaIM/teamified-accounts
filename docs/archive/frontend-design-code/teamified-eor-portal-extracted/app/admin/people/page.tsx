"use client"

import { useState } from "react"
import Link from "next/link"

interface EOR {
  id: string
  firstName: string
  lastName: string
  email: string
  country: string
  client: string
  status: "active" | "inactive" | "pending"
  startDate: string
  timezone: string
  profileComplete: number
}

interface Admin {
  id: string
  firstName: string
  lastName: string
  email: string
  role: "Super Admin" | "Operations Admin" | "HR Admin"
  lastActive: string
  status: "active" | "inactive"
}

const mockEORs: EOR[] = [
  {
    id: "1",
    firstName: "Alex",
    lastName: "Johnson",
    email: "alex.johnson@example.com",
    country: "United States",
    client: "Alpha Corp",
    status: "active",
    startDate: "2024-06-15",
    timezone: "America/Los_Angeles",
    profileComplete: 95,
  },
  {
    id: "2",
    firstName: "Sarah",
    lastName: "Chen",
    email: "sarah.chen@example.com",
    country: "Canada",
    client: "Beta Industries",
    status: "active",
    startDate: "2024-07-01",
    timezone: "America/Toronto",
    profileComplete: 88,
  },
  {
    id: "3",
    firstName: "Maria",
    lastName: "Rodriguez",
    email: "maria.rodriguez@example.com",
    country: "United States",
    client: "Gamma Solutions",
    status: "active",
    startDate: "2024-05-20",
    timezone: "America/New_York",
    profileComplete: 92,
  },
  {
    id: "4",
    firstName: "James",
    lastName: "Wilson",
    email: "james.wilson@example.com",
    country: "United Kingdom",
    client: "Delta Tech",
    status: "pending",
    startDate: "2024-09-01",
    timezone: "Europe/London",
    profileComplete: 45,
  },
]

const mockAdmins: Admin[] = [
  {
    id: "1",
    firstName: "Emma",
    lastName: "Thompson",
    email: "emma.thompson@teamified.com",
    role: "Super Admin",
    lastActive: "2024-09-01T14:30:00Z",
    status: "active",
  },
  {
    id: "2",
    firstName: "David",
    lastName: "Kim",
    email: "david.kim@teamified.com",
    role: "Operations Admin",
    lastActive: "2024-09-01T16:45:00Z",
    status: "active",
  },
  {
    id: "3",
    firstName: "Lisa",
    lastName: "Brown",
    email: "lisa.brown@teamified.com",
    role: "HR Admin",
    lastActive: "2024-08-30T09:15:00Z",
    status: "active",
  },
]

export default function PeoplePage() {
  const [activeTab, setActiveTab] = useState<"eors" | "admins">("eors")
  const [searchTerm, setSearchTerm] = useState("")
  const [clientFilter, setClientFilter] = useState("all")
  const [countryFilter, setCountryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "inactive":
        return "bg-gray-100 text-gray-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case "Super Admin":
        return "bg-purple-100 text-purple-800"
      case "Operations Admin":
        return "bg-blue-100 text-blue-800"
      case "HR Admin":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const filteredEORs = mockEORs.filter((eor) => {
    const matchesSearch =
      eor.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eor.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      eor.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesClient = clientFilter === "all" || eor.client === clientFilter
    const matchesCountry = countryFilter === "all" || eor.country === countryFilter
    const matchesStatus = statusFilter === "all" || eor.status === statusFilter

    return matchesSearch && matchesClient && matchesCountry && matchesStatus
  })

  const filteredAdmins = mockAdmins.filter((admin) => {
    return (
      admin.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      admin.role.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })

  const uniqueClients = Array.from(new Set(mockEORs.map((eor) => eor.client)))
  const uniqueCountries = Array.from(new Set(mockEORs.map((eor) => eor.country)))

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="h2">People Management</h1>
        <div className="flex gap-2">
          <Link href="/admin/invitations" className="btn btn-primary">
            Send Invitation
          </Link>
          <button className="btn btn-secondary" type="button">
            Export List
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex gap-2">
            <button
              className={`btn btn-sm ${activeTab === "eors" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab("eors")}
              type="button"
            >
              EORs ({mockEORs.length})
            </button>
            <button
              className={`btn btn-sm ${activeTab === "admins" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab("admins")}
              type="button"
            >
              Admins ({mockAdmins.length})
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="form-group">
              <label className="form-label" htmlFor="search">
                Search
              </label>
              <input
                id="search"
                className="form-input"
                type="text"
                placeholder="Name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {activeTab === "eors" && (
              <>
                <div className="form-group">
                  <label className="form-label" htmlFor="client-filter">
                    Client
                  </label>
                  <select
                    id="client-filter"
                    className="form-select"
                    value={clientFilter}
                    onChange={(e) => setClientFilter(e.target.value)}
                  >
                    <option value="all">All Clients</option>
                    {uniqueClients.map((client) => (
                      <option key={client} value={client}>
                        {client}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="country-filter">
                    Country
                  </label>
                  <select
                    id="country-filter"
                    className="form-select"
                    value={countryFilter}
                    onChange={(e) => setCountryFilter(e.target.value)}
                  >
                    <option value="all">All Countries</option>
                    {uniqueCountries.map((country) => (
                      <option key={country} value={country}>
                        {country}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label" htmlFor="status-filter">
                    Status
                  </label>
                  <select
                    id="status-filter"
                    className="form-select"
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  >
                    <option value="all">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group flex items-end">
              <button
                className="btn btn-secondary w-full"
                onClick={() => {
                  setSearchTerm("")
                  setClientFilter("all")
                  setCountryFilter("all")
                  setStatusFilter("all")
                }}
                type="button"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* EORs Tab */}
      {activeTab === "eors" && (
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="h3">EOR Directory</h2>
              <span className="body-sm text-gray-600">{filteredEORs.length} results</span>
            </div>
          </div>
          <div className="card-body">
            {filteredEORs.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Client</th>
                      <th>Country</th>
                      <th>Status</th>
                      <th>Start Date</th>
                      <th>Profile</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEORs.map((eor) => (
                      <tr key={eor.id}>
                        <td>
                          <div>
                            <p className="body-md font-medium">
                              {eor.firstName} {eor.lastName}
                            </p>
                            <p className="body-sm text-gray-600">{eor.email}</p>
                          </div>
                        </td>
                        <td className="body-md">{eor.client}</td>
                        <td className="body-md">{eor.country}</td>
                        <td>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(eor.status)}`}>
                            {eor.status.charAt(0).toUpperCase() + eor.status.slice(1)}
                          </span>
                        </td>
                        <td className="body-sm">{new Date(eor.startDate).toLocaleDateString()}</td>
                        <td>
                          <div className="flex items-center gap-2">
                            <div className="w-16 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-blue-600 h-2 rounded-full"
                                style={{ width: `${eor.profileComplete}%` }}
                              ></div>
                            </div>
                            <span className="body-sm text-gray-600">{eor.profileComplete}%</span>
                          </div>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <Link href={`/admin/people/${eor.id}`} className="btn btn-secondary btn-sm">
                              View
                            </Link>
                            <Link href={`/admin/clients?assign=${eor.id}`} className="btn btn-primary btn-sm">
                              Assign
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="body-md text-gray-600 mb-4">No EORs found matching your criteria.</p>
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    setSearchTerm("")
                    setClientFilter("all")
                    setCountryFilter("all")
                    setStatusFilter("all")
                  }}
                  type="button"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Admins Tab */}
      {activeTab === "admins" && (
        <div className="card">
          <div className="card-header">
            <div className="flex justify-between items-center">
              <h2 className="h3">Admin Users</h2>
              <span className="body-sm text-gray-600">{filteredAdmins.length} results</span>
            </div>
          </div>
          <div className="card-body">
            {filteredAdmins.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Role</th>
                      <th>Last Active</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAdmins.map((admin) => (
                      <tr key={admin.id}>
                        <td>
                          <div>
                            <p className="body-md font-medium">
                              {admin.firstName} {admin.lastName}
                            </p>
                            <p className="body-sm text-gray-600">{admin.email}</p>
                          </div>
                        </td>
                        <td>
                          <span className={`inline-block px-2 py-1 text-xs rounded-full ${getRoleColor(admin.role)}`}>
                            {admin.role}
                          </span>
                        </td>
                        <td className="body-sm">{new Date(admin.lastActive).toLocaleString()}</td>
                        <td>
                          <span
                            className={`inline-block px-2 py-1 text-xs rounded-full ${getStatusColor(admin.status)}`}
                          >
                            {admin.status.charAt(0).toUpperCase() + admin.status.slice(1)}
                          </span>
                        </td>
                        <td>
                          <div className="flex gap-1">
                            <Link href={`/admin/people/admin/${admin.id}`} className="btn btn-secondary btn-sm">
                              View
                            </Link>
                            <button className="btn btn-secondary btn-sm" type="button">
                              Edit Role
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="body-md text-gray-600 mb-4">No admins found matching your search.</p>
                <button className="btn btn-secondary" onClick={() => setSearchTerm("")} type="button">
                  Clear Search
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
