"use client"

import { useState } from "react"

interface Payslip {
  id: string
  period: string
  processedDate: string
  netPay: string
  status: "available" | "processing"
  downloadUrl: string
}

interface HRDocument {
  id: string
  title: string
  description: string
  category: string
  publishedDate: string
  tags: string[]
  downloadUrl: string
  fileSize: string
}

const mockPayslips: Payslip[] = [
  {
    id: "1",
    period: "August 2024",
    processedDate: "2024-08-31",
    netPay: "$4,250.00",
    status: "available",
    downloadUrl: "/api/payslips/download/1",
  },
  {
    id: "2",
    period: "July 2024",
    processedDate: "2024-07-31",
    netPay: "$4,250.00",
    status: "available",
    downloadUrl: "/api/payslips/download/2",
  },
  {
    id: "3",
    period: "June 2024",
    processedDate: "2024-06-30",
    netPay: "$4,100.00",
    status: "available",
    downloadUrl: "/api/payslips/download/3",
  },
  {
    id: "4",
    period: "September 2024",
    processedDate: "",
    netPay: "",
    status: "processing",
    downloadUrl: "",
  },
]

const mockHRDocuments: HRDocument[] = [
  {
    id: "1",
    title: "Employee Handbook 2024",
    description: "Complete guide to company policies, procedures, and benefits",
    category: "Policy",
    publishedDate: "2024-01-15",
    tags: ["handbook", "policies", "benefits"],
    downloadUrl: "/api/hr-docs/download/1",
    fileSize: "2.1 MB",
  },
  {
    id: "2",
    title: "Health Insurance Guide",
    description: "Comprehensive information about your health insurance coverage and benefits",
    category: "Benefits",
    publishedDate: "2024-03-01",
    tags: ["health", "insurance", "benefits"],
    downloadUrl: "/api/hr-docs/download/2",
    fileSize: "856 KB",
  },
  {
    id: "3",
    title: "Remote Work Policy",
    description: "Guidelines and requirements for remote work arrangements",
    category: "Policy",
    publishedDate: "2024-02-10",
    tags: ["remote", "work", "policy"],
    downloadUrl: "/api/hr-docs/download/3",
    fileSize: "445 KB",
  },
  {
    id: "4",
    title: "Professional Development Program",
    description: "Information about training opportunities and career development resources",
    category: "Development",
    publishedDate: "2024-04-05",
    tags: ["training", "development", "career"],
    downloadUrl: "/api/hr-docs/download/4",
    fileSize: "1.2 MB",
  },
]

