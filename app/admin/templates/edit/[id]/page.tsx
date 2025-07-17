"use client"

import { useEffect, useState, useTransition } from "react"
import { useParams, useRouter } from "next/navigation"
import { Save, Code, Play, ArrowLeft, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { CodeEditor } from "@/components/admin/code-editor"
import { TemplatePreview } from "@/components/admin/template-preview"
import { Spinner } from "@/components/ui/spinner"
import axios from "axios"
import { API_ENDPOINTS } from "@/app/config/api"
import { toast } from "sonner"
import { Template } from "@/interface/Template"
export default function EditTemplatePage() {
  const params = useParams()
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  // State cho form chỉnh sửa mẫu thiệp
  const [template, setTemplate] = useState<Template | null>(null)
  const [htmlCode, setHtmlCode] = useState("")
  const [cssCode, setCssCode] = useState("")
  const [jsCode, setJsCode] = useState("")
  const [defaultValues, setDefaultValues] = useState<Record<string, string>>({})
  const [templateStatus, setTemplateStatus] = useState("draft")

  const [activeTab, setActiveTab] = useState("editor")
  const [activeEditorTab, setActiveEditorTab] = useState("html")

  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [thumbnailPreview, setThumbnailPreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);

  const [priceType, setPriceType] = useState("free");
  const [priceAmount, setPriceAmount] = useState(0);
  const [comparePrice, setComparePrice] = useState(0);

  // Fetch template data
  useEffect(() => {
    const fetchTemplate = async () => {
      try {
        const response = await axios.get(`${API_ENDPOINTS.templates}/${params.id}`)
        const templateData = response.data as Template
        setTemplate(templateData)
        setHtmlCode(templateData.html)
        setCssCode(templateData.css)
        setJsCode(templateData.js)
        setTemplateStatus(templateData.status)
        setThumbnailPreview(templateData.thumbnail)
        setPriceType(templateData.price)
        setPriceAmount(templateData.priceAmount)
        setComparePrice(templateData.comparePrice)
        
        // Initialize default values
        const initialValues: Record<string, string> = {}
        templateData.dynamicFields.forEach((field) => {
          initialValues[field.name] = field.defaultValue
        })
        setDefaultValues(initialValues)
      } catch (error: any) {
        console.error("Error fetching template:", error)
        toast.error(error.response?.data?.message || "Lỗi khi tải thông tin mẫu thiệp")
      }
    }

    if (params.id) {
      fetchTemplate()
    }
  }, [params.id])

  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbnail(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveTemplate = async () => {
    if (!template) return

    try {
      setIsUploading(true);
      // Remove token check since we use cookies now

      // Validate price for paid templates
      if (priceType === 'paid' && (!priceAmount || priceAmount <= 0)) {
        toast.error("Vui lòng nhập giá cho mẫu thiệp trả phí");
        return;
      }

      const updatedDynamicFields = template.dynamicFields.map(field => ({
        ...field,
        defaultValue: defaultValues[field.name]
      }));

      const response = await axios.put(`${API_ENDPOINTS.templates}/${params.id}`, {
        html: htmlCode,
        css: cssCode,
        js: jsCode,
        status: templateStatus,
        dynamicFields: updatedDynamicFields,
        price: priceType,
        priceAmount: priceType === 'paid' ? priceAmount : 0,
        comparePrice: priceType === 'paid' ? comparePrice : 0,
        ...(thumbnail && { thumbnail })
      }, {
        withCredentials: true, // Use cookies instead of localStorage
        ...(thumbnail && { 
          headers: { 'Content-Type': 'multipart/form-data' } 
        }),
      });

      toast.success("Cập nhật mẫu thiệp thành công");
      router.push("/admin/templates");
    } catch (error: any) {
      console.error("Error updating template:", error);
      if (error.response?.status === 401) {
        toast.error("Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại");
        router.push("/admin/login");
      } else {
        toast.error(error.response?.data?.message || "Lỗi khi cập nhật mẫu thiệp");
      }
    } finally {
      setIsUploading(false);
    }
  }

  if (!template) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <Spinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pt-6 lg:pt-0">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/templates")} className="h-9 w-9">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Quay lại</span>
          </Button>
          <h1 className="text-3xl font-bold tracking-tight">Chỉnh sửa mẫu thiệp: {template.name}</h1>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/templates")}>
            Hủy
          </Button>
          <Button onClick={handleSaveTemplate} disabled={isPending} className="bg-pink-600 hover:bg-pink-700">
            {isPending ? (
              <>
                <Spinner size="sm" className="mr-2" />
                Đang lưu...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Lưu thay đổi
              </>
            )}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
        <TabsList className="grid grid-cols-2">
          <TabsTrigger value="editor">
            <Code className="mr-2 h-4 w-4" />
            Soạn thảo
          </TabsTrigger>
          <TabsTrigger value="preview">
            <Play className="mr-2 h-4 w-4" />
            Xem trước
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="space-y-4 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Trạng thái</Label>
              <Select value={templateStatus} onValueChange={setTemplateStatus}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn trạng thái" />
                </SelectTrigger>
                <SelectContent>
                <SelectItem value="draft">Bản nháp</SelectItem>
                <SelectItem value="review">Đang xét duyệt</SelectItem>
                <SelectItem value="published">Đã xuất bản</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="price">Loại giá</Label>
              <Select value={priceType} onValueChange={setPriceType}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn loại giá" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="free">Miễn phí</SelectItem>
                  <SelectItem value="paid">Trả phí</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {priceType === 'paid' && (
              <>
                <div className="grid gap-2">
                  <Label htmlFor="priceAmount">Giá (VNĐ)</Label>
                  <Input
                    id="priceAmount"
                    type="number"
                    min="0"
                    value={priceAmount}
                    onChange={(e) => setPriceAmount(Number(e.target.value))}
                    placeholder="Nhập giá"
                    required
                  />
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="comparePrice">Giá so sánh (VNĐ)</Label>
                  <Input
                    id="comparePrice"
                    type="number"
                    min="0"
                    value={comparePrice}
                    onChange={(e) => setComparePrice(Number(e.target.value))}
                    placeholder="Nhập giá so sánh"
                  />
                </div>
              </>
            )}

            <div className="grid gap-2">
              <Label htmlFor="thumbnail">Thumbnail</Label>
              <div className="flex items-center gap-4">
                {thumbnailPreview && (
                  <div className="relative w-20 h-20">
                    <img
                      src={thumbnailPreview}
                      alt="Thumbnail preview"
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                )}
                <div className="flex-1">
                  <Input
                    id="thumbnail"
                    type="file"
                    accept="image/*"
                    onChange={handleThumbnailChange}
                    className="cursor-pointer"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Chọn ảnh thumbnail cho mẫu thiệp
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Mã HTML/CSS/JS</Label>
            <Tabs value={activeEditorTab} onValueChange={setActiveEditorTab}>
              <TabsList className="grid grid-cols-3">
                <TabsTrigger value="html">HTML</TabsTrigger>
                <TabsTrigger value="css">CSS</TabsTrigger>
                <TabsTrigger value="js">JavaScript</TabsTrigger>
              </TabsList>
              <TabsContent value="html" className="border rounded-md">
                <div className="h-[300px]">
                  <CodeEditor language="html" value={htmlCode} onChange={(value) => setHtmlCode(value || "")} />
                </div>
              </TabsContent>
              <TabsContent value="css" className="border rounded-md">
                <div className="h-[300px]">
                  <CodeEditor language="css" value={cssCode} onChange={(value) => setCssCode(value || "")} />
                </div>
              </TabsContent>
              <TabsContent value="js" className="border rounded-md">
                <div className="h-[300px]">
                  <CodeEditor language="javascript" value={jsCode} onChange={(value) => setJsCode(value || "")} />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Giá trị mặc định</h2>
            <div className="border rounded-md p-4 bg-gray-50 dark:bg-gray-900">
              <div className="max-h-[300px] overflow-y-auto pr-2 space-y-4">
                {template.dynamicFields.map((field) => (
                  <div key={field.id} className="grid gap-2">
                    <Label htmlFor={field.type === "color" ? `color-${field.name}` : `field-${field.name}`}>
                      {field.description}
                    </Label>
                    {field.type === "color" ? (
                      <input
                        type="color"
                        value={defaultValues[field.name]}
                        onChange={(e) => setDefaultValues(prev => ({
                          ...prev,
                          [field.name]: e.target.value
                        }))}
                        className="w-full h-10 rounded-md border border-gray-300 dark:border-gray-700"
                        id={`color-${field.name}`}
                        aria-label={field.description}
                      />
                    ) : (
                      <input
                        type={field.type === "date" ? "date" : "text"}
                        value={defaultValues[field.name]}
                        onChange={(e) => setDefaultValues(prev => ({
                          ...prev,
                          [field.name]: e.target.value
                        }))}
                        className="w-full h-10 px-3 rounded-md border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800"
                        id={`field-${field.name}`}
                        aria-label={field.description}
                        placeholder={`Nhập ${field.description.toLowerCase()}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="preview" className="py-4 h-screen">
          <TemplatePreview 
            html={htmlCode} 
            css={cssCode} 
            js={jsCode} 
            dynamicFields={template.dynamicFields.map(field => ({
              ...field,
              type: field.type as "color" | "image" | "text" | "date" | "location",
              defaultValue: defaultValues[field.name]
            }))} 
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 