"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { authFetch } from "@/utils/auth";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaImage,
  FaSpinner,
  FaSave,
  FaExclamationCircle,
} from "react-icons/fa";

interface EventData {
  id: number;
  title: string;
  content: string;
  image: string;
  start_time: string;
  end_time: string;
  address: string;
  max_participants: number;
  category: string;
  status: string;
}

interface FormErrors {
  title?: string | null;
  content?: string | null;
  image?: string | null;
  start_time?: string | null;
  end_time?: string | null;
  address?: string | null;
  max_participants?: string | null;
}

interface TouchedFields {
  title?: boolean;
  content?: boolean;
  image?: boolean;
  start_time?: boolean;
  end_time?: boolean;
  address?: boolean;
  max_participants?: boolean;
}

// Validation helpers
const validateTitle = (title: string): string | null => {
  if (!title.trim()) return "Vui lòng nhập tiêu đề";
  if (title.trim().length < 5) return "Tiêu đề phải có ít nhất 5 ký tự";
  if (title.trim().length > 200) return "Tiêu đề không được quá 200 ký tự";
  return null;
};

const validateContent = (content: string): string | null => {
  if (!content.trim()) return "Vui lòng nhập mô tả";
  if (content.trim().length < 20) return "Mô tả phải có ít nhất 20 ký tự";
  return null;
};

const validateAddress = (address: string): string | null => {
  if (!address.trim()) return "Vui lòng nhập địa điểm";
  if (address.trim().length < 5) return "Địa điểm phải có ít nhất 5 ký tự";
  return null;
};

const validateMaxParticipants = (value: number): string | null => {
  if (!value || value < 1) return "Số lượng tối đa phải lớn hơn 0";
  if (value > 10000) return "Số lượng không được vượt quá 10,000";
  return null;
};

const validateImageUrl = (url: string): string | null => {
  if (!url) return null; // Optional field
  try {
    new URL(url);
    return null;
  } catch {
    return "URL hình ảnh không hợp lệ";
  }
};

const validateStartTime = (startTime: string): string | null => {
  if (!startTime) return "Vui lòng chọn thời gian bắt đầu";
  return null;
};

const validateEndTime = (startTime: string, endTime: string): string | null => {
  if (!endTime) return "Vui lòng chọn thời gian kết thúc";
  if (startTime && endTime && new Date(endTime) <= new Date(startTime)) {
    return "Thời gian kết thúc phải sau thời gian bắt đầu";
  }
  return null;
};

import { use } from "react";

