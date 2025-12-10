"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaImage,
  FaTimes,
  FaCloudUploadAlt,
  FaInfoCircle,
} from "react-icons/fa";
import api from "@/utils/api";

interface EventFormData {
  title: string;
  content: string;
  image: string;
  start_date: string;
  end_date: string;
  location: string;
  address: string;
  max_participants: number;
  category: string;
  requirements: string;
}

export default function CreateEventPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    content: "",
    image: "",
    start_date: "",
    end_date: "",
    location: "",
    address: "",
    max_participants: 50,
    category: "environment",
    requirements: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof EventFormData, string>>>({});

  const categories = [
    { value: "environment", label: "Môi trường", icon: "🌱" },
    { value: "education", label: "Giáo dục", icon: "📚" },
    { value: "healthcare", label: "Y tế", icon: "🏥" },
    { value: "community", label: "Cộng đồng", icon: "🤝" },
    { value: "disaster", label: "Thiên tai", icon: "🆘" },
    { value: "culture", label: "Văn hóa", icon: "🎭" },
    { value: "sports", label: "Thể thao", icon: "⚽" },
    { value: "other", label: "Khác", icon: "✨" },
  ];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name as keyof EventFormData]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: "Kích thước ảnh không được vượt quá 5MB" }));
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setErrors((prev) => ({ ...prev, image: "Vui lòng chọn file ảnh hợp lệ" }));
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      setErrors((prev) => ({ ...prev, image: "" }));
    }
  };

  const removeImage = () => {
    setImageFile(null);
    setImagePreview("");
    setFormData((prev) => ({ ...prev, image: "" }));
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof EventFormData, string>> = {};

    if (!formData.title.trim()) newErrors.title = "Vui lòng nhập tên sự kiện";
    if (!formData.content.trim()) newErrors.content = "Vui lòng nhập nội dung";
    if (!formData.start_date) newErrors.start_date = "Vui lòng chọn ngày bắt đầu";
    if (!formData.end_date) newErrors.end_date = "Vui lòng chọn ngày kết thúc";
    if (!formData.location.trim()) newErrors.location = "Vui lòng nhập địa điểm";
    if (formData.max_participants < 1) newErrors.max_participants = "Số lượng phải lớn hơn 0";

    // Validate dates
    if (formData.start_date && formData.end_date) {
      if (new Date(formData.end_date) < new Date(formData.start_date)) {
        newErrors.end_date = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }

    if (!imagePreview && !formData.image) {
      newErrors.image = "Vui lòng chọn hình ảnh cho sự kiện";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Sử dụng imagePreview (base64) nếu có upload file mới
      const imageData = imagePreview || formData.image;

      // Gộp content + requirements thành description
      const description = formData.requirements 
        ? `${formData.content}\n\n📋 Yêu cầu: ${formData.requirements}`
        : formData.content;

      // Create event với đầy đủ các field
      const eventData = {
        title: formData.title,
        description: description,
        location: formData.location,
        category: formData.category,
        max_participants: formData.max_participants,
        image: imageData,
        address: formData.address,
        start_time: formData.start_date,
        end_time: formData.end_date,
      };

      const response = await api.post("/manager/createEvent", eventData);

      if (response.data) {
        alert("Tạo sự kiện thành công!");
        // Success - redirect to event list
        router.push("/manager/events");
      }
    } catch (error: any) {
      console.error("Error creating event:", error);
      const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi tạo sự kiện";
      alert(errorMessage);
      setErrors({
        title: errorMessage,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <FaArrowLeft />
            </button>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold">Tạo sự kiện mới</h1>
              <p className="text-purple-100 mt-1">Điền thông tin để tạo sự kiện tình nguyện</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-32">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Hình ảnh sự kiện <span className="text-red-500">*</span>
            </label>
            
            {!imagePreview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-purple-500 transition-colors cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="hidden"
                  id="image-upload"
                />
                <label htmlFor="image-upload" className="cursor-pointer">
                  <FaCloudUploadAlt className="mx-auto text-5xl text-gray-400 mb-3" />
                  <p className="text-gray-600 mb-2">
                    <span className="text-purple-600 font-semibold">Click để tải ảnh</span> hoặc kéo thả
                  </p>
                  <p className="text-sm text-gray-500">PNG, JPG, GIF tối đa 5MB</p>
                </label>
              </div>
            ) : (
              <div className="relative rounded-xl overflow-hidden border border-gray-200">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={800}
                  height={400}
                  className="w-full h-64 object-cover"
                  unoptimized
                />
                <button
                  type="button"
                  onClick={removeImage}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors shadow-lg"
                >
                  <FaTimes />
                </button>
              </div>
            )}
            {errors.image && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <FaInfoCircle />
                {errors.image}
              </p>
            )}
          </div>

          {/* Basic Info */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Thông tin cơ bản</h2>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tên sự kiện <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="VD: Trồng cây xanh tại công viên"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 text-base placeholder:text-gray-400 ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaInfoCircle />
                  {errors.title}
                </p>
              )}
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Nội dung sự kiện <span className="text-red-500">*</span>
              </label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                rows={5}
                placeholder="Mô tả chi tiết về sự kiện, mục đích, hoạt động..."
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 text-base placeholder:text-gray-400 ${
                  errors.content ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaInfoCircle />
                  {errors.content}
                </p>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {categories.map((cat) => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, category: cat.value }))}
                    className={`p-3 rounded-lg border-2 transition-all text-center ${
                      formData.category === cat.value
                        ? "border-purple-600 bg-purple-50 text-purple-700"
                        : "border-gray-200 hover:border-purple-300"
                    }`}
                  >
                    <div className="text-2xl mb-1">{cat.icon}</div>
                    <div className="text-xs font-medium">{cat.label}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Date & Time */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Thời gian</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Start Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Ngày bắt đầu <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="datetime-local"
                    name="start_date"
                    value={formData.start_date}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 text-base ${
                      errors.start_date ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.start_date && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaInfoCircle />
                    {errors.start_date}
                  </p>
                )}
              </div>

              {/* End Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Ngày kết thúc <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input
                    type="datetime-local"
                    name="end_date"
                    value={formData.end_date}
                    onChange={handleInputChange}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 text-base ${
                      errors.end_date ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
                {errors.end_date && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <FaInfoCircle />
                    {errors.end_date}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Địa điểm</h2>

            {/* Location */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Tên địa điểm <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="VD: Công viên Tao Đàn"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 text-base placeholder:text-gray-400 ${
                    errors.location ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.location && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaInfoCircle />
                  {errors.location}
                </p>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Địa chỉ chi tiết
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="VD: Quận 1, TP. Hồ Chí Minh"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 text-base placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Participants & Requirements */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-bold text-gray-900 mb-4">Yêu cầu tham gia</h2>

            {/* Max Participants */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Số lượng tối đa <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  name="max_participants"
                  value={formData.max_participants}
                  onChange={handleInputChange}
                  min="1"
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 text-base ${
                    errors.max_participants ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              {errors.max_participants && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <FaInfoCircle />
                  {errors.max_participants}
                </p>
              )}
            </div>

            {/* Requirements */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Yêu cầu đối với tình nguyện viên
              </label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleInputChange}
                rows={3}
                placeholder="VD: Sức khỏe tốt, có kinh nghiệm làm việc nhóm..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-900 text-base placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Action Buttons - Fixed Bottom */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-2xl z-50">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
              {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Đang tạo...
                </span>
              ) : (
                "Tạo sự kiện"
              )}
                </button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}