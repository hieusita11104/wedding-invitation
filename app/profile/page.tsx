"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import axios from "axios"
import { API_ENDPOINTS } from "@/app/config/api"

interface User {
  id: string; // Đổi từ _id thành id để đồng bộ
  name: string;
  email: string;
  phone: string;
  address: string;
  country: string;
  dateOfBirth: string;
  gender: string;
  profilePicture: string;
  role: string;
  status: string;
}

interface WeddingInvitation {
  _id: string;
  template: { name: string; thumbnail: string };
  createdAt: string;
}

interface ApiResponse {
  user: User;
  weddingInvitations: WeddingInvitation[];
}

export default function ProfilePage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [invitations, setInvitations] = useState<WeddingInvitation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get<ApiResponse>(`${API_ENDPOINTS.getUserDetails}/me`, {
          withCredentials: true // Use cookies instead of localStorage
        })
        setUser(response.data.user)
        setInvitations(response.data.weddingInvitations)
      } catch (error: any) {
        console.error("Fetch profile error:", error)
        toast.error(error.response?.data?.message || "Lỗi khi tải thông tin")
      } finally {
        setLoading(false)
      }
    }
    fetchProfile()
  }, [router])

  if (loading) {
    return <div className="container py-8 text-center">Đang tải...</div>
  }

  if (!user) {
    return <div className="container py-8 text-center">Không tìm thấy thông tin người dùng</div>
  }

  return (
    <div className="container py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl text-center">Hồ sơ người dùng</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={user.profilePicture} alt={user.name} />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{user.name}</h2>
              <p className="text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
          <div className="grid gap-2">
            <p><strong>Số điện thoại:</strong> {user.phone}</p>
            <p><strong>Địa chỉ:</strong> {user.address}</p>
            <p><strong>Quốc gia:</strong> {user.country}</p>
            <p><strong>Ngày sinh:</strong> {new Date(user.dateOfBirth).toLocaleDateString()}</p>
            <p><strong>Giới tính:</strong> {user.gender === "male" ? "Nam" : user.gender === "female" ? "Nữ" : "Khác"}</p>
            <p><strong>Trạng thái:</strong> {user.status === "active" ? "Hoạt động" : user.status === "inactive" ? "Không hoạt động" : "Bị tạm khóa"}</p>
          </div>
          <Button onClick={() => router.push("/edit-profile")}>Chỉnh sửa hồ sơ</Button>
        </CardContent>
      </Card>

      <Card className="max-w-2xl mx-auto mt-8">
        <CardHeader>
          <CardTitle className="text-2xl">Danh sách thiệp cưới</CardTitle>
        </CardHeader>
        <CardContent>
          {invitations.length === 0 ? (
            <p className="text-center text-muted-foreground">Bạn chưa tạo thiệp cưới nào</p>
          ) : (
            <div className="grid gap-4">
              {invitations.map((invitation) => (
                <div key={invitation._id} className="flex items-center gap-4 border p-4 rounded-lg">
                  <img
                    src={invitation.template.thumbnail}
                    alt={invitation.template.name}
                    className="h-16 w-16 object-cover rounded"
                  />
                  <div>
                    <p className="font-semibold">{invitation.template.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Tạo ngày: {new Date(invitation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}