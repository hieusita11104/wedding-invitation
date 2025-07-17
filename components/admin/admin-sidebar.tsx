"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  LayoutDashboard,
  Users,
  FileText,
  Mail,
  Settings,
  LogOut,
  Sun,
  Moon,
} from "lucide-react"
import { User } from "@/lib/auth"
import { API_BASE_URL } from "@/app/config/api"
import { useTheme } from "next-themes"

const sidebarNavItems = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Users",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Templates",
    href: "/admin/templates",
    icon: FileText,
  },
  {
    title: "Wedding Invitations",
    href: "/admin/wedding-invitations",
    icon: Mail,
  },
]

interface AdminSidebarProps {
  user: User | null;
}

export default function AdminSidebar({ user }: AdminSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  const handleLogout = async () => {
    try {
      await fetch(`${API_BASE_URL}/auth/logout`, { 
        method: "POST",
        credentials: 'include' // Use cookies only, no Authorization header needed
      })
      router.push("/login")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  return (
    <div className="hidden border-r border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 lg:block w-[250px]">
      <div className="flex h-full max-h-screen flex-col gap-2">
        <div className="flex h-[60px] items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6">
          <Link href="/admin" className="flex items-center gap-2 font-semibold">
            <span className="text-lg text-gray-900 dark:text-white">Admin</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/30 hover:text-pink-600 dark:hover:text-pink-400"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Toggle theme</span>
          </Button>
        </div>
        <ScrollArea className="flex-1 px-3">
          <div className="space-y-1 p-2">
            {sidebarNavItems.map((item) => (
              <Button
                key={item.href}
                variant={pathname === item.href ? "secondary" : "ghost"}
                className={cn(
                  "w-full justify-start",
                  pathname === item.href 
                    ? "bg-pink-100 dark:bg-pink-900/50 text-pink-600 dark:text-pink-400" 
                    : "text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/30 hover:text-pink-600 dark:hover:text-pink-400"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="mr-2 h-4 w-4" />
                  {item.title}
                </Link>
              </Button>
            ))}
          </div>
        </ScrollArea>
        {user && (
          <div className="mt-auto border-t border-gray-200 dark:border-gray-700 p-4">
            <div className="flex flex-col space-y-4">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                <p className="font-medium">{user.name}</p>
                <p className="text-gray-500 dark:text-gray-400">{user.email}</p>
              </div>
              <Button
                onClick={handleLogout}
                variant="ghost"
                className="w-full justify-start text-gray-700 dark:text-gray-300 hover:bg-pink-50 dark:hover:bg-pink-900/30 hover:text-pink-600 dark:hover:text-pink-400"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Đăng xuất
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
