"use client";
import React from "react";
import { useState } from "react";
import axios from "axios";
import { API_ENDPOINTS } from "@/app/config/api";
import { X } from "lucide-react";

interface FormData {
    name: string;
    email: string;
    role: "user" | "admin";
    gender: "male" | "female" | "other";
    phone: string;
    password: string;
    address: string;
    country: string;
    dateOfBirth: string;
    profilePicture: string;
    status: "active" | "inactive" | "suspended";
}

interface ValidationError {
    field: string;
    message: string;
}

interface AddUserSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    onUserAdded: () => void;
}

export default function AddUserSidebar({ isOpen, onClose, onUserAdded }: AddUserSidebarProps) {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        role: "user",
        gender: "other",
        phone: "",
        password: "",
        address: "",
        country: "",
        dateOfBirth: "",
        profilePicture: "",
        status: "active",
    });

    const [message, setMessage] = useState("");
    const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value as string });
        setValidationErrors(prev => prev.filter(error => error.field !== name));
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setMessage("");
        setValidationErrors([]);

        try {
            const formattedData = {
                ...formData,
                dateOfBirth: new Date(formData.dateOfBirth).toISOString(),
            };
            const response = await axios.post<{ message: string }>(API_ENDPOINTS.users, formattedData);
            setMessage(response.data.message);
            // Clear form after successful submission
            setFormData({
                name: "",
                email: "",
                role: "user",
                gender: "other",
                phone: "",
                password: "",
                address: "",
                country: "",
                dateOfBirth: "",
                profilePicture: "",
                status: "active",
            });
            onUserAdded(); // Notify parent component that a user was added
        } catch (error: any) {
            console.error("Error adding user:", error);
            if (error.response?.data?.field) {
                setValidationErrors([{
                    field: error.response.data.field,
                    message: error.response.data.message
                }]);
            } else if (error.response?.data?.missingFields) {
                const errors = error.response.data.missingFields.map((field: string) => ({
                    field,
                    message: `${field} is required`
                }));
                setValidationErrors(errors);
            } else {
                setMessage(error.response?.data?.message || "Failed to add user. Please try again.");
            }
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50">
            <div className="fixed right-0 top-0 h-full w-96 bg-white dark:bg-gray-900 shadow-lg transform transition-transform duration-300 ease-in-out">
                <div className="p-4 border-b border-gray-200 dark:border-gray-800">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Thêm người dùng mới</h2>
                        <button 
                            onClick={onClose} 
                            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
                            aria-label="Đóng form thêm người dùng"
                        >
                            <X className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                            <span className="sr-only">Đóng form thêm người dùng</span>
                        </button>
                    </div>
                </div>
                <div className="p-4 overflow-y-auto h-[calc(100vh-64px)]">
                    {message && (
                        <p className={`mb-4 ${message.includes("successfully") ? "text-green-500" : "text-red-500"}`}>
                            {message}
                        </p>
                    )}
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tên</label>
                            <input
                                id="name"
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                className={`w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${validationErrors.some(e => e.field === 'name') ? 'border-red-500' : ''}`}
                                required
                                placeholder="Nhập tên người dùng"
                                aria-label="Tên người dùng"
                            />
                            {validationErrors.find(e => e.field === 'name') && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.find(e => e.field === 'name')?.message}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                            <input
                                id="email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className={`w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${validationErrors.some(e => e.field === 'email') ? 'border-red-500' : ''}`}
                                required
                                placeholder="Nhập địa chỉ email"
                                aria-label="Địa chỉ email"
                            />
                            {validationErrors.find(e => e.field === 'email') && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.find(e => e.field === 'email')?.message}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Số điện thoại</label>
                            <input
                                id="phone"
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleChange}
                                className={`w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${validationErrors.some(e => e.field === 'phone') ? 'border-red-500' : ''}`}
                                required
                                placeholder="Nhập số điện thoại"
                                aria-label="Số điện thoại"
                            />
                            {validationErrors.find(e => e.field === 'phone') && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.find(e => e.field === 'phone')?.message}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Mật khẩu</label>
                            <input
                                id="password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                className={`w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${validationErrors.some(e => e.field === 'password') ? 'border-red-500' : ''}`}
                                required
                                placeholder="Nhập mật khẩu"
                                aria-label="Mật khẩu"
                            />
                            {validationErrors.find(e => e.field === 'password') && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.find(e => e.field === 'password')?.message}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Vai trò</label>
                            <select
                                id="role"
                                name="role"
                                value={formData.role}
                                onChange={handleChange}
                                className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                aria-label="Vai trò người dùng"
                            >
                                <option value="user">Người dùng</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Giới tính</label>
                            <select
                                id="gender"
                                name="gender"
                                value={formData.gender}
                                onChange={handleChange}
                                className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                aria-label="Giới tính"
                            >
                                <option value="male">Nam</option>
                                <option value="female">Nữ</option>
                                <option value="other">Khác</option>
                            </select>
                        </div>
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Địa chỉ</label>
                            <input
                                id="address"
                                type="text"
                                name="address"
                                value={formData.address}
                                onChange={handleChange}
                                className={`w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${validationErrors.some(e => e.field === 'address') ? 'border-red-500' : ''}`}
                                required
                                placeholder="Nhập địa chỉ"
                                aria-label="Địa chỉ"
                            />
                            {validationErrors.find(e => e.field === 'address') && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.find(e => e.field === 'address')?.message}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Quốc gia</label>
                            <input
                                id="country"
                                type="text"
                                name="country"
                                value={formData.country}
                                onChange={handleChange}
                                className={`w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${validationErrors.some(e => e.field === 'country') ? 'border-red-500' : ''}`}
                                required
                                placeholder="Nhập quốc gia"
                                aria-label="Quốc gia"
                            />
                            {validationErrors.find(e => e.field === 'country') && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.find(e => e.field === 'country')?.message}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="dateOfBirth" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ngày sinh</label>
                            <input
                                id="dateOfBirth"
                                type="date"
                                name="dateOfBirth"
                                value={formData.dateOfBirth}
                                onChange={handleChange}
                                className={`w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white ${validationErrors.some(e => e.field === 'dateOfBirth') ? 'border-red-500' : ''}`}
                                required
                                aria-label="Ngày sinh"
                            />
                            {validationErrors.find(e => e.field === 'dateOfBirth') && (
                                <p className="text-red-500 text-sm mt-1">{validationErrors.find(e => e.field === 'dateOfBirth')?.message}</p>
                            )}
                        </div>
                        <div>
                            <label htmlFor="profilePicture" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ảnh đại diện</label>
                            <input
                                id="profilePicture"
                                type="text"
                                name="profilePicture"
                                value={formData.profilePicture}
                                onChange={handleChange}
                                className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                placeholder="Nhập URL ảnh đại diện"
                                aria-label="URL ảnh đại diện"
                            />
                        </div>
                        <div>
                            <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Trạng thái</label>
                            <select
                                id="status"
                                name="status"
                                value={formData.status}
                                onChange={handleChange}
                                className="w-full border border-gray-300 dark:border-gray-700 p-2 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                aria-label="Trạng thái người dùng"
                            >
                                <option value="active">Đang hoạt động</option>
                                <option value="inactive">Không hoạt động</option>
                                <option value="suspended">Đã khóa</option>
                            </select>
                        </div>
                        <div className="flex justify-end space-x-2 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 dark:border-gray-700 rounded hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-700 dark:text-gray-300"
                            >
                                Hủy
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-pink-600 text-white rounded hover:bg-pink-700"
                            >
                                Thêm người dùng
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
} 