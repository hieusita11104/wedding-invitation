"use client"
import Image from "next/image"
import Link from "next/link"
import { ChevronRight, Sparkles, PenTool, Share2, Users, Heart } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { useEffect, useState } from "react"
import axios from "axios"
import { API_ENDPOINTS } from "@/app/config/api"
import { Template } from "@/interface/Template"

interface ApiResponse {
  templates: Template[];
  totalPages: number;
  totalItems: number;
  currentPage: number;
  itemsPerPage: number;
}

export default function LandingPage() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const response = await axios.get <ApiResponse>(API_ENDPOINTS.templates, {
          params: {
            page: 1,
            limit: 4,
          },
        });
        if (response.status !== 200) {
          throw new Error("Failed to fetch templates");
        }
        setTemplates(response.data.templates);
      } catch (error) {
        console.error("Error fetching templates:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="container mx-auto py-20 px-4 flex flex-col md:flex-row items-center">
        <div className="md:w-1/2 mb-10 md:mb-0">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Thiệp cưới online <span className="text-pink-500">đẹp mắt</span> và{" "}
            <span className="text-pink-500">độc đáo</span>
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
            Tạo thiệp cưới online dễ dàng, nhanh chóng và chia sẻ với người thân, bạn bè chỉ với vài bước đơn giản.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/templates">
              <Button className="bg-pink-600 hover:bg-pink-700 text-white text-lg py-6 px-8">
                Tạo thiệp ngay
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Link href="/templates">
              <Button
                variant="outline"
                className="border-pink-500 text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950 text-lg py-6 px-8"
              >
                Xem mẫu thiệp
              </Button>
            </Link>
          </div>
        </div>
        <div className="md:w-1/2 relative">
          <div className="relative h-[500px] w-full max-w-[500px] mx-auto">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-pink-500/20 to-purple-500/20 rounded-3xl -z-10"></div>
            <Image
              src="/assets/hinh-1.avif"
              alt="Wedding invitation preview"
              width={500}
              height={700}
              className="rounded-3xl shadow-2xl border border-pink-500/30 mx-auto"
            />
            <div className="absolute -top-5 -right-5 bg-pink-600 rounded-full p-3 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="bg-gray-50 dark:bg-gray-950 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Tính năng nổi bật</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Chúng tôi cung cấp những công cụ tốt nhất để bạn tạo ra thiệp cưới online ấn tượng
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-black p-8 rounded-xl border border-pink-500/20 hover:border-pink-500/50 transition shadow-sm">
              <div className="bg-pink-600/20 p-4 rounded-full w-fit mb-6">
                <PenTool className="h-6 w-6 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Tùy chỉnh dễ dàng</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Chọn mẫu thiệp và tùy chỉnh thông tin, hình ảnh theo ý muốn của bạn một cách dễ dàng.
              </p>
            </div>

            <div className="bg-white dark:bg-black p-8 rounded-xl border border-pink-500/20 hover:border-pink-500/50 transition shadow-sm">
              <div className="bg-pink-600/20 p-4 rounded-full w-fit mb-6">
                <Share2 className="h-6 w-6 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Chia sẻ nhanh chóng</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Chia sẻ thiệp cưới của bạn qua nhiều nền tảng khác nhau chỉ với một cú nhấp chuột.
              </p>
            </div>

            <div className="bg-white dark:bg-black p-8 rounded-xl border border-pink-500/20 hover:border-pink-500/50 transition shadow-sm">
              <div className="bg-pink-600/20 p-4 rounded-full w-fit mb-6">
                <Users className="h-6 w-6 text-pink-500" />
              </div>
              <h3 className="text-xl font-bold mb-3">Tương tác với khách mời</h3>
              <p className="text-gray-600 dark:text-gray-300">
                Theo dõi lượt xem, phản hồi từ khách mời và quản lý danh sách khách dễ dàng.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Templates Section */}
      <section id="templates" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Mẫu thiệp đa dạng</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Chọn từ bộ sưu tập mẫu thiệp cưới đa dạng và độc đáo của chúng tôi
            </p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {templates.map((template) => (
                <Link key={template._id} href={`/templates/${template._id}`} className="group">
                <div className="relative aspect-[9/16] rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 mb-3">
                  <Image
                    src={template.thumbnail || "/placeholder.svg"}
                    alt={template.name}
                    width={225}
                    height={400}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                  />
                  <Badge className="absolute top-3 right-3 bg-pink-600 hover:bg-pink-700">
                    {template.price === "free" ? "Miễn phí" : "Trả phí"}
                  </Badge>
                </div>
                <h3 className="font-medium group-hover:text-pink-500 transition mb-1">{template.name}</h3>
                {template.price !== 'free' && (
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">
                      {template.priceAmount.toLocaleString('vi-VN')} VNĐ
                    </span>
                    <span className="text-gray-500 line-through">
                      {template.comparePrice.toLocaleString('vi-VN')} VNĐ
                    </span>
                  </div>
                )}
              </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link href="/templates">
              <Button variant="outline" className="border-pink-500 text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-950">
                Xem tất cả mẫu thiệp
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="bg-gray-50 dark:bg-gray-950 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Cách thức hoạt động</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Chỉ với 3 bước đơn giản, bạn đã có thể tạo và chia sẻ thiệp cưới online của mình
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: 1,
                title: "Chọn mẫu thiệp",
                description: "Lựa chọn mẫu thiệp phù hợp với phong cách của bạn từ bộ sưu tập đa dạng.",
              },
              {
                step: 2,
                title: "Tùy chỉnh thông tin",
                description: "Nhập thông tin cá nhân, hình ảnh và tùy chỉnh thiệp theo ý muốn.",
              },
              {
                step: 3,
                title: "Chia sẻ thiệp cưới",
                description: "Nhận link thiệp cưới và chia sẻ với bạn bè, người thân một cách dễ dàng.",
              },
            ].map((item) => (
              <div key={item.step} className="relative">
                <div className="bg-white dark:bg-black p-8 rounded-xl border border-pink-500/20 h-full shadow-sm">
                  <div className="bg-pink-600 text-white font-bold text-xl w-12 h-12 rounded-full flex items-center justify-center mb-6">
                    {item.step}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                  <p className="text-gray-600 dark:text-gray-300">{item.description}</p>
                </div>
                {item.step < 3 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <ChevronRight className="h-8 w-8 text-pink-500" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Khách hàng nói gì về chúng tôi</h2>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Hàng ngàn cặp đôi đã tin tưởng và sử dụng dịch vụ của chúng tôi
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: "Minh & Hoa",
                date: "12/05/2023",
                content:
                  "Thiệp cưới online rất đẹp và dễ sử dụng. Chúng tôi đã tiết kiệm được rất nhiều thời gian và chi phí.",
              },
              {
                name: "Tuấn & Mai",
                date: "23/07/2023",
                content:
                  "Mọi người đều khen ngợi thiệp cưới của chúng tôi. Giao diện đẹp mắt và dễ dàng chia sẻ với mọi người.",
              },
              {
                name: "Hùng & Linh",
                date: "05/09/2023",
                content:
                  "Dịch vụ khách hàng tuyệt vời. Họ đã giúp chúng tôi tùy chỉnh thiệp theo ý muốn một cách nhanh chóng.",
              },
            ].map((item, index) => (
              <div key={index} className="bg-white dark:bg-black p-8 rounded-xl border border-pink-500/20 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg
                      key={star}
                      className="w-5 h-5 text-pink-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path>
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-6">"{item.content}"</p>
                <div className="flex justify-between items-center">
                  <p className="font-bold">{item.name}</p>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">{item.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-pink-100 to-white dark:from-pink-900/40 dark:to-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Sẵn sàng tạo thiệp cưới của bạn?</h2>
          <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto mb-10">
            Bắt đầu ngay hôm nay và tạo ra thiệp cưới online ấn tượng cho ngày trọng đại của bạn
          </p>
          <Button className="bg-pink-600 hover:bg-pink-700 text-white text-lg py-6 px-10">
            Tạo thiệp ngay
            <Heart className="ml-2 h-5 w-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  )
}
