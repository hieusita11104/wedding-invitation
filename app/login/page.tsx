"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { API_ENDPOINTS } from "@/app/config/api";
import { CountdownTimer } from "@/components/CountdownTimer";
import { Eye, EyeOff } from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

interface GetCurrentUserResponse {
  user: User;
}

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    emailOrPhone?: string;
    password?: string;
  }>({});
  const [formData, setFormData] = useState({
    emailOrPhone: "",
    password: "",
  });
  const [lockout, setLockout] = useState({ isLocked: false, timeLeft: 0 });
  const [remainingAttempts, setRemainingAttempts] = useState(5);

  useEffect(() => {
    const registeredEmail = localStorage.getItem("registeredEmail");
    if (registeredEmail) {
      setFormData((prev) => ({
        ...prev,
        emailOrPhone: registeredEmail,
      }));
      localStorage.removeItem("registeredEmail");
    }

    const checkLockout = () => {
      const lockoutTime = localStorage.getItem("lockoutTime");
      const failedAttempts = parseInt(localStorage.getItem("failedAttempts") || "0");
      setRemainingAttempts(Math.max(5 - failedAttempts, 0));

      if (lockoutTime && new Date().getTime() < parseInt(lockoutTime)) {
        const timeLeft = Math.ceil((parseInt(lockoutTime) - new Date().getTime()) / 1000);
        setLockout({ isLocked: true, timeLeft });
        const interval = setInterval(() => {
          const newTimeLeft = Math.ceil((parseInt(lockoutTime) - new Date().getTime()) / 1000);
          if (newTimeLeft <= 0) {
            setLockout({ isLocked: false, timeLeft: 0 });
            localStorage.removeItem("lockoutTime");
            // Không xóa failedAttempts nữa
            clearInterval(interval);
          } else {
            setLockout({ isLocked: true, timeLeft: newTimeLeft });
          }
        }, 1000);
        return () => clearInterval(interval);
      }
    };
    checkLockout();
  }, []);

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
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    if (!formData.emailOrPhone || !formData.password) {
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

    if (lockout.isLocked) {
      toast.error(`Tài khoản bị khóa. Vui lòng thử lại sau ${lockout.timeLeft} giây.`);
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post<LoginResponse>(API_ENDPOINTS.login, formData, { withCredentials: true });

      toast.success("Đăng nhập thành công");
      localStorage.removeItem("failedAttempts");
      setRemainingAttempts(5);

      if (response.data.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } catch (error: any) {
      console.error("Login error:", error);
      const errorField = error.response?.data?.field;

      // Hiển thị lỗi dưới input và toast
      if (errorField === "emailOrPhone") {
        setErrors((prev) => ({
          ...prev,
          emailOrPhone: "Tài khoản không tồn tại"
        }));
        toast.error("Tài khoản không tồn tại");
      } else if (errorField === "password") {
      const failedAttempts = parseInt(localStorage.getItem("failedAttempts") || "0") + 1;
      localStorage.setItem("failedAttempts", failedAttempts.toString());
        setRemainingAttempts(Math.max(5 - failedAttempts, 0));

      if (failedAttempts >= 5) {
          const lockoutDuration = Math.pow(2, failedAttempts - 5) * 60 * 1000;
        const lockoutTime = new Date().getTime() + lockoutDuration;
        localStorage.setItem("lockoutTime", lockoutTime.toString());
        setLockout({ isLocked: true, timeLeft: lockoutDuration / 1000 });
        toast.error(`Quá nhiều lần đăng nhập thất bại. Vui lòng thử lại sau ${lockoutDuration / 60000} phút.`);
      } else {
          setErrors((prev) => ({
            ...prev,
            password: "Mật khẩu không đúng"
          }));
          toast.error(`Mật khẩu không đúng. Còn ${5 - failedAttempts} lần thử trước khi tài khoản bị khóa.`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    if (lockout.isLocked) return;
    window.location.href = API_ENDPOINTS.googleAuth;
  };

  const handleLogout = () => {
    if (confirm("Bạn có chắc chắn muốn đăng xuất?")) {
      axios.post(API_ENDPOINTS.logout, {}, { withCredentials: true }).then(() => {
        router.push("/login");
        toast.success("Đăng xuất thành công");
      }).catch((error) => {
        console.error("Logout error:", error);
        toast.error("Lỗi khi đăng xuất");
      });
    }
  };

  const handleCountdownComplete = () => {
    setLockout({ isLocked: false, timeLeft: 0 });
    localStorage.removeItem("lockoutTime");
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
        // User is not authenticated, stay on login page
        console.log("User not authenticated");
      }
    };

    checkAuth();
  }, [router]);

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Đăng nhập</CardTitle>
          <CardDescription className="text-center">Đăng nhập để tiếp tục</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="emailOrPhone">Email hoặc Số điện thoại</Label>
              <Input
                id="emailOrPhone"
                name="emailOrPhone"
                type="text"
                placeholder="Nhập email hoặc số điện thoại"
                value={formData.emailOrPhone}
                onChange={handleChange}
                required
                disabled={lockout.isLocked}
                className={errors.emailOrPhone ? "border-red-500" : ""}
              />
              {errors.emailOrPhone && (
                <p className="text-sm text-red-500">{errors.emailOrPhone}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="password">Mật khẩu</Label>
              <div className="relative">
              <Input
                id="password"
                name="password"
                  type={showPassword ? "text" : "password"}
                placeholder="Nhập mật khẩu"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={lockout.isLocked}
                  className={`pr-10 ${errors.password ? "border-red-500" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={lockout.isLocked}
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
            {!lockout.isLocked && remainingAttempts < 5 && (
              <p className="text-sm text-yellow-500 text-center">
                Cảnh báo: Còn {remainingAttempts} lần thử trước khi tài khoản bị khóa.
              </p>
            )}
            {lockout.isLocked && (
              <div className="space-y-2">
                <p className="text-sm text-red-500 text-center font-semibold">
                  Tài khoản tạm thời bị khóa
                </p>
                <CountdownTimer 
                  timeLeft={lockout.timeLeft} 
                  failedAttempts={parseInt(localStorage.getItem("failedAttempts") || "0")}
                  onComplete={handleCountdownComplete}
                />
                <p className="text-xs text-gray-500 text-center">
                  Sau {lockout.timeLeft} giây, nếu nhập sai tiếp tục, thời gian khóa sẽ tăng lên
              </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={loading || lockout.isLocked}>
              {loading ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
            <Button type="button" className="w-full" onClick={handleGoogleLogin} disabled={lockout.isLocked}>
              Đăng nhập với Google
            </Button>
            <div className="text-sm text-center text-muted-foreground">
              Chưa có tài khoản?{" "}
              <Link href="/register" className="text-primary hover:underline">
                Đăng ký ngay
              </Link>
            </div>
            <div className="text-sm text-center">
              <Link href="/forgot-password" className="text-primary hover:underline">
                Quên mật khẩu?
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}