"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { InvitationForm } from "./invitation-form"
import { InvitationList } from "./invitation-list"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export function InvitationsPage() {
  const [showForm, setShowForm] = useState(false)

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-0 lg:ml-72">
        <div className="p-6 lg:p-8">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-3xl font-bold text-foreground mb-2">Invitation Management</h1>
              <p className="text-muted-foreground">Create and manage invitations for new EORs and Admins</p>
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Invitation
            </Button>
          </div>

          {/* Invitation Form */}
          {showForm && (
            <div className="mb-8">
              <InvitationForm onClose={() => setShowForm(false)} />
            </div>
          )}

          {/* Invitation List */}
          <InvitationList />
        </div>
      </main>
    </div>
  )
}
