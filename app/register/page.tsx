"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PasswordInput } from "@/components/ui/password-input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { API_ENDPOINTS } from "@/app/config/api";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface GetCurrentUserResponse {
  user: User;
}

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    address: "",
    country: "",
    dateOfBirth: "",
    gender: "male",
    profilePicture: null as File | null,
  });
  const [errors, setErrors] = useState({
    email: "",
    phone: "",
    dateOfBirth: "",
    password: "", // Thêm lỗi cho password
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[0-9]{10,11}$/;
    return phoneRegex.test(phone);
  };

  const validateAge = (dateOfBirth: string) => {
    const birthDate = new Date(dateOfBirth);
    const minAgeDate = new Date();
    minAgeDate.setFullYear(minAgeDate.getFullYear() - 16);
    return birthDate <= minAgeDate && !isNaN(birthDate.getTime());
  };

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*]/.test(password); // Ký tự đặc biệt cơ bản

    return (
      password.length >= minLength &&
      hasUpperCase &&
      hasLowerCase &&
      hasNumber &&
      hasSpecialChar
    );
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, files } = e.target;
    if (name === "profilePicture" && files) {
      const file = files[0];
      if (file && file.size > 2 * 1024 * 1024) {
        toast.error("Ảnh đại diện không được lớn hơn 2MB.");
        return;
      }
      setFormData((prev) => ({
        ...prev,
        profilePicture: file,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    if (name === "email" || name === "phone" || name === "dateOfBirth" || name === "password") {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setErrors({ email: "", phone: "", dateOfBirth: "", password: "" });

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword || !formData.phone || !formData.dateOfBirth || !formData.address || !formData.country) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    if (!validateEmail(formData.email)) {
      setErrors((prev) => ({ ...prev, email: "Vui lòng nhập địa chỉ email hợp lệ" }));
      return;
    }

    if (!validatePhone(formData.phone)) {
      setErrors((prev) => ({ ...prev, phone: "Số điện thoại phải là 10 hoặc 11 số" }));
      return;
    }

    if (!validateAge(formData.dateOfBirth)) {
      setErrors((prev) => ({ ...prev, dateOfBirth: "Bạn phải đủ 16 tuổi để đăng ký" }));
      return;
    }

    if (!validatePassword(formData.password)) {
      setErrors((prev) => ({
        ...prev,
        password: "Mật khẩu phải có ít nhất 8 ký tự, bao gồm chữ in hoa, chữ thường, số và ký tự đặc biệt (!@#$%^&*)",
      }));
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append("name", formData.name);
      data.append("email", formData.email);
      data.append("password", formData.password);
      data.append("phone", formData.phone);
      data.append("address", formData.address);
      data.append("country", formData.country);
      data.append("dateOfBirth", formData.dateOfBirth);
      data.append("gender", formData.gender);
      if (formData.profilePicture) {
        data.append("profilePicture", formData.profilePicture);
      }

      const response = await axios.post(API_ENDPOINTS.register, data, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });

      toast.success("Đăng ký thành công");
      router.push("/login");
    } catch (error: any) {
      console.error("Registration error:", error);
      const errorMessage = error.response?.data?.message || "Đăng ký thất bại";
      const errorField = error.response?.data?.field;

      if (errorField === "email") {
        setErrors((prev) => ({ ...prev, email: errorMessage }));
      } else if (errorField === "phone") {
        setErrors((prev) => ({ ...prev, phone: errorMessage }));
      } else if (errorField === "dateOfBirth") {
        setErrors((prev) => ({ ...prev, dateOfBirth: errorMessage }));
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    if (loading) return;
    window.location.href = API_ENDPOINTS.googleAuth;
  };

  // Check if user is already authenticated
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(API_ENDPOINTS.getCurrentUser, { withCredentials: true });
        if ((response.data as any)?.user) {
          // User is already logged in, redirect based on role
          if ((response.data as any).user.role === "admin") {
            router.push("/admin");
          } else {
            router.push("/");
          }
        }
      } catch (error) {
        // User is not authenticated, stay on register page
        console.log("User not authenticated");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="space-y-1 p-3">
          <CardTitle className="text-xl text-center">Đăng ký tài khoản</CardTitle>
          <CardDescription className="text-center text-sm">Điền thông tin để tạo tài khoản mới</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-2">
          <CardContent className="grid gap-2 p-3">
            <div className="grid gap-1">
              <Label htmlFor="name" className="text-sm">Họ và tên</Label>
              <Input
                id="name"
                name="name"
                type="text"
                placeholder="Nhập họ và tên"
                value={formData.name}
                onChange={handleChange}
                required
                className="h-8 text-sm"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="email" className="text-sm">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Nhập địa chỉ email"
                value={formData.email}
                onChange={handleChange}
                required
                className="h-8 text-sm"
                style={{ borderColor: errors.email ? "#ef4444" : "" }}
              />
              {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
            </div>
            <div className="grid gap-1">
              <Label htmlFor="phone" className="text-sm">Số điện thoại</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="Nhập số điện thoại"
                value={formData.phone}
                onChange={handleChange}
                required
                className="h-8 text-sm"
                style={{ borderColor: errors.phone ? "#ef4444" : "" }}
              />
              {errors.phone && <p className="text-xs text-red-500">{errors.phone}</p>}
            </div>
            <div className="grid gap-1">
              <Label htmlFor="dateOfBirth" className="text-sm">Ngày sinh</Label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={formData.dateOfBirth}
                onChange={handleChange}
                required
                className="h-8 text-sm"
                style={{ borderColor: errors.dateOfBirth ? "#ef4444" : "" }}
              />
              {errors.dateOfBirth && <p className="text-xs text-red-500">{errors.dateOfBirth}</p>}
            </div>
            <div className="grid gap-1">
              <Label htmlFor="password" className="text-sm">Mật khẩu</Label>
              <PasswordInput
                id="password"
                name="password"
                placeholder="Nhập mật khẩu (min 8 ký tự, in hoa, thường, số, ký tự đặc biệt)"
                value={formData.password}
                onChange={handleChange}
                required
                className="h-8 text-sm"
                style={{ borderColor: errors.password ? "#ef4444" : "" }}
              />
              {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
            </div>
            <div className="grid gap-1">
              <Label htmlFor="confirmPassword" className="text-sm">Xác nhận MK</Label>
              <PasswordInput
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Nhập lại mật khẩu"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="h-8 text-sm"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="address" className="text-sm">Địa chỉ</Label>
              <Input
                id="address"
                name="address"
                type="text"
                placeholder="Nhập địa chỉ"
                value={formData.address}
                onChange={handleChange}
                required
                className="h-8 text-sm"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="country" className="text-sm">Quốc gia</Label>
              <Input
                id="country"
                name="country"
                type="text"
                placeholder="Nhập quốc gia"
                value={formData.country}
                onChange={handleChange}
                required
                className="h-8 text-sm"
              />
            </div>
            <div className="grid gap-1">
              <Label htmlFor="gender" className="text-sm">Giới tính</Label>
              <Select value={formData.gender} onValueChange={(value) => handleSelectChange("gender", value)}>
                <SelectTrigger className="h-8 text-sm">
                  <SelectValue placeholder="Chọn giới tính" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Nam</SelectItem>
                  <SelectItem value="female">Nữ</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-1">
              <Label htmlFor="profilePicture" className="text-sm">Ảnh đại diện</Label>
              <Input
                id="profilePicture"
                name="profilePicture"
                type="file"
                accept="image/*"
                onChange={handleChange}
                className="h-8 text-sm"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2 p-3">
            <Button type="submit" className="w-full h-9" disabled={loading}>
              {loading ? "Đang xử lý..." : "Đăng ký"}
            </Button>
            <Button type="button" className="w-full h-9" onClick={handleGoogleRegister} disabled={loading}>
              Đăng ký với Google
            </Button>
            <div className="text-xs text-center text-muted-foreground">
              Đã có tài khoản?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Đăng nhập
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}