"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart, LogOut, LogIn, User, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { toast } from "sonner";
import axios from "axios";
import { API_ENDPOINTS } from "@/app/config/api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  profilePicture: string; // Bỏ dấu ? vì profilePicture luôn có giá trị
}

interface UserResponse {
  user: User;
}

export function Header() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsAuthLoading(true);
        // Gọi API để kiểm tra authentication thông qua cookies
        const response = await axios.get<UserResponse>(API_ENDPOINTS.getCurrentUser, {
          withCredentials: true // Quan trọng: gửi cookies
        });
        setUser(response.data.user);
      } catch (error: any) {
        console.error("Error checking auth:", error);
        setUser(null);
        // Chỉ log lỗi, không toast để tránh spam
        if (error.response?.status !== 401) {
          console.error("Unexpected auth error:", error.response?.data);
        }
      } finally {
        setIsAuthLoading(false);
      }
    };

    checkAuth();
  }, []);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      // Gọi API logout với cookies
      await axios.post(API_ENDPOINTS.logout, {}, { 
        withCredentials: true 
      });
      
      // Xóa user state
      setUser(null);
      
      // Hiển thị thông báo thành công
      toast.success("Đăng xuất thành công");
      
      // Redirect về trang chủ thay vì login
      router.push("/");
      router.refresh(); // Refresh để cập nhật server-side state
    } catch (error) {
      console.error("Logout error:", error);
      // Ngay cả khi logout API lỗi, vẫn clear user state
      setUser(null);
      toast.success("Đăng xuất thành công");
      router.push("/");
    } finally {
      setIsLoading(false);
      setShowLogoutDialog(false);
    }
  };

  const openLogoutDialog = () => {
    setShowLogoutDialog(true);
  };

  const closeLogoutDialog = () => {
    setShowLogoutDialog(false);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase();
  };

  return (
    <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
      <header className="container mx-auto py-6 px-4 flex justify-between items-center border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Heart className="h-6 w-6 text-pink-500" />
            <span className="text-xl font-bold">WeddingCard</span>
          </Link>
        </div>
        <nav className="hidden md:flex items-center gap-8">
          <Link href="/#features" className="hover:text-pink-400 transition">
            Tính năng
          </Link>
          <Link href="/templates" className="hover:text-pink-400 transition">
            Mẫu thiệp
          </Link>
          <Link href="/#how-it-works" className="hover:text-pink-400 transition">
            Cách thức
          </Link>
          <Link href="/#testimonials" className="hover:text-pink-400 transition">
            Đánh giá
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          {isAuthLoading ? (
            // Hiển thị loading khi đang kiểm tra auth
            <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          ) : user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative p-0 h-12 w-12">
                  <Avatar className="h-12 w-12 border-2 border-pink-500 hover:border-pink-600 transition-colors">
                    <AvatarImage 
                      src={user.profilePicture}
                      alt={user.name}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-pink-100 text-pink-600 font-semibold">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => router.push("/profile")}>
                  <User className="mr-2 h-4 w-4" />
                  Hồ sơ
                </DropdownMenuItem>
                {user.role === "admin" && (
                  <DropdownMenuItem onClick={() => router.push("/admin")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Quản trị
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={openLogoutDialog}
                  disabled={isLoading}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {isLoading ? "Đang xử lý..." : "Đăng xuất"}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={() => router.push("/login")}
              className="bg-pink-600 hover:bg-pink-700"
            >
              <LogIn className="h-4 w-4 mr-2" />
              Đăng nhập
            </Button>
          )}
        </div>
      </header>

      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Xác nhận đăng xuất</AlertDialogTitle>
          <AlertDialogDescription>
            Bạn có chắc chắn muốn đăng xuất khỏi tài khoản? Bạn sẽ cần đăng nhập lại để tiếp tục sử dụng.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={closeLogoutDialog}>
            Hủy
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={handleLogout}
            disabled={isLoading}
            className="bg-red-600 hover:bg-red-700"
          >
            {isLoading ? "Đang xử lý..." : "Đăng xuất"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}