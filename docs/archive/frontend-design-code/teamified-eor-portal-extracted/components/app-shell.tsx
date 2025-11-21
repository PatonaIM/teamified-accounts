"use client"

import type React from "react"
import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface AppShellProps {
  children: React.ReactNode
  userRole?: "eor" | "admin"
}

export function AppShell({ children, userRole = "eor" }: AppShellProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const pathname = usePathname()

  const eorNavItems = [
    { href: "/app/dashboard", label: "Dashboard", icon: "🏠" },
    { href: "/app/profile", label: "Profile", icon: "👤" },
    { href: "/app/cv", label: "CV", icon: "📄" },
    { href: "/app/timesheets", label: "Timesheets", icon: "⏰" },
    { href: "/app/leave", label: "Leave", icon: "🏖️" },
    { href: "/app/documents", label: "Documents", icon: "📁" },
  ]

  const adminNavItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: "🏠" },
    { href: "/admin/invitations", label: "Invitations", icon: "✉️" },
    { href: "/admin/people", label: "People", icon: "👥" },
    { href: "/admin/clients", label: "Clients", icon: "🏢" },
    { href: "/admin/approvals", label: "Approvals", icon: "✅" },
    { href: "/admin/documents", label: "Documents", icon: "📁" },
    { href: "/admin/reports", label: "Reports", icon: "📊" },
    { href: "/admin/settings", label: "Settings", icon: "⚙️" },
  ]

  const navItems = userRole === "admin" ? adminNavItems : eorNavItems

  return (
    <>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <header className="nav">
        <div className="nav-container">
          <Link className="nav-link" href="/">
            Teamified
          </Link>

          <nav className="nav-menu">
            <Link className={`nav-link ${pathname?.startsWith("/app") ? "bg-gray-100" : ""}`} href="/app/dashboard">
              My Portal
            </Link>
            <Link className={`nav-link ${pathname?.startsWith("/admin") ? "bg-gray-100" : ""}`} href="/admin/dashboard">
              Admin Console
            </Link>
            <button className="btn btn-secondary" aria-label="Notifications" type="button">
              🔔
            </button>
            <button className="btn btn-secondary" aria-haspopup="menu" aria-expanded="false" type="button">
              Me
            </button>

            {/* Mobile menu toggle */}
            <button
              className="btn btn-secondary md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle menu"
              type="button"
            >
              ☰
            </button>
          </nav>
        </div>
      </header>

      <div className="app-shell">
        <aside
          className={`sidebar ${sidebarOpen ? "open" : ""}`}
          aria-label={`${userRole === "admin" ? "Admin" : "EOR"} navigation`}
        >
          <nav className="sidebar-nav">
            {navItems.map((item) => (
              <Link
                key={item.href}
                className={`sidebar-nav-link ${pathname === item.href ? "bg-gray-100" : ""}`}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sidebar-nav-icon">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main id="main-content" className="main">
          {children}
        </main>
      </div>

      <footer className="footer">
        <small className="caption">© Teamified · v0</small>
      </footer>

      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}
    </>
  )
}
