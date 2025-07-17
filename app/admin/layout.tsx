"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User } from "@/lib/auth"
import AdminSidebar from "@/components/admin/admin-sidebar"
import { API_BASE_URL } from "@/app/config/api"
import { Spinner } from "@/components/ui/spinner"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/auth/me`, {
          credentials: 'include' // Use cookies only, no Authorization header needed
        })
        if (!response.ok) {
          router.push("/login")
          return
        }
        const data = await response.json()
        if (data.user.role !== "admin") {
          router.push("/")
          return
        }
        setUser(data.user)
      } catch (error) {
        console.error("Auth check error:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <AdminSidebar user={user} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">{children}</div>
        </main>
      </div>
    </div>
  )
}
