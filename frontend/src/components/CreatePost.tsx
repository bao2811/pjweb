"use client";
import { useState, useRef } from "react";
import { authFetch } from "@/utils/auth";
import Image from "next/image";
import {
  FaTimes,
  FaImage,
  FaSmile,
  FaMapMarkerAlt,
  FaUsers,
  FaPaperPlane,
  FaGlobeAmericas,
  FaLock,
  FaUserFriends,
} from "react-icons/fa";

interface CreatePostProps {
  onPostCreated?: (post: any) => void;
  onClose?: () => void;
  currentUser?: any;
}

export default function CreatePost({
  onPostCreated,
  onClose,
  currentUser,
}: CreatePostProps) {
  const [content, setContent] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPrivacyDropdown, setShowPrivacyDropdown] = useState(false);
  const [privacy, setPrivacy] = useState<"public" | "friends" | "private">(
    "public"
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type and size
      if (!file.type.startsWith("image/")) {
        alert("Vui lòng chọn file hình ảnh");
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert("Kích thước file không được vượt quá 5MB");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async () => {
    if (!content.trim() && !imageFile) {
      alert("Vui lòng nhập nội dung hoặc chọn hình ảnh");
      return;
    }

    setIsSubmitting(true);

    try {
      // For now, we'll send the image as base64 in the JSON payload
      // In production, you should upload to a CDN/storage and send the URL
      const postData: any = {
        content: content.trim(),
        title: title.trim() || content.trim().substring(0, 50),
        user_id: currentUser?.id,
        image: imagePreview || null,
        // Optional: add privacy/event_id if needed
        // privacy: privacy,
      };

      const token = localStorage.getItem("jwt_token");
      const res = await authFetch("/api/posts/createPost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(postData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.message || `Failed to create post: ${res.status}`
        );
      }

      const data = await res.json();
      const createdPost = data.post || data;

      // Notify parent component
      if (onPostCreated) {
        onPostCreated(createdPost);
      }

      // Reset form
      setContent("");
      setTitle("");
      setImagePreview(null);
      setImageFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      // Show success message
      alert("Đã đăng bài thành công!");

      // Close modal if provided
      if (onClose) {
        onClose();
      }
    } catch (error: any) {
      console.error("Error creating post:", error);
      alert(`Không thể tạo bài đăng: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const privacyOptions = [
    { value: "public", label: "Công khai", icon: FaGlobeAmericas },
    { value: "friends", label: "Bạn bè", icon: FaUserFriends },
    { value: "private", label: "Chỉ mình tôi", icon: FaLock },
  ];

  const selectedPrivacy = privacyOptions.find((opt) => opt.value === privacy);

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-700 to-slate-600 text-white px-6 py-4 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold">Tạo bài đăng</h2>
          <p className="text-sm opacity-90 mt-1">
            Chia sẻ thông tin và cập nhật với cộng đồng
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:text-slate-700 p-2 rounded-lg transition duration-200"
            aria-label="Đóng"
          >
            <FaTimes className="text-xl" />
          </button>
        )}
      </div>

      {/* User info */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
            {currentUser?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div>
            <p className="font-semibold text-gray-900">
              {currentUser?.username || "Người dùng"}
            </p>
            <div className="relative">
              <button
                onClick={() => setShowPrivacyDropdown(!showPrivacyDropdown)}
                className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900 transition"
              >
                {selectedPrivacy && (
                  <selectedPrivacy.icon className="text-xs" />
                )}
                <span>{selectedPrivacy?.label}</span>
                <span className="text-xs">▼</span>
              </button>
              {showPrivacyDropdown && (
                <div className="absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[150px]">
                  {privacyOptions.map((option) => (
                    <button
                      key={option.value}
                      onClick={() => {
                        setPrivacy(option.value as any);
                        setShowPrivacyDropdown(false);
                      }}
                      className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-2 text-sm text-gray-700 transition"
                    >
                      <option.icon className="text-gray-500" />
                      <span>{option.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content input */}
      <div className="px-6 py-4 space-y-4">
        {/* Title (optional) */}
        <div>
          <input
            type="text"
            placeholder="Tiêu đề (tùy chọn)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 text-base text-black placeholder:text-gray-400"
            maxLength={100}
          />
        </div>

        {/* Main content */}
        <div>
          <textarea
            placeholder="Bạn đang nghĩ gì?"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 text-base text-black placeholder:text-gray-400 resize-none"
            maxLength={5000}
          />
          <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
            <span>{content.length}/5000 ký tự</span>
          </div>
        </div>

        {/* Image preview */}
        {imagePreview && (
          <div className="relative rounded-xl overflow-hidden border border-gray-200">
            <Image
              src={imagePreview}
              alt="Preview"
              width={600}
              height={400}
              className="w-full h-auto max-h-96 object-cover"
              unoptimized
            />
            <button
              onClick={removeImage}
              className="absolute top-3 right-3 bg-white hover:bg-gray-100 text-gray-700 p-2 rounded-full shadow-md transition"
              aria-label="Xóa hình ảnh"
            >
              <FaTimes />
            </button>
          </div>
        )}
      </div>

      {/* Actions bar */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-200 rounded-lg transition text-gray-700"
              disabled={isSubmitting}
            >
              <FaImage className="text-green-600 text-lg" />
              <span className="text-sm font-medium">Hình ảnh</span>
            </button>

            {/* Future: add more action buttons like emoji, location, tag people */}
            {/* <button
              className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-200 rounded-lg transition text-gray-700"
              disabled={isSubmitting}
            >
              <FaSmile className="text-yellow-600 text-lg" />
              <span className="text-sm font-medium">Cảm xúc</span>
            </button> */}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (!content.trim() && !imageFile)}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white rounded-lg transition duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Đang đăng...</span>
              </>
            ) : (
              <>
                <FaPaperPlane />
                <span>Đăng bài</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
