"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { API_ENDPOINTS } from "@/app/config/api";
import { Eye, EyeOff } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<{
    password?: string;
    confirmPassword?: string;
  }>({});

  // Lấy email từ URL params
  const email = searchParams.get("email");

  useEffect(() => {
    // Kiểm tra nếu không có email, chuyển về trang forgot-password
    if (!email) {
      toast.error("Vui lòng nhập email trước");
      router.push("/forgot-password");
    }
  }, [email, router]);

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password);

    if (password.length < minLength) {
      return "Mật khẩu phải có ít nhất 8 ký tự";
    }
    if (!hasUpperCase) {
      return "Mật khẩu phải có ít nhất 1 chữ in hoa";
    }
    if (!hasLowerCase) {
      return "Mật khẩu phải có ít nhất 1 chữ thường";
    }
    if (!hasNumber) {
      return "Mật khẩu phải có ít nhất 1 số";
    }
    if (!hasSpecialChar) {
      return "Mật khẩu phải có ít nhất 1 ký tự đặc biệt (!@#$%^&*)";
    }
    return "";
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user types
    setErrors((prev) => ({
      ...prev,
      [name]: "",
    }));

    // Validate password on change
    if (name === "password") {
      const error = validatePassword(value);
      if (error) {
        setErrors((prev) => ({
          ...prev,
          password: error,
        }));
      }
    }

    // Validate confirmPassword on change
    if (name === "confirmPassword" && value !== formData.password) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Mật khẩu xác nhận không khớp",
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!email) {
      toast.error("Không tìm thấy email");
      return;
    }

    if (!formData.password || !formData.confirmPassword) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    const passwordError = validatePassword(formData.password);
    if (passwordError) {
      setErrors((prev) => ({
        ...prev,
        password: passwordError,
      }));
      toast.error(passwordError);
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Mật khẩu xác nhận không khớp",
      }));
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);
      await axios.post(API_ENDPOINTS.resetPassword, {
        email,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      }, { withCredentials: true });
      toast.success("Đặt lại mật khẩu thành công");
      router.push("/login");
    } catch (error: any) {
      console.error("Reset password error:", error);
      toast.error(error.response?.data?.message || "Đặt lại mật khẩu thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Đặt lại mật khẩu</CardTitle>
          <CardDescription className="text-center">Nhập mật khẩu mới</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            {/* Hiển thị email dạng text */}
            <div className="text-center">
              <span className="text-sm text-muted-foreground">Email: </span>
              <span className="font-medium">{email}</span>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="password">Mật khẩu mới</Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Nhập mật khẩu mới"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoFocus
                  className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Nhập lại mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className={`pr-10 ${errors.confirmPassword ? "border-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-500">{errors.confirmPassword}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đặt lại mật khẩu"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}