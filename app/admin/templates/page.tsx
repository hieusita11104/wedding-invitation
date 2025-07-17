"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, MoreHorizontal, Edit, Trash, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Spinner } from "@/components/ui/spinner"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import axios from "axios"
import { API_ENDPOINTS } from "@/app/config/api"
import { toast } from "sonner"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogCancel,
  AlertDialogAction,
} from "@/components/ui/alert-dialog"
import { Template } from "@/interface/Template"

export default function TemplatesPage() {
  const router = useRouter();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all")
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Hàm lấy danh sách templates
  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_ENDPOINTS.templates}/admin/all`, {
        params: {
          sort: 'newest'
        },
        withCredentials: true // Use cookies instead of localStorage
      });
      setTemplates(response.data as Template[]);
    } catch (error: any) {
      console.error("Error fetching templates:", error);
      toast.error(error.response?.data?.message || "Lỗi khi tải danh sách mẫu thiệp");
    } finally {
      setLoading(false);
    }
  };

  // Hàm xóa template
  const handleDeleteTemplate = async (id: string) => {
    try {
      await axios.delete(`${API_ENDPOINTS.templates}/${id}`, {
        withCredentials: true // Use cookies instead of localStorage
      });
      toast.success("Xóa mẫu thiệp thành công");
      fetchTemplates();
    } catch (error: any) {
      console.error("Error deleting template:", error);
      toast.error(error.response?.data?.message || "Lỗi khi xóa mẫu thiệp");
    }
  };

  // Hàm kích hoạt template
  const handleReactivateTemplate = async (id: string) => {
    try {
      setIsDeleting(true);
      setError(null);
      const token = localStorage.getItem("token");
      await axios.patch(`${API_ENDPOINTS.templates}/${id}/status`, {
        status: "published"
      }, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      toast.success("Kích hoạt mẫu thiệp thành công");
      fetchTemplates();
    } catch (error: any) {
      console.error("Error reactivating template:", error);
      setError(error.response?.data?.message || "Lỗi khi kích hoạt mẫu thiệp");
    } finally {
      setIsDeleting(false);
    }
  };

  // Gọi API khi component mount
  useEffect(() => {
    fetchTemplates();
  }, []);

  // Lọc templates theo tên
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || template.status === statusFilter
    return matchesSearch && matchesStatus
  });

  // Hàm chuyển đổi trạng thái
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "draft":
        return <Badge variant="outline">Bản nháp</Badge>;
      case "review":
        return <Badge variant="secondary">Đang xét duyệt</Badge>;
      case "published":
        return <Badge className="bg-green-500">Đã xuất bản</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Hàm chuyển đổi danh mục
  const getCategoryName = (category: string) => {
    const categories: { [key: string]: string } = {
      elegant: "Sang trọng",
      romantic: "Lãng mạn",
      minimalist: "Tối giản",
      floral: "Hoa",
      vintage: "Vintage",
      modern: "Hiện đại",
      traditional: "Truyền thống",
      rustic: "Rustic",
    };
    return categories[category] || category;
  };

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

  return (
    <div className="space-y-6 pt-6 lg:pt-0">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý mẫu thiệp</h1>
        <Button className="bg-pink-600 hover:bg-pink-700" onClick={() => router.push("/admin/templates/add")}>
          <Plus className="mr-2 h-4 w-4" />
          Thêm mẫu thiệp
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Tìm kiếm mẫu thiệp..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="draft">Bản nháp</SelectItem>
              <SelectItem value="published">Đã xuất bản</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên mẫu thiệp</TableHead>
              <TableHead>Danh mục</TableHead>
              <TableHead>Giá</TableHead>
              <TableHead>Trạng thái</TableHead>
              <TableHead>Ngày tạo</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  <div className="flex justify-center">
                    <Spinner size="md" />
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredTemplates.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-gray-500">
                  Không tìm thấy mẫu thiệp nào
                </TableCell>
              </TableRow>
            ) : (
              filteredTemplates.map((template) => (
                <TableRow key={template._id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-4">
                      <div className="relative h-12 w-12">
                        <img
                          src={template.thumbnail}
                          alt={template.name}
                          className="h-12 w-12 rounded-md object-cover"
                        />
                      </div>
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          ID: {template._id}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getCategoryBadgeVariant(template.category)}>
                      {getCategoryName(template.category)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {template.price === 'free' ? (
                      <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                        Miễn phí
                      </Badge>
                    ) : (
                      <div className="space-y-1">
                        <div className="font-medium">
                          {template.priceAmount.toLocaleString('vi-VN')} VNĐ
                        </div>
                        {template.comparePrice > 0 && (
                          <div className="text-sm text-gray-500 line-through">
                            {template.comparePrice.toLocaleString('vi-VN')} VNĐ
                          </div>
                        )}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                      {getStatusBadge(template.status)}
                  </TableCell>
                  <TableCell>
                    {new Date(template.createdAt).toLocaleDateString("vi-VN")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Mở menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => router.push(`/templates/${template._id}`)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          <span>Xem trước</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="cursor-pointer"
                          onClick={() => router.push(`/admin/templates/edit/${template._id}`)}
                        >
                          <Edit className="mr-2 h-4 w-4" />
                          <span>Chỉnh sửa</span>
                        </DropdownMenuItem>
                        {template.status === "published" ? (
                          <DropdownMenuItem
                            className="cursor-pointer text-red-600"
                            onClick={() => setTemplateToDelete(template)}
                          >
                            <Trash className="mr-2 h-4 w-4" />
                            <span>Ẩn mẫu thiệp</span>
                          </DropdownMenuItem>
                        ) : (
                          <DropdownMenuItem
                            className="cursor-pointer text-green-600"
                            onClick={() => handleReactivateTemplate(template._id)}
                          >
                            <Eye className="mr-2 h-4 w-4" />
                            <span>Kích hoạt mẫu thiệp</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Delete Template Confirmation Dialog */}
      <AlertDialog open={!!templateToDelete} onOpenChange={() => setTemplateToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Xác nhận chuyển về bản nháp</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn chuyển mẫu thiệp "{templateToDelete?.name}" về trạng thái bản nháp? 
              Các thiệp cưới đã sử dụng mẫu này vẫn sẽ hoạt động bình thường.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => templateToDelete && handleDeleteTemplate(templateToDelete._id)}
              className="bg-red-600 hover:bg-red-700"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <Spinner size="sm" />
                  <span>Đang xử lý...</span>
                </div>
              ) : (
                "Chuyển về bản nháp"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
          {error && (
            <div className="mt-4 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
