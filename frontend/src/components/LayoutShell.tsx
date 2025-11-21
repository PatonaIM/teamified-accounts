'use client';

import { Link, useLocation } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { Menu, ChevronLeft, ChevronRight } from 'lucide-react'
import clsx from 'clsx'
import { NAV } from '../lib/nav'
import { useAuth } from '../hooks/useAuth'

type ShellProps = { children: React.ReactNode }

export default function LayoutShell({ children }: ShellProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [mobile, setMobile] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const { user } = useAuth()

  useEffect(() => {
    const saved = localStorage.getItem('alexia.sidebar')
    if (saved === 'collapsed') setCollapsed(true)
    const onResize = () => setMobile(window.innerWidth < 1024)
    onResize(); window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  const toggleCollapse = () => {
    const next = !collapsed
    setCollapsed(next)
    localStorage.setItem('alexia.sidebar', next ? 'collapsed' : 'expanded')
  }

  const openMobile = () => setMobileOpen(true)
  const closeMobile = () => setMobileOpen(false)

  // Filter nav items based on user roles
  const visibleNavItems = NAV.filter(item => {
    if (!item.roles) return true
    if (!user?.roles) return false
    return item.roles.some(role => user.roles.includes(role))
  })

  return (
    <div className={clsx('app-shell', collapsed && !mobile && 'icon-rail')}>
      <aside id="app-sidebar" className={clsx('app-sidebar', mobileOpen && 'open')}>
        <div className={clsx('flex items-center justify-between px-3 py-3', collapsed && !mobile && 'justify-center gap-2')}>
          {(!collapsed || mobile) && <Link to="/dashboard" className="font-semibold text-primary">teamified</Link>}
          {!mobile ? (
            <button className="h-10 w-10 rounded-lg hover:bg-muted flex items-center justify-center" onClick={toggleCollapse} aria-label="Toggle sidebar">
              {collapsed ? <ChevronRight size={18}/> : <ChevronLeft size={18}/>}
            </button>
          ) : (
            <button className="h-10 w-10 rounded-lg hover:bg-muted flex items-center justify-center" onClick={closeMobile} aria-label="Close menu">
              <ChevronLeft size={18}/>
            </button>
          )}
        </div>
        <nav className="px-2 pb-4 space-y-1">
          {visibleNavItems.map(({href,label,icon:Icon}) => {
            const isActive = location.pathname === href || location.pathname.startsWith(href + '/')
            return (
              <Link 
                key={href} 
                to={href} 
                className={clsx(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive ? "bg-secondary text-foreground font-medium" : "hover:bg-secondary/50 text-foreground/80",
                  collapsed && !mobile && "justify-center"
                )} 
                title={collapsed && !mobile ? label : undefined}
              >
                <Icon size={18} className="flex-shrink-0" />
                {(!collapsed || mobile) && <span>{label}</span>}
              </Link>
            )
          })}
        </nav>
      </aside>

      <section className="app-main">
        <header className="h-14 border-b bg-card/70 backdrop-blur flex items-center justify-between px-4">
          {mobile && (
            <button className="h-10 w-10 rounded-lg hover:bg-muted flex items-center justify-center" onClick={openMobile} aria-label="Open menu">
              <Menu size={18}/>
            </button>
          )}
          <div className="text-sm text-foreground/70">
            {user?.email && `Welcome, ${user.email}`}
          </div>
          <div />
        </header>
        <main className="app-content">{children}</main>
      </section>
    </div>
  )
}