export default function DocumentsPage() {
  const [activeTab, setActiveTab] = useState<"payslips" | "hr-docs">("payslips")
  const [hrFilter, setHrFilter] = useState<string>("all")

  const handleDownload = (downloadUrl: string, filename: string) => {
    if (!downloadUrl) return

    // Simulate download
    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const getTagColor = (tag: string) => {
    const colors = {
      handbook: "bg-blue-100 text-blue-800",
      policies: "bg-purple-100 text-purple-800",
      benefits: "bg-green-100 text-green-800",
      health: "bg-red-100 text-red-800",
      insurance: "bg-orange-100 text-orange-800",
      remote: "bg-indigo-100 text-indigo-800",
      work: "bg-gray-100 text-gray-800",
      policy: "bg-purple-100 text-purple-800",
      training: "bg-yellow-100 text-yellow-800",
      development: "bg-green-100 text-green-800",
      career: "bg-blue-100 text-blue-800",
    }
    return colors[tag as keyof typeof colors] || "bg-gray-100 text-gray-800"
  }

  const filteredHRDocs = mockHRDocuments.filter((doc) => {
    if (hrFilter === "all") return true
    return doc.category.toLowerCase() === hrFilter
  })

  return (
    <div>
      <h1 className="h2 mb-6">Documents</h1>

      {/* Tab Navigation */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="flex gap-2">
            <button
              className={`btn btn-sm ${activeTab === "payslips" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab("payslips")}
              type="button"
            >
              Payslips
            </button>
            <button
              className={`btn btn-sm ${activeTab === "hr-docs" ? "btn-primary" : "btn-secondary"}`}
              onClick={() => setActiveTab("hr-docs")}
              type="button"
            >
              HR Documents
            </button>
          </div>
        </div>
      </div>

      {/* Payslips Tab */}
      {activeTab === "payslips" && (
        <div className="card">
          <div className="card-header">
            <h2 className="h3">Payslips</h2>
          </div>
          <div className="card-body">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mockPayslips.map((payslip) => (
                <div key={payslip.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="h4">{payslip.period}</h3>
                    {payslip.status === "processing" ? (
                      <span className="inline-block px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded-full">
                        Processing
                      </span>
                    ) : (
                      <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                        Available
                      </span>
                    )}
                  </div>

                  {payslip.status === "available" ? (
                    <>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span className="body-sm text-gray-600">Net Pay:</span>
                          <span className="body-sm font-medium">{payslip.netPay}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="body-sm text-gray-600">Processed:</span>
                          <span className="body-sm">{new Date(payslip.processedDate).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <button
                          className="btn btn-primary btn-sm flex-1"
                          onClick={() => handleDownload(payslip.downloadUrl, `payslip-${payslip.period}.pdf`)}
                          type="button"
                        >
                          Download
                        </button>
                        <button className="btn btn-secondary btn-sm" type="button">
                          View
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-4">
                      <p className="body-sm text-gray-600 mb-2">Payslip is being processed</p>
                      <p className="body-sm text-gray-500">Available by end of month</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* HR Documents Tab */}
      {activeTab === "hr-docs" && (
        <>
          {/* HR Documents Filters */}
          <div className="card mb-6">
            <div className="card-body">
              <div className="flex flex-wrap gap-2">
                <button
                  className={`btn btn-sm ${hrFilter === "all" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setHrFilter("all")}
                  type="button"
                >
                  All
                </button>
                <button
                  className={`btn btn-sm ${hrFilter === "policy" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setHrFilter("policy")}
                  type="button"
                >
                  Policy
                </button>
                <button
                  className={`btn btn-sm ${hrFilter === "benefits" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setHrFilter("benefits")}
                  type="button"
                >
                  Benefits
                </button>
                <button
                  className={`btn btn-sm ${hrFilter === "development" ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setHrFilter("development")}
                  type="button"
                >
                  Development
                </button>
              </div>
            </div>
          </div>

          {/* HR Documents Grid */}
          <div className="card">
            <div className="card-header">
              <h2 className="h3">HR Documents</h2>
            </div>
            <div className="card-body">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {filteredHRDocs.map((doc) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="h4">{doc.title}</h3>
                      <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        {doc.category}
                      </span>
                    </div>

                    <p className="body-sm text-gray-600 mb-3">{doc.description}</p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {doc.tags.map((tag) => (
                        <span key={tag} className={`inline-block px-2 py-1 text-xs rounded-full ${getTagColor(tag)}`}>
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-between items-center mb-4">
                      <span className="body-sm text-gray-600">
                        Published: {new Date(doc.publishedDate).toLocaleDateString()}
                      </span>
                      <span className="body-sm text-gray-600">{doc.fileSize}</span>
                    </div>

                    <div className="flex gap-2">
                      <button
                        className="btn btn-primary btn-sm flex-1"
                        onClick={() => handleDownload(doc.downloadUrl, `${doc.title}.pdf`)}
                        type="button"
                      >
                        Download
                      </button>
                      <button className="btn btn-secondary btn-sm" type="button">
                        View
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filteredHRDocs.length === 0 && (
                <div className="text-center py-8">
                  <p className="body-md text-gray-600">No documents found for the selected category.</p>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
