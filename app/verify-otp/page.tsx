"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { API_ENDPOINTS } from "@/app/config/api";

export default function VerifyOtpPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [timeLeft, setTimeLeft] = useState(60);
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockTimeLeft, setLockTimeLeft] = useState(0);
  
  // Lấy email từ URL params
  const email = searchParams.get("email");

  // Tạo hàm startCountdown
  const startCountdown = useCallback(() => {
    setTimeLeft(60); // Reset về 60s
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return timer;
  }, []);

  useEffect(() => {
    // Kiểm tra nếu không có email, chuyển về trang forgot-password
    if (!email) {
      toast.error("Vui lòng nhập email trước");
      router.push("/forgot-password");
      return;
    }

    // Khởi tạo countdown timer
    const timer = startCountdown();
    return () => clearInterval(timer);
  }, [email, router, startCountdown]);

  // Effect cho việc đếm ngược thời gian khóa
  useEffect(() => {
    if (!isLocked) return;

    const lockTimer = setInterval(() => {
      setLockTimeLeft((prev) => {
        if (prev <= 1) {
          setIsLocked(false);
          setAttemptsLeft(null); // Reset số lần thử khi hết thời gian khóa
          clearInterval(lockTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(lockTimer);
  }, [isLocked]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !otp) {
      toast.error("Vui lòng nhập mã OTP");
      return;
    }

    try {
      setLoading(true);
      await axios.post(API_ENDPOINTS.verifyOtp, { email, otp }, { withCredentials: true });
      toast.success("Xác minh OTP thành công");
      router.push("/reset-password?email=" + encodeURIComponent(email));
    } catch (error: any) {
      console.error("Verify OTP error:", error);
      const response = error.response?.data;
      
      // Xử lý trường hợp bị khóa
      if (error.response?.status === 429) {
        setIsLocked(true);
        setLockTimeLeft(response.lockTimeLeft);
        toast.error(response.message);
      } else if (response.expired) {
        // Xử lý trường hợp OTP hết hạn
        toast.error(response.message);
        setTimeLeft(0); // Reset countdown để cho phép gửi lại OTP ngay
      } else if (response.attemptsLeft !== undefined) {
        // Xử lý trường hợp OTP không đúng
        setAttemptsLeft(response.attemptsLeft);
        toast.error(response.message);
      } else {
        toast.error(response?.message || "Xác minh OTP thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (timeLeft > 0) {
      toast.error(`Vui lòng đợi ${timeLeft} giây trước khi gửi lại OTP`);
      return;
    }

    try {
      setLoading(true);
      await axios.post(API_ENDPOINTS.forgotPassword, { email }, { withCredentials: true });
      toast.success("Mã OTP mới đã được gửi đến email của bạn");
      // Khởi động lại countdown timer
      startCountdown();
      setAttemptsLeft(null);
      setIsLocked(false);
    } catch (error: any) {
      console.error("Resend OTP error:", error);
      const response = error.response?.data;
      
      // Xử lý trường hợp bị khóa
      if (error.response?.status === 429) {
        setIsLocked(true);
        setLockTimeLeft(response.lockTimeLeft);
        toast.error(response.message);
      } else {
        toast.error(response?.message || "Gửi OTP thất bại");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Xác minh OTP</CardTitle>
          <CardDescription className="text-center">
            Nhập mã OTP đã được gửi đến email
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            {/* Hiển thị email dạng text */}
            <div className="text-center">
              <span className="text-sm text-muted-foreground">Email: </span>
              <span className="font-medium">{email}</span>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="otp">
                Mã OTP {attemptsLeft !== null && !isLocked && (
                  <span className="text-sm text-muted-foreground ml-1">
                    (còn {attemptsLeft} lần thử)
                  </span>
                )}
              </Label>
              <Input
                id="otp"
                type="text"
                placeholder="Nhập mã OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                autoFocus
                disabled={isLocked || loading}
              />
            </div>

            {/* Hiển thị thông báo khóa và thời gian */}
            {isLocked && (
              <div className="text-center text-sm text-red-500">
                Form đã bị khóa. Vui lòng đợi {lockTimeLeft} giây.
              </div>
            )}

            <p className="text-sm text-center">
              {timeLeft > 0 ? (
                <span className="text-muted-foreground">
                  Thời gian còn lại: {timeLeft} giây
                </span>
              ) : (
                <Button 
                  type="button" 
                  variant="link" 
                  onClick={handleResendOtp} 
                  disabled={loading || isLocked}
                >
                  Gửi lại OTP
                </Button>
              )}
            </p>
          </CardContent>
          <CardFooter>
            <Button 
              type="submit" 
              className="w-full" 
              disabled={loading || isLocked}
            >
              {loading ? "Đang xử lý..." : "Xác minh"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}