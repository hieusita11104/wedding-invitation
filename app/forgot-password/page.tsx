"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import axios from "axios";
import { API_ENDPOINTS } from "@/app/config/api";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Vui lòng nhập email");
      return;
    }

    try {
      setLoading(true);
      await axios.post(API_ENDPOINTS.forgotPassword, { email }, { withCredentials: true });
      toast.success("Mã OTP đã được gửi đến email của bạn");
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    } catch (error: any) {
      console.error("Forgot password error:", error);
      toast.error(error.response?.data?.message || "Gửi OTP thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Card className="w-full max-w-[400px]">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl text-center">Quên mật khẩu</CardTitle>
          <CardDescription className="text-center">Nhập email để nhận mã OTP</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Nhập email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Đang xử lý..." : "Gửi OTP"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}