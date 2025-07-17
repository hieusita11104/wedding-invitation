"use client"

import { useEffect, useState, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/layout/header"
import { Footer } from "@/components/layout/footer"
import { Spinner } from "@/components/ui/spinner"
import axios from "axios"
import { API_ENDPOINTS, API_BASE_URL } from "@/app/config/api"
import { toast } from "sonner"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Template } from "@/interface/Template"

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface UserResponse {
  user: User;
}

const getCategoryBadgeVariant = (category: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (category) {
    case "elegant":
      return "default";
    case "romantic":
      return "secondary";
    case "minimalist":
      return "outline";
    case "floral":
      return "default";
    case "vintage":
      return "secondary";
    case "modern":
      return "outline";
    default:
      return "default";
  }
};

const getCategoryLabel = (category: string): string => {
  const categories: Record<string, string> = {
    elegant: "Sang trọng",
    romantic: "Lãng mạn",
    minimalist: "Tối giản",
    floral: "Hoa lá",
    vintage: "Cổ điển",
    modern: "Hiện đại"
  };
  return categories[category] || category;
};

const getStatusBadgeVariant = (status: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (status) {
    case "published":
      return "default";
    case "review":
      return "secondary";
    case "draft":
      return "outline";
    default:
      return "default";
  }
};

const getStatusLabel = (status: string): string => {
  const statuses: Record<string, string> = {
    published: "Đã xuất bản",
    review: "Đang xét duyệt",
    draft: "Bản nháp"
  };
  return statuses[status] || status;
};

