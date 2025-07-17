"use client"

import { useEffect, useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/app/config/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, MoreHorizontal, Ban, Pencil, Lock, Unlock } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import AddUserSidebar from "@/app/components/AddUserSidebar";
import EditUserSidebar from "@/app/components/EditUserSidebar";
import { Spinner } from "@/components/ui/spinner"
import Link from "next/link"
import { toast } from "react-hot-toast"

interface User {
  _id: string;
  name: string;
  email: string;
  avatar?: string;
  role: string;
  gender: string;
  phone: string;
  address: string;
  country: string;
  dateOfBirth: string;
  status: string;
  registeredAt: string;
  weddingInvitationCount: number;
}

export default function UsersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isAddUserSidebarOpen, setIsAddUserSidebarOpen] = useState(false);
  const [isEditUserSidebarOpen, setIsEditUserSidebarOpen] = useState(false);
  const [userToSuspend, setUserToSuspend] = useState<User | null>(null);
  const [userToEdit, setUserToEdit] = useState<User | null>(null);
  const [isSuspending, setIsSuspending] = useState(false);

  const fetchUsers = async () => {
    try {
      const response = await axios.get<User[]>(API_ENDPOINTS.users);
      setUsers(response.data);
    } catch (error: any) {
      console.error("Error fetching users:", error);
      setError(error.response?.data?.message || "Failed to fetch users. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      setIsSuspending(true);
      setError(null);
      
      const response = await axios.patch(`${API_ENDPOINTS.users}/${userId}/status`, {
        status: "suspended"
      });

      if (response.status === 200) {
        // Refresh user list
        await fetchUsers();
        setUserToSuspend(null);
      }
    } catch (error: any) {
      console.error("Error suspending user:", error);
      setError(error.response?.data?.message || "Không thể khóa tài khoản. Vui lòng thử lại sau.");
    } finally {
      setIsSuspending(false);
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    try {
      const response = await axios.patch(
        `${API_ENDPOINTS.users}/${userId}/status`,
        { status: newStatus },
        {
          withCredentials: true // Use cookies instead of localStorage
        }
      )

      if (response.status === 200) {
        toast.success("Cập nhật trạng thái thành công")
        // Refresh user list
        fetchUsers()
      }
    } catch (error: any) {
      console.error("Error updating status:", error)
      toast.error(error.response?.data?.message || "Không thể cập nhật trạng thái")
    }
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  // Filter users
  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === "all" || user.role === roleFilter;
    const matchesStatus = statusFilter === "all" || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Status colors
  const statusColors = {
    active: "bg-green-500",
    inactive: "bg-gray-500",
    suspended: "bg-red-500",
  };

  // Role colors
  const roleColors = {
    admin: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200",
    user: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="outline">Hoạt động</Badge>;
      case "suspended":
        return <Badge className="bg-red-500 text-white" variant="outline">Đã khóa</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pt-6 lg:pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Người dùng</h1>
        <Button 
          className="bg-pink-600 hover:bg-pink-700" 
          onClick={() => setIsAddUserSidebarOpen(true)}
        >
          Thêm người dùng
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc email..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="flex gap-4">
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Vai trò" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả vai trò</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="user">Người dùng</SelectItem>
            </SelectContent>
          </Select>

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả trạng thái</SelectItem>
              <SelectItem value="active">Đang hoạt động</SelectItem>
              <SelectItem value="suspended">Đã khóa</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            {filteredUsers.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-800">
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Người dùng
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Vai trò</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400 text-center">
                      Thiệp cưới đã tạo
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Ngày đăng ký
                    </th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      Trạng thái
                    </th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-gray-500 dark:text-gray-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((user, index) => (
                    <tr
                      key={user._id || index}
                      className="border-b border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar className="h-8 w-8">
                            <AvatarImage src={user.avatar || "/placeholder.svg"} alt={user.name} />
                            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <Link href={`/admin/users/${user._id}`} className="font-medium hover:underline">
                              {user.name}
                            </Link>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="outline" className={roleColors[user.role as keyof typeof roleColors]}>
                          {user.role === "admin" ? "Admin" : "Người dùng"}
                        </Badge>
                      </td>
                      <td className="px-4 py-3 text-sm text-center">{user.weddingInvitationCount}</td>
                      <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{user.registeredAt}</td>
                      <td className="px-4 py-3">
                      {getStatusBadge(user.status)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Mở menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              className="cursor-pointer flex items-center"
                              onClick={() => {
                                setUserToEdit(user);
                                setIsEditUserSidebarOpen(true);
                              }}
                            >
                              <Pencil className="mr-2 h-4 w-4" />
                              <span>Sửa</span>
                            </DropdownMenuItem>
                            {user.status !== "suspended" ? (
                              <DropdownMenuItem 
                                className="cursor-pointer flex items-center text-red-600 dark:text-red-400"
                                onClick={() => setUserToSuspend(user)}
                              >
                                <Ban className="mr-2 h-4 w-4" />
                                <span>Khóa tài khoản</span>
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                className="cursor-pointer flex items-center text-green-600 dark:text-green-400"
                                onClick={() => handleStatusChange(user._id, "active")}
                              >
                                <Unlock className="mr-2 h-4 w-4" />
                                <span>Mở khóa tài khoản</span>
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-4 text-center text-gray-500">Chưa có dữ liệu</div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add User Sidebar */}
      <AddUserSidebar
        isOpen={isAddUserSidebarOpen}
        onClose={() => setIsAddUserSidebarOpen(false)}
        onUserAdded={() => {
          setIsAddUserSidebarOpen(false);
          fetchUsers();
        }}
      />

      {/* Edit User Sidebar */}
      <EditUserSidebar
        isOpen={isEditUserSidebarOpen}
        onClose={() => {
          setIsEditUserSidebarOpen(false);
          setUserToEdit(null);
        }}
        onUserUpdated={() => {
          setIsEditUserSidebarOpen(false);
          setUserToEdit(null);
          fetchUsers();
        }}
        user={userToEdit}
      />

      {/* Suspend User Confirmation Dialog */}
      <AlertDialog open={!!userToSuspend} onOpenChange={() => setUserToSuspend(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận khóa tài khoản</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn khóa tài khoản của {userToSuspend?.name}? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSuspending}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => userToSuspend && handleSuspendUser(userToSuspend._id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={isSuspending}
            >
              {isSuspending ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                "Khóa tài khoản"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
          {error && (
            <div className="mt-4 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
