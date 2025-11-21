import type React from "react"
import { AppShell } from "@/components/app-shell"

export default function EORLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AppShell userRole="eor">{children}</AppShell>
}