export default function TemplateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [template, setTemplate] = useState<Template | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [previewValues, setPreviewValues] = useState<Record<string, string>>({})
  const [isSaving, setIsSaving] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Fetch template data
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        setLoading(true)
        const response = await axios.get(`${API_ENDPOINTS.templates}/${params.id}`)
        const templateData = response.data as Template
        setTemplate(templateData)
        
        // Initialize preview values with default values
        const initialValues: Record<string, string> = {}
        templateData.dynamicFields.forEach((field) => {
          initialValues[field.name] = field.defaultValue || ''
        })
        setPreviewValues(initialValues)
        
        // Check authentication using cookies
        try {
          const userRes = await axios.get(`${API_BASE_URL}/auth/me`, {
            withCredentials: true // Use cookies instead of localStorage
          })
          if (userRes.data) {
            setUser((userRes.data as UserResponse).user)
          }
        } catch (error) {
          // User not authenticated, setUser remains null
          console.log("User not authenticated")
        }

        setError(null)
      } catch (error: any) {
        console.error("Error fetching template:", error)
        setError(error.response?.data?.message || "Lỗi khi tải thông tin mẫu thiệp")
      } finally {
        setLoading(false)
      }
    }      

    if (params.id) {
      fetchTemplate()
    }
  }, [params.id])

  // Update iframe content when template or preview values change
  useEffect(() => {
    if (!template) return

    // Function to replace placeholders in HTML/CSS with actual values
    const replacePlaceholders = (content: string) => {
      let result = content
      Object.entries(previewValues).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`
        // Xử lý đặc biệt cho ảnh
        if (key.includes('ảnh') || key.includes('image')) {
          // Nếu là URL ảnh, giữ nguyên
          if (value.startsWith('http') || value.startsWith('/')) {
            result = result.replace(new RegExp(placeholder, 'g'), value)
          } else {
            // Nếu không phải URL, thay thế bằng ảnh mặc định
            result = result.replace(new RegExp(placeholder, 'g'), '/placeholder-image.jpg')
          }
        } else {
          result = result.replace(new RegExp(placeholder, 'g'), value)
        }
      })
      return result
    }

    // Create iframe content
    const iframeContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            ${replacePlaceholders(template.css)}
          </style>
        </head>
        <body>
          ${replacePlaceholders(template.html)}
          <script>
            ${template.js}
          </script>
        </body>
      </html>
    `
    
    // Update iframe srcDoc
    const updateIframe = () => {
      if (iframeRef.current) {
        iframeRef.current.srcdoc = iframeContent
      }
    }

    // Try to update immediately
    updateIframe()

    // If iframe is not ready, wait for it
    if (!iframeRef.current) {
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === 'childList' && iframeRef.current) {
            updateIframe()
            observer.disconnect()
          }
        })
      })

      observer.observe(document.body, {
        childList: true,
        subtree: true
      })

      // Cleanup observer after 5 seconds
      setTimeout(() => observer.disconnect(), 5000)
    }
  }, [template, previewValues])

  // Function to handle input changes
  const handleInputChange = (fieldName: string, value: string) => {
    setPreviewValues(prev => ({
      ...prev,
      [fieldName]: value
    }))
  }

  // Function to format date for input
  const formatDateForInput = (dateStr: string | undefined) => {
    if (!dateStr) return ''
    
    // Convert from DD/MM/YYYY to YYYY-MM-DD
    const [day, month, year] = dateStr.split("/")
    if (day && month && year) {
      return `${year}-${month}-${day}`
    }
    return dateStr
  }

  const handleSave = async () => {
    if (!user) {
      // Save current URL and redirect to login
      localStorage.setItem("returnUrl", window.location.href)
      router.push("/login")
      return
    }

    // Validate required fields
    if (!template?._id) {
      toast.error("Không tìm thấy thông tin mẫu thiệp")
      return
    }

    if (!previewValues['tên_cô_dâu'] || !previewValues['tên_chú_rể']) {
      toast.error("Vui lòng nhập tên cô dâu và chú rể")
      return
    }

    // Validate all required dynamic fields
    const missingFields = template.dynamicFields
      .filter(field => !previewValues[field.name])
      .map(field => field.description)

    if (missingFields.length > 0) {
      toast.error(`Vui lòng điền đầy đủ thông tin: ${missingFields.join(", ")}`)
      return
    }

    setIsSaving(true)
    try {
      console.log("Saving template with data:", {
        templateId: template?._id,
        userId: user?.id,
        fields: previewValues
      });

      const response = await axios.post(API_ENDPOINTS.weddingInvitations, {
        templateId: template?._id,
        userId: user?.id,
        fields: previewValues
      }, {
        withCredentials: true
      })

      console.log("Save response:", response.data);

      if (!response.data) throw new Error("Failed to save")

      const data = response.data as { data: { slug: string } }
      toast.success("Đã lưu thiệp cưới thành công!")
      router.push(`/wedding/${data.data.slug}`)
    } catch (error: any) {
      console.error("Save error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      toast.error(error.response?.data?.message || "Lỗi khi lưu thiệp cưới")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCreateInvitation = () => {
    if (!template) return;
    
    if (template.price === 'paid') {
      // TODO: Implement payment flow
      toast.error("Tính năng thanh toán đang được phát triển");
      return;
    }

    router.push(`/wedding/create?template=${template._id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="flex justify-center items-center h-[60vh]">
            <Spinner size="md" />
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  if (error || !template) {
    return (
      <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
        <Header />
        <main className="container mx-auto py-8 px-4">
          <div className="text-center text-red-500 py-8">{error || "Không tìm thấy mẫu thiệp"}</div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black text-gray-900 dark:text-white">
      <Header />
      <main className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="outline" size="icon" onClick={() => window.history.back()} className="h-9 w-9">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Quay lại</span>
            </Button>
            <h1 className="text-3xl font-bold tracking-tight">{template.name}</h1>
          </div>
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              {template.price === 'free' ? (
                <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                  Miễn phí
                </Badge>
              ) : (
                <div className="flex flex-col items-end">
                  <div className="text-2xl font-bold text-pink-600">
                    {template.priceAmount.toLocaleString('vi-VN')} VNĐ
                  </div>
                  {template.comparePrice > 0 && (
                    <div className="text-sm text-gray-500 line-through">
                      {template.comparePrice.toLocaleString('vi-VN')} VNĐ
                    </div>
                  )}
                </div>
              )}
            </div>
            <Button 
              onClick={handleSave} 
              disabled={isSaving}
              className="bg-pink-600 hover:bg-pink-700 text-white"
            >
              {isSaving ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Đang lưu...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Lưu
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Preview Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Xem trước</h2>
            <div className="border rounded-lg p-4 bg-gray-50 dark:bg-gray-900">
              <iframe
                ref={iframeRef}
                className="w-full h-screen border-0"
                title="Template Preview"
                sandbox="allow-scripts"
              />
            </div>
          </div>

          {/* Customization Section */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Tùy chỉnh</h2>
            {!user ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Vui lòng đăng nhập để tùy chỉnh mẫu thiệp
                </p>
                <Button
                  onClick={() => {
                    localStorage.setItem("returnUrl", window.location.href)
                    router.push("/login")
                  }}
                >
                  Đăng nhập
                </Button>
              </div>
            ) : (
              <>
                <div className="space-y-4 h-screen overflow-y-auto">
                  {template.dynamicFields.map((field) => (
                    <div key={field.id} className="space-y-2">
                      <Label htmlFor={field.id}>{field.description}</Label>
                      {field.type === "color" ? (
                        <input
                          type="color"
                          value={previewValues[field.name]}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-700"
                          title={field.description}
                          placeholder={field.description}
                        />
                      ) : (
                        <Input
                          id={field.id}
                          type={field.type === "date" ? "date" : "text"}
                          value={field.type === "date" ? formatDateForInput(previewValues[field.name]) : previewValues[field.name]}
                          onChange={(e) => handleInputChange(field.name, e.target.value)}
                          placeholder={field.description}
                        />
                      )}
                    </div>
                  ))}
                </div>
                <Button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="w-full"
                >
                  {isSaving ? (
                    <>
                      <Spinner size="sm" className="mr-2" />
                      Đang lưu...
                    </>
                  ) : "Lưu"}
                </Button>
              </>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
