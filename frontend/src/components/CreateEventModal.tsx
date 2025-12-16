"use client";
import { useState } from "react";
import {
  FaTimes,
  FaCalendarAlt,
  FaClock,
  FaMapMarkerAlt,
  FaUsers,
  FaImage,
  FaFileAlt,
  FaCheck,
} from "react-icons/fa";
import { authFetch } from "@/utils/auth";

interface CreateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function CreateEventModal({
  isOpen,
  onClose,
  onSuccess,
}: CreateEventModalProps) {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    address: "",
    date: "",
    start_time: "",
    end_time: "",
    max_participants: "",
    image: "",
    category: "community",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const categories = [
    { value: "community", label: "🏘️ Cộng đồng", color: "blue" },
    { value: "environment", label: "🌱 Môi trường", color: "green" },
    { value: "education", label: "📚 Giáo dục", color: "purple" },
    { value: "health", label: "❤️ Sức khỏe", color: "red" },
    { value: "animal", label: "🐾 Động vật", color: "orange" },
    { value: "culture", label: "🎭 Văn hóa", color: "pink" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validation
    if (!formData.title || !formData.content || !formData.address) {
      setError("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    if (!formData.date || !formData.start_time || !formData.end_time) {
      setError("Vui lòng chọn ngày và giờ!");
      return;
    }

    if (!formData.max_participants || parseInt(formData.max_participants) < 1) {
      setError("Số lượng người tham gia phải lớn hơn 0!");
      return;
    }

    // Validate start time < end time
    if (formData.start_time >= formData.end_time) {
      setError("⚠️ Giờ kết thúc phải sau giờ bắt đầu!");
      return;
    }

    // Validate image URL (no base64)
    if (formData.image && formData.image.startsWith("data:")) {
      setError(
        "⚠️ Vui lòng nhập URL ảnh từ internet (không hỗ trợ base64). Có thể để trống để dùng ảnh mặc định."
      );
      return;
    }

    try {
      setIsSubmitting(true);

      // Combine date + time into datetime format for backend
      const startDateTime = `${formData.date} ${formData.start_time}:00`;
      const endDateTime = `${formData.date} ${formData.end_time}:00`;

      const response = await authFetch("/manager/createEvent", {
        method: "POST",
        body: JSON.stringify({
          title: formData.title,
          content: formData.content,
          address: formData.address,
          start_time: startDateTime,
          end_time: endDateTime,
          max_participants: parseInt(formData.max_participants),
          image: formData.image || "",
          category: formData.category,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Event created:", data);

        // Reset form
        setFormData({
          title: "",
          content: "",
          address: "",
          date: "",
          start_time: "",
          end_time: "",
          max_participants: "",
          image: "",
          category: "community",
        });

        // Show success message
        alert("✅ Tạo sự kiện thành công! Đang chờ admin phê duyệt.");

        onSuccess?.();
        onClose();
      } else {
        const errorData = await response.json();
        console.error("Backend error:", errorData);

        // Display more detailed error
        if (errorData.errors) {
          const firstError = Object.values(errorData.errors)[0];
          setError(Array.isArray(firstError) ? firstError[0] : firstError);
        } else {
          setError(errorData.message || "Có lỗi xảy ra khi tạo sự kiện!");
        }
      }
    } catch (error) {
      console.error("Error creating event:", error);
      setError("Không thể kết nối đến server!");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto animate-fadeIn">
      <div className="bg-gradient-to-br from-white via-purple-50/30 to-pink-50/30 rounded-3xl shadow-2xl max-w-4xl w-full my-8 animate-slideUp border border-purple-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-purple-100 bg-gradient-to-r from-purple-500 to-pink-500 rounded-t-3xl">
          <div>
            <h2 className="text-2xl font-bold text-white">
              ✨ Tạo sự kiện mới
            </h2>
            <p className="text-sm text-purple-100 mt-1">
              Sự kiện sẽ được gửi đến admin để phê duyệt
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-purple-100 transition p-2 hover:bg-white/10 rounded-full"
          >
            <FaTimes size={24} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-8 bg-white/80 backdrop-blur-sm"
        >
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-sm flex items-start gap-3">
              <span className="text-red-500 text-xl">⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tên sự kiện */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên sự kiện <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="VD: Chiến dịch trồng cây xanh"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                required
              />
            </div>

            {/* Mô tả */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mô tả <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Mô tả chi tiết về sự kiện..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                required
              />
            </div>

            {/* Danh mục */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
              >
                {categories.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Địa điểm */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa điểm <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="VD: Công viên Thống Nhất, Hà Nội"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Ngày */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày tổ chức <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Giờ bắt đầu */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giờ bắt đầu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Giờ kết thúc */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giờ kết thúc <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Số người tham gia */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số người tham gia tối đa <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  value={formData.max_participants}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      max_participants: e.target.value,
                    })
                  }
                  placeholder="VD: 50"
                  min="1"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                  required
                />
              </div>
            </div>

            {/* Ảnh */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL Ảnh (tùy chọn)
              </label>
              <div className="relative">
                <FaImage className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full pl-10 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Nếu bỏ trống, hệ thống sẽ dùng ảnh mặc định
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-5 bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-purple-500 rounded-r-xl shadow-sm">
            <div className="flex items-start gap-3">
              <FaFileAlt className="text-purple-600 mt-1 text-xl" />
              <div className="text-sm text-gray-700">
                <p className="font-semibold mb-2 text-purple-700">
                  💡 Lưu ý quan trọng:
                </p>
                <ul className="space-y-2">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">✓</span>
                    <span>
                      Sự kiện sẽ ở trạng thái <strong>"Chờ duyệt"</strong> sau
                      khi tạo
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">✓</span>
                    <span>
                      Admin sẽ xem xét và phê duyệt trong vòng{" "}
                      <strong>24-48 giờ</strong>
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-500 mt-0.5">✓</span>
                    <span>
                      Bạn sẽ nhận thông báo khi sự kiện được duyệt/từ chối
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mt-8">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all shadow-lg transform hover:scale-105 ${
                isSubmitting
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-purple-600 via-pink-500 to-purple-600 hover:from-purple-700 hover:via-pink-600 hover:to-purple-700 text-white shadow-purple-500/50"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Đang tạo...
                </>
              ) : (
                <>
                  <FaCheck />
                  Tạo sự kiện
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-8 py-4 bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 rounded-xl hover:from-gray-200 hover:to-gray-300 transition-all font-semibold shadow-md"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
