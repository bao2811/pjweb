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
        "Vui lòng nhập URL ảnh từ internet (không hỗ trợ base64). Có thể để trống để dùng ảnh mặc định."
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
    <div className="fixed inset-0 flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b bg-gradient-to-r from-blue-500 to-green-500 rounded-t-2xl sticky top-0">
          <div>
            <h2 className="text-xl font-bold text-white">📝 Tạo sự kiện mới</h2>
            <p className="text-sm text-blue-100 mt-0.5">
              Sự kiện sẽ được gửi đến admin để phê duyệt
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 flex items-center justify-center text-white hover:bg-white/20 transition rounded-full"
            title="Đóng"
          >
            <FaTimes size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 bg-white">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
              <span>⚠️</span>
              <span>{error}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Tên sự kiện */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-800 mb-1.5">
                Tên sự kiện <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="VD: Chiến dịch trồng cây xanh"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800"
                required
              />
            </div>

            {/* Mô tả */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-800 mb-1.5">
                Mô tả <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.content}
                onChange={(e) =>
                  setFormData({ ...formData, content: e.target.value })
                }
                placeholder="Mô tả chi tiết về sự kiện..."
                rows={3}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-gray-800"
                required
              />
            </div>

            {/* Danh mục */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">
                Danh mục <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800"
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
              <label className="block text-sm font-medium text-gray-800 mb-1.5">
                Địa điểm <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaMapMarkerAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-red-500" />
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="VD: Công viên Thống Nhất, Hà Nội"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800"
                  required
                />
              </div>
            </div>

            {/* Ngày */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">
                Ngày tổ chức <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaCalendarAlt className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) =>
                    setFormData({ ...formData, date: e.target.value })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800"
                  required
                />
              </div>
            </div>

            {/* Giờ bắt đầu */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">
                Giờ bắt đầu <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
                <input
                  type="time"
                  value={formData.start_time}
                  onChange={(e) =>
                    setFormData({ ...formData, start_time: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800"
                  required
                />
              </div>
            </div>

            {/* Giờ kết thúc */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">
                Giờ kết thúc <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaClock className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" />
                <input
                  type="time"
                  value={formData.end_time}
                  onChange={(e) =>
                    setFormData({ ...formData, end_time: e.target.value })
                  }
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800"
                  required
                />
              </div>
            </div>

            {/* Số người tham gia */}
            <div>
              <label className="block text-sm font-medium text-gray-800 mb-1.5">
                Số người tối đa <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <FaUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-500" />
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
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800"
                  required
                />
              </div>
            </div>

            {/* Ảnh */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-800 mb-1.5">
                URL Ảnh (tùy chọn)
              </label>
              <div className="relative">
                <FaImage className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-500" />
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  placeholder="https://example.com/image.jpg"
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-gray-800"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Nếu bỏ trống, hệ thống sẽ dùng ảnh mặc định
              </p>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-5 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start gap-3">
              <FaFileAlt className="text-blue-600 mt-0.5" />
              <div className="text-sm text-gray-700">
                <p className="font-medium mb-1.5 text-gray-800">Lưu ý:</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• Sự kiện sẽ ở trạng thái "Chờ duyệt" sau khi tạo</li>
                  <li>• Admin sẽ xem xét trong vòng 24-48 giờ</li>
                  <li>• Bạn sẽ nhận thông báo khi sự kiện được duyệt</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                isSubmitting
                  ? "bg-gray-300 cursor-not-allowed text-gray-500"
                  : "bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white shadow-md"
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
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
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all font-medium border border-gray-300"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
