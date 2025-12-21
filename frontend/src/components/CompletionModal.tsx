"use client";
import { useState } from "react";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaStickyNote,
  FaExclamationCircle,
} from "react-icons/fa";
import { authFetch } from "@/utils/auth";

interface CompletionModalProps {
  volunteer: {
    user_id: number;
    username: string;
    email: string;
    image?: string;
  };
  eventId: number;
  onClose: () => void;
  onSuccess: () => void;
}

// Validation helper
const validateCompletionNote = (note: string): string | null => {
  const trimmedNote = note.trim();
  if (!trimmedNote) return "Vui lòng nhập ghi chú đánh giá";
  if (trimmedNote.length < 10) return "Ghi chú phải có ít nhất 10 ký tự";
  if (trimmedNote.length > 1000) return "Ghi chú không được quá 1000 ký tự";
  return null;
};

export default function CompletionModal({
  volunteer,
  eventId,
  onClose,
  onSuccess,
}: CompletionModalProps) {
  const [completionStatus, setCompletionStatus] = useState<
    "completed" | "failed"
  >("completed");
  const [completionNote, setCompletionNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [noteTouched, setNoteTouched] = useState(false);

  const handleNoteChange = (value: string) => {
    setCompletionNote(value);
    if (noteTouched) {
      setNoteError(validateCompletionNote(value));
    }
  };

  const handleNoteBlur = () => {
    setNoteTouched(true);
    setNoteError(validateCompletionNote(completionNote));
  };

  const handleSubmit = async () => {
    const error = validateCompletionNote(completionNote);
    setNoteError(error);
    setNoteTouched(true);

    if (error) {
      return;
    }

    try {
      setIsSubmitting(true);
      const response = await authFetch("/manager/mark-completion", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          event_id: eventId,
          user_id: volunteer.user_id,
          status: completionStatus,
          completion_note: completionNote,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert("Đánh giá thành công!");
        onSuccess();
        onClose();
      } else {
        alert(data.message || "Có lỗi xảy ra");
      }
    } catch (error) {
      console.error("Error marking completion:", error);
      alert("Có lỗi xảy ra khi đánh giá");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">
          Đánh giá tình nguyện viên
        </h2>

        {/* Volunteer Info */}
        <div className="flex items-center space-x-4 mb-6 p-4 bg-purple-50 rounded-lg">
          {volunteer.image ? (
            <img
              src={volunteer.image}
              alt={volunteer.username}
              className="w-12 h-12 rounded-full"
            />
          ) : (
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
              {volunteer.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <p className="font-semibold text-gray-800">{volunteer.username}</p>
            <p className="text-sm text-gray-600">{volunteer.email}</p>
          </div>
        </div>

        {/* Completion Status */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Trạng thái hoàn thành
          </label>
          <div className="flex space-x-4">
            <button
              onClick={() => setCompletionStatus("completed")}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 transition ${
                completionStatus === "completed"
                  ? "bg-green-50 border-green-500 text-green-700"
                  : "bg-gray-50 border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              <FaCheckCircle />
              <span className="font-semibold">Hoàn thành</span>
            </button>
            <button
              onClick={() => setCompletionStatus("failed")}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-lg border-2 transition ${
                completionStatus === "failed"
                  ? "bg-red-50 border-red-500 text-red-700"
                  : "bg-gray-50 border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              <FaTimesCircle />
              <span className="font-semibold">Không đạt</span>
            </button>
          </div>
        </div>

        {/* Completion Note */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-gray-700 mb-2 flex items-center">
            <FaStickyNote className="mr-2" />
            Ghi chú đánh giá <span className="text-red-500 ml-1">*</span>
          </label>
          <textarea
            value={completionNote}
            onChange={(e) => handleNoteChange(e.target.value)}
            onBlur={handleNoteBlur}
            placeholder="Nhập nhận xét về tình nguyện viên (tối thiểu 10 ký tự)..."
            className={`
            w-full
            p-3
            border-2
            rounded-lg
            text-black
            placeholder-gray-400
            focus:outline-none
            resize-none
            ${
              noteError && noteTouched
                ? "border-red-400 focus:border-red-500"
                : "border-gray-300 focus:border-purple-500"
            }
            `}
            rows={4}
            maxLength={1000}
          />
          <div className="flex justify-between items-center mt-1">
            {noteError && noteTouched ? (
              <p className="text-sm text-red-600 flex items-center">
                <FaExclamationCircle className="mr-1" /> {noteError}
              </p>
            ) : (
              <p className="text-sm text-gray-500">Tối thiểu 10 ký tự</p>
            )}
            <p className="text-sm text-gray-500">
              {completionNote.length}/1000 ký tự
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold disabled:opacity-50"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-semibold disabled:opacity-50"
          >
            {isSubmitting ? "Đang xử lý..." : "Xác nhận"}
          </button>
        </div>
      </div>
    </div>
  );
}
