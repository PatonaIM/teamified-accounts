"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface DayEntry {
  day: string
  date: string
  hours: number
  notes: string
}

export default function NewTimesheetPage() {
  const router = useRouter()
  const [weekEnding, setWeekEnding] = useState("2024-09-08")
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState("")

  // Initialize week days
  const [entries, setEntries] = useState<DayEntry[]>([
    { day: "Monday", date: "2024-09-02", hours: 0, notes: "" },
    { day: "Tuesday", date: "2024-09-03", hours: 0, notes: "" },
    { day: "Wednesday", date: "2024-09-04", hours: 0, notes: "" },
    { day: "Thursday", date: "2024-09-05", hours: 0, notes: "" },
    { day: "Friday", date: "2024-09-06", hours: 0, notes: "" },
    { day: "Saturday", date: "2024-09-07", hours: 0, notes: "" },
    { day: "Sunday", date: "2024-09-08", hours: 0, notes: "" },
  ])

  const totalHours = entries.reduce((sum, entry) => sum + entry.hours, 0)
  const isValidWeek = totalHours <= 84 && entries.every((entry) => entry.hours >= 0 && entry.hours <= 24)

  const updateEntry = (index: number, field: "hours" | "notes", value: string | number) => {
    const newEntries = [...entries]
    if (field === "hours") {
      const hours = Math.max(0, Math.min(24, Number(value)))
      newEntries[index].hours = hours
    } else {
      newEntries[index].notes = String(value).slice(0, 500) // Max 500 characters
    }
    setEntries(newEntries)
  }

  const handleSaveDraft = () => {
    setToastMessage("Timesheet saved as draft")
    setShowToast(true)
    setTimeout(() => setShowToast(false), 3000)
  }

  const handleSubmit = () => {
    if (!isValidWeek) {
      setToastMessage("Please fix validation errors before submitting")
      setShowToast(true)
      setTimeout(() => setShowToast(false), 3000)
      return
    }

    setToastMessage("Timesheet submitted successfully")
    setShowToast(true)
    setTimeout(() => {
      setShowToast(false)
      router.push("/app/timesheets")
    }, 2000)
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="h2">New Timesheet</h1>
        <button className="btn btn-secondary" onClick={() => router.back()} type="button">
          Cancel
        </button>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4 z-50">
          <span className="body-sm">{toastMessage}</span>
        </div>
      )}

      {/* Week Selection */}
      <div className="card mb-6">
        <div className="card-body">
          <div className="form-group">
            <label className="form-label" htmlFor="week-ending">
              Week Ending Date
            </label>
            <input
              id="week-ending"
              className="form-input"
              type="date"
              value={weekEnding}
              onChange={(e) => setWeekEnding(e.target.value)}
            />
            <p className="form-help">Select the Sunday that ends the work week</p>
          </div>
        </div>
      </div>

      {/* Timesheet Grid */}
      <div className="card mb-6">
        <div className="card-header">
          <h2 className="h3">Time Entries</h2>
        </div>
        <div className="card-body">
          <div className="overflow-x-auto">
            <div className="min-w-full">
              {/* Desktop Grid */}
              <div className="hidden md:block">
                <div className="grid grid-cols-8 gap-4 mb-4">
                  <div className="font-medium body-sm">Day</div>
                  <div className="font-medium body-sm">Date</div>
                  <div className="font-medium body-sm">Hours</div>
                  <div className="font-medium body-sm col-span-5">Notes</div>
                </div>
                {entries.map((entry, index) => (
                  <div key={entry.day} className="grid grid-cols-8 gap-4 mb-4 items-start">
                    <div className="body-md py-2">{entry.day}</div>
                    <div className="body-sm text-gray-600 py-2">{entry.date}</div>
                    <div>
                      <input
                        className="form-input"
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={entry.hours}
                        onChange={(e) => updateEntry(index, "hours", e.target.value)}
                      />
                    </div>
                    <div className="col-span-5">
                      <textarea
                        className="form-input"
                        rows={2}
                        maxLength={500}
                        placeholder="Optional notes for this day..."
                        value={entry.notes}
                        onChange={(e) => updateEntry(index, "notes", e.target.value)}
                      />
                      <p className="form-help mt-1">{entry.notes.length}/500 characters</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-4">
                {entries.map((entry, index) => (
                  <div key={entry.day} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="body-md font-medium">{entry.day}</h3>
                      <span className="body-sm text-gray-600">{entry.date}</span>
                    </div>
                    <div className="form-group mb-3">
                      <label className="form-label" htmlFor={`hours-${index}`}>
                        Hours
                      </label>
                      <input
                        id={`hours-${index}`}
                        className="form-input"
                        type="number"
                        min="0"
                        max="24"
                        step="0.5"
                        value={entry.hours}
                        onChange={(e) => updateEntry(index, "hours", e.target.value)}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" htmlFor={`notes-${index}`}>
                        Notes
                      </label>
                      <textarea
                        id={`notes-${index}`}
                        className="form-input"
                        rows={2}
                        maxLength={500}
                        placeholder="Optional notes for this day..."
                        value={entry.notes}
                        onChange={(e) => updateEntry(index, "notes", e.target.value)}
                      />
                      <p className="form-help">{entry.notes.length}/500 characters</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Totals and Actions */}
      <div className="card">
        <div className="card-body">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div>
                <span className="body-md">Total Hours: </span>
                <span className={`body-md font-bold ${totalHours > 84 ? "text-red-600" : "text-green-600"}`}>
                  {totalHours}
                </span>
              </div>
              {totalHours > 84 && (
                <span className="inline-block px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                  Exceeds 84 hour limit
                </span>
              )}
            </div>
            <div className="flex gap-2">
              <button className="btn btn-secondary" onClick={handleSaveDraft} type="button">
                Save Draft
              </button>
              <button
                className={`btn btn-primary ${!isValidWeek ? "opacity-50 cursor-not-allowed" : ""}`}
                onClick={handleSubmit}
                disabled={!isValidWeek}
                type="button"
              >
                Submit Timesheet
              </button>
            </div>
          </div>
          {!isValidWeek && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded">
              <p className="body-sm text-red-700">
                Please ensure all daily hours are between 0-24 and total weekly hours don't exceed 84.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
