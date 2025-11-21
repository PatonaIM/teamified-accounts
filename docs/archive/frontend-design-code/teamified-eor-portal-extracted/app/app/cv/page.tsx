"use client"

import type React from "react"

import { useState } from "react"

interface CVVersion {
  id: string
  filename: string
  uploadDate: string
  fileSize: string
  isCurrent: boolean
  downloadUrl: string
}

const mockCVVersions: CVVersion[] = [
  {
    id: "1",
    filename: "Alex_Johnson_CV_2024_v3.pdf",
    uploadDate: "2024-08-15",
    fileSize: "245 KB",
    isCurrent: true,
    downloadUrl: "/api/cv/download/1",
  },
  {
    id: "2",
    filename: "Alex_Johnson_CV_2024_v2.pdf",
    uploadDate: "2024-07-20",
    fileSize: "238 KB",
    isCurrent: false,
    downloadUrl: "/api/cv/download/2",
  },
  {
    id: "3",
    filename: "Alex_Johnson_CV_2024_v1.pdf",
    uploadDate: "2024-06-10",
    fileSize: "241 KB",
    isCurrent: false,
    downloadUrl: "/api/cv/download/3",
  },
]

export default function CVPage() {
  const [cvVersions, setCvVersions] = useState<CVVersion[]>(mockCVVersions)
  const [uploading, setUploading] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (file.type !== "application/pdf") {
      setToastMessage("Please upload a PDF file only")
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setToastMessage("File size must be less than 5MB")
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
      return
    }

    setUploading(true)

    // Simulate upload
    setTimeout(() => {
      const newVersion: CVVersion = {
        id: String(cvVersions.length + 1),
        filename: file.name,
        uploadDate: new Date().toISOString().split("T")[0],
        fileSize: `${Math.round(file.size / 1024)} KB`,
        isCurrent: false,
        downloadUrl: `/api/cv/download/${cvVersions.length + 1}`,
      }

      setCvVersions([newVersion, ...cvVersions])
      setUploading(false)
      setToastMessage("CV uploaded successfully")
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)

      // Reset file input
      event.target.value = ""
    }, 2000)
  }

  const handleSetCurrent = (id: string) => {
    setCvVersions((prev) =>
      prev.map((cv) => ({
        ...cv,
        isCurrent: cv.id === id,
      })),
    )
    setToastMessage("Current CV updated")
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleDelete = (id: string) => {
    const cvToDelete = cvVersions.find((cv) => cv.id === id)
    if (cvToDelete?.isCurrent) {
      setToastMessage("Cannot delete the current CV version")
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
      return
    }

    setCvVersions((prev) => prev.filter((cv) => cv.id !== id))
    setToastMessage("CV version deleted")
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleDownload = (downloadUrl: string, filename: string) => {
    // Simulate download
    const link = document.createElement("a")
    link.href = downloadUrl
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="h2">My CV</h1>
        <div className="flex items-center gap-2">
          {cvVersions.find((cv) => cv.isCurrent) && (
            <>
              <span className="inline-block w-3 h-3 bg-green-500 rounded-full"></span>
              <span className="body-sm text-gray-600">Current CV active</span>
            </>
          )}
        </div>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 z-50">
          <span className="body-sm">{toastMessage}</span>
        </div>
      )}

      {/* Upload Section */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="h3">Upload New CV</h2>
        </div>
        <div className="card-body">
          <div className="form-group">
            <label className="form-label" htmlFor="cv-upload">
              Choose CV File
            </label>
            <input
              id="cv-upload"
              className="form-input"
              type="file"
              accept=".pdf"
              onChange={handleFileUpload}
              disabled={uploading}
            />
            <p className="form-help">Upload a PDF file (max 5MB). This will create a new version.</p>
          </div>
          {uploading && (
            <div className="flex items-center gap-2 mt-3">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <span className="body-sm text-blue-600">Uploading...</span>
            </div>
          )}
        </div>
      </div>

      {/* CV Versions */}
      <div className="card">
        <div className="card-header">
          <h2 className="h3">CV Versions</h2>
        </div>
        <div className="card-body">
          {cvVersions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="table">
                <thead>
                  <tr>
                    <th>Filename</th>
                    <th>Upload Date</th>
                    <th>File Size</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {cvVersions.map((cv) => (
                    <tr key={cv.id}>
                      <td className="body-md">{cv.filename}</td>
                      <td className="body-md">{new Date(cv.uploadDate).toLocaleDateString()}</td>
                      <td className="body-md">{cv.fileSize}</td>
                      <td>
                        {cv.isCurrent ? (
                          <span className="inline-block px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                            Current
                          </span>
                        ) : (
                          <span className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-800 rounded-full">
                            Archived
                          </span>
                        )}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button
                            className="btn btn-secondary btn-sm"
                            onClick={() => handleDownload(cv.downloadUrl, cv.filename)}
                            type="button"
                          >
                            Download
                          </button>
                          {!cv.isCurrent && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => handleSetCurrent(cv.id)}
                              type="button"
                            >
                              Set Current
                            </button>
                          )}
                          {!cv.isCurrent && (
                            <button
                              className="btn btn-secondary btn-sm text-red-600 hover:bg-red-50"
                              onClick={() => handleDelete(cv.id)}
                              type="button"
                            >
                              Delete
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
              <p className="body-md text-gray-600 mb-4">No CV versions uploaded yet.</p>
              <p className="body-sm text-gray-500">Upload your first CV using the form above.</p>
            </div>
          )}
        </div>
      </div>

      {/* CV Guidelines */}
      <div className="card mt-6">
        <div className="card-header">
          <h2 className="h3">CV Guidelines</h2>
        </div>
        <div className="card-body">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="body-sm">Keep your CV up to date with your latest experience and skills</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="body-sm">Use a professional format and ensure all information is accurate</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="body-sm">Only PDF files are accepted (maximum 5MB file size)</p>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
              <p className="body-sm">Set your most recent CV as "Current" for client visibility</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