export default function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [event, setEvent] = useState<EventData | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    image: "",
    start_time: "",
    end_time: "",
    address: "",
    max_participants: 10,
    category: "Môi trường",
  });

  // Handle field blur for real-time validation
  const handleBlur = (fieldName: keyof FormErrors) => {
    setTouched((prev) => ({ ...prev, [fieldName]: true }));
    validateField(fieldName);
  };

  // Validate a single field
  const validateField = (fieldName: keyof FormErrors) => {
    let error: string | null = null;

    switch (fieldName) {
      case "title":
        error = validateTitle(formData.title);
        break;
      case "content":
        error = validateContent(formData.content);
        break;
      case "address":
        error = validateAddress(formData.address);
        break;
      case "max_participants":
        error = validateMaxParticipants(formData.max_participants);
        break;
      case "image":
        error = validateImageUrl(formData.image);
        break;
      case "start_time":
        error = validateStartTime(formData.start_time);
        break;
      case "end_time":
        error = validateEndTime(formData.start_time, formData.end_time);
        break;
    }

    setFormErrors((prev) => ({ ...prev, [fieldName]: error }));
    return error;
  };

  // Validate all fields
  const validateForm = (): boolean => {
    const errors: FormErrors = {
      title: validateTitle(formData.title),
      content: validateContent(formData.content),
      address: validateAddress(formData.address),
      max_participants: validateMaxParticipants(formData.max_participants),
      image: validateImageUrl(formData.image),
      start_time: validateStartTime(formData.start_time),
      end_time: validateEndTime(formData.start_time, formData.end_time),
    };

    setFormErrors(errors);
    setTouched({
      title: true,
      content: true,
      address: true,
      max_participants: true,
      image: true,
      start_time: true,
      end_time: true,
    });

    return !Object.values(errors).some((error) => error !== null);
  };

  useEffect(() => {
    fetchEventDetails();
  }, [id]);

  const fetchEventDetails = async () => {
    try {
      setIsLoading(true);
      const response = await authFetch(`/manager/events/${id}`);
      const data = await response.json();

      if (data && data.event) {
        const eventData = data.event;
        setEvent(eventData);

        // Parse datetime to separate date and time
        const startDate = eventData.start_time
          ? eventData.start_time.split(" ")[0]
          : "";
        const startTime = eventData.start_time
          ? eventData.start_time.split(" ")[1]?.substring(0, 5)
          : "";
        const endDate = eventData.end_time
          ? eventData.end_time.split(" ")[0]
          : "";
        const endTime = eventData.end_time
          ? eventData.end_time.split(" ")[1]?.substring(0, 5)
          : "";

        setFormData({
          title: eventData.title || "",
          content: eventData.content || "",
          image: eventData.image || "",
          start_time: `${startDate}T${startTime}`,
          end_time: `${endDate}T${endTime}`,
          address: eventData.address || "",
          max_participants: eventData.max_participants || 10,
          category: eventData.category || "Môi trường",
        });
      }
    } catch (error) {
      console.error("Error fetching event:", error);
      alert("Không thể tải thông tin sự kiện");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate all fields before submit
    if (!validateForm()) {
      return;
    }

    try {
      setIsSaving(true);

      // Convert datetime-local to MySQL datetime format
      const startDateTime = formData.start_time
        ? formData.start_time.replace("T", " ") + ":00"
        : "";
      const endDateTime = formData.end_time
        ? formData.end_time.replace("T", " ") + ":00"
        : "";

      const response = await authFetch(`/manager/events/${id}/update`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          image: formData.image,
          start_time: startDateTime,
          end_time: endDateTime,
          address: formData.address,
          max_participants: formData.max_participants,
          category: formData.category,
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert("Đã cập nhật sự kiện thành công!");
        // router.push("/manager/events");
      } else {
        throw new Error(data.message || "Cập nhật sự kiện thất bại");
      }
    } catch (error: any) {
      console.error("Error updating event:", error);
      alert(error.message || "Có lỗi xảy ra khi cập nhật sự kiện");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 flex items-center justify-center">
        <div className="text-center">
          <FaSpinner className="animate-spin text-6xl text-blue-600 mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Đang tải thông tin sự kiện...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 transition-colors mb-4"
          >
            <FaArrowLeft />
            <span>Quay lại</span>
          </button>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            ✏️ Chỉnh sửa sự kiện
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Cập nhật thông tin sự kiện của bạn
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-lg p-6 space-y-6"
        >
          {/* Title */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tiêu đề sự kiện <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => {
                setFormData({ ...formData, title: e.target.value });
                if (touched.title) validateField("title");
              }}
              onBlur={() => handleBlur("title")}
              className={`text-black w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors ${
                formErrors.title && touched.title
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-200 focus:border-blue-400"
              }`}
              placeholder="Nhập tiêu đề sự kiện..."
            />
            {formErrors.title && touched.title && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FaExclamationCircle className="mr-1" /> {formErrors.title}
              </p>
            )}
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mô tả chi tiết <span className="text-red-500">*</span>
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => {
                setFormData({ ...formData, content: e.target.value });
                if (touched.content) validateField("content");
              }}
              onBlur={() => handleBlur("content")}
              className={`text-black w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors resize-none ${
                formErrors.content && touched.content
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-200 focus:border-blue-400"
              }`}
              rows={6}
              placeholder="Nhập mô tả chi tiết về sự kiện..."
            />
            {formErrors.content && touched.content && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FaExclamationCircle className="mr-1" /> {formErrors.content}
              </p>
            )}
          </div>

          {/* Image */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaImage className="inline mr-2" />
              URL hình ảnh
            </label>
            <input
              type="url"
              value={formData.image}
              onChange={(e) => {
                setFormData({ ...formData, image: e.target.value });
                if (touched.image) validateField("image");
              }}
              onBlur={() => handleBlur("image")}
              className={`text-black w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors ${
                formErrors.image && touched.image
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-200 focus:border-blue-400"
              }`}
              placeholder="https://example.com/image.jpg"
            />
            {formErrors.image && touched.image && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FaExclamationCircle className="mr-1" /> {formErrors.image}
              </p>
            )}
            {formData.image && !formErrors.image && (
              <div className="mt-3 relative h-48 rounded-lg overflow-hidden">
                <Image
                  src={formData.image}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaCalendarAlt className="inline mr-2" />
                Thời gian bắt đầu <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.start_time}
                onChange={(e) => {
                  setFormData({ ...formData, start_time: e.target.value });
                  if (touched.start_time) validateField("start_time");
                  if (touched.end_time) validateField("end_time");
                }}
                onBlur={() => handleBlur("start_time")}
                className={`text-black w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors ${
                  formErrors.start_time && touched.start_time
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-blue-400"
                }`}
              />
              {formErrors.start_time && touched.start_time && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FaExclamationCircle className="mr-1" />{" "}
                  {formErrors.start_time}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaCalendarAlt className="inline mr-2" />
                Thời gian kết thúc <span className="text-red-500">*</span>
              </label>
              <input
                type="datetime-local"
                value={formData.end_time}
                onChange={(e) => {
                  setFormData({ ...formData, end_time: e.target.value });
                  if (touched.end_time) validateField("end_time");
                }}
                onBlur={() => handleBlur("end_time")}
                className={`text-black w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors ${
                  formErrors.end_time && touched.end_time
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-blue-400"
                }`}
              />
              {formErrors.end_time && touched.end_time && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FaExclamationCircle className="mr-1" /> {formErrors.end_time}
                </p>
              )}
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              <FaMapMarkerAlt className="inline mr-2" />
              Địa điểm <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => {
                setFormData({ ...formData, address: e.target.value });
                if (touched.address) validateField("address");
              }}
              onBlur={() => handleBlur("address")}
              className={`text-black w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors ${
                formErrors.address && touched.address
                  ? "border-red-400 focus:border-red-500"
                  : "border-gray-200 focus:border-blue-400"
              }`}
              placeholder="Nhập địa điểm tổ chức..."
            />
            {formErrors.address && touched.address && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <FaExclamationCircle className="mr-1" /> {formErrors.address}
              </p>
            )}
          </div>

          {/* Max Participants & Category */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <FaUsers className="inline mr-2" />
                Số lượng tối đa <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={formData.max_participants}
                onChange={(e) => {
                  setFormData({
                    ...formData,
                    max_participants: parseInt(e.target.value) || 0,
                  });
                  if (touched.max_participants)
                    validateField("max_participants");
                }}
                onBlur={() => handleBlur("max_participants")}
                className={`text-black w-full px-4 py-3 rounded-lg border-2 focus:outline-none transition-colors ${
                  formErrors.max_participants && touched.max_participants
                    ? "border-red-400 focus:border-red-500"
                    : "border-gray-200 focus:border-blue-400"
                }`}
                min="1"
              />
              {formErrors.max_participants && touched.max_participants && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FaExclamationCircle className="mr-1" />{" "}
                  {formErrors.max_participants}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Thể loại
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="text-black w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-blue-400 focus:outline-none transition-colors bg-white"
              >
                <option value="Môi trường">🌱 Môi trường</option>
                <option value="Giáo dục">📚 Giáo dục</option>
                <option value="Xã hội">🤝 Xã hội</option>
                <option value="Y tế">⚕️ Y tế</option>
              </select>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-3 rounded-xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
              disabled={isSaving}
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-green-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? (
                <>
                  <FaSpinner className="animate-spin" />
                  <span>Đang lưu...</span>
                </>
              ) : (
                <>
                  <FaSave />
                  <span>Lưu thay đổi</span>
                </>
              )}
            </button>
          </div>
        </form>

        {/* Info Notice */}
        <div className="mt-6 bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>📢 Lưu ý:</strong> Khi bạn cập nhật sự kiện, hệ thống sẽ tự
            động gửi thông báo đến admin để xem xét các thay đổi.
          </p>
        </div>
      </div>
    </div>
  );
}
