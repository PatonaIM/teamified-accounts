"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, MoreHorizontal, RefreshCw, Trash2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

// Mock data
const mockInvitations = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    country: "India",
    role: "EOR",
    client: "TechCorp Inc.",
    status: "pending",
    created: "2024-01-15",
    expires: "2024-02-15",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    country: "Philippines",
    role: "Admin",
    client: "StartupXYZ",
    status: "accepted",
    created: "2024-01-10",
    expires: "2024-02-10",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    country: "Sri Lanka",
    role: "EOR",
    client: "GlobalTech",
    status: "expired",
    created: "2023-12-20",
    expires: "2024-01-20",
  },
]

export function InvitationList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "pending":
        return (
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            Pending
          </Badge>
        )
      case "accepted":
        return (
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Accepted
          </Badge>
        )
      case "expired":
        return (
          <Badge variant="secondary" className="bg-red-100 text-red-800">
            Expired
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const filteredInvitations = mockInvitations.filter((invitation) => {
    const matchesSearch =
      invitation.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invitation.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || invitation.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Invitations</CardTitle>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search invitations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="accepted">Accepted</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {filteredInvitations.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-2">No invitations found</div>
            <p className="text-sm text-muted-foreground">
              {searchTerm || statusFilter !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Create your first invitation to get started"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Name</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Email</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Country</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Role</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Client</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Status</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Created</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Expires</th>
                  <th className="text-left py-3 px-2 font-medium text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInvitations.map((invitation) => (
                  <tr key={invitation.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-2 font-medium">{invitation.name}</td>
                    <td className="py-3 px-2 text-muted-foreground">{invitation.email}</td>
                    <td className="py-3 px-2">{invitation.country}</td>
                    <td className="py-3 px-2">{invitation.role}</td>
                    <td className="py-3 px-2">{invitation.client}</td>
                    <td className="py-3 px-2">{getStatusBadge(invitation.status)}</td>
                    <td className="py-3 px-2 text-muted-foreground">{invitation.created}</td>
                    <td className="py-3 px-2 text-muted-foreground">{invitation.expires}</td>
                    <td className="py-3 px-2">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {invitation.status === "pending" && (
                            <DropdownMenuItem>
                              <RefreshCw className="w-4 h-4 mr-2" />
                              Resend
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem className="text-destructive">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
