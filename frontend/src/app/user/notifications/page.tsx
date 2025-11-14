"use client";
import { useState, useEffect } from "react";
import { FaBell, FaCheckCircle, FaExclamationCircle, FaInfoCircle, FaHeart, FaComment, FaUserPlus, FaCalendarCheck, FaTimes, FaCheck, FaEye, FaTrash } from "react-icons/fa";

// Notification types
type NotificationType = "success" | "info" | "warning" | "like" | "comment" | "join" | "approved";

interface Notification {
  id: number;
  type: NotificationType;
  title: string;
  message: string;
  time: string;
  isRead: boolean;
  link?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      type: "approved",
      title: "Đơn đăng ký được chấp nhận",
      message: "Đơn đăng ký tham gia sự kiện 'Dọn bãi biển Cần Giờ' của bạn đã được chấp nhận!",
      time: "5 phút trước",
      isRead: false,
      link: "/user/events/1",
    },
    {
      id: 2,
      type: "comment",
      title: "Bình luận mới",
      message: "Nguyễn Văn B đã bình luận vào bài viết của bạn: 'Ý tưởng tuyệt vời!'",
      time: "1 giờ trước",
      isRead: false,
      link: "/user/posts/123",
    },
    {
      id: 3,
      type: "like",
      title: "Lượt thích mới",
      message: "Trần Thị C và 15 người khác đã thích bài viết của bạn",
      time: "2 giờ trước",
      isRead: false,
      link: "/user/posts/122",
    },
    {
      id: 4,
      type: "info",
      title: "Sự kiện sắp diễn ra",
      message: "Sự kiện 'Trồng cây xanh' sẽ diễn ra vào ngày mai lúc 7:00 sáng. Đừng quên tham gia nhé!",
      time: "3 giờ trước",
      isRead: true,
      link: "/user/events/2",
    },
    {
      id: 5,
      type: "success",
      title: "Hoàn thành sự kiện",
      message: "Chúc mừng! Bạn đã hoàn thành sự kiện 'Nấu cơm từ thiện' và nhận được 50 điểm",
      time: "1 ngày trước",
      isRead: true,
    },
    {
      id: 6,
      type: "join",
      title: "Thành viên mới",
      message: "Có 5 tình nguyện viên mới tham gia sự kiện 'Dạy học miễn phí' của bạn",
      time: "1 ngày trước",
      isRead: true,
      link: "/user/events/3",
    },
    {
      id: 7,
      type: "warning",
      title: "Nhắc nhở",
      message: "Bạn chưa hoàn thành hồ sơ cá nhân. Vui lòng cập nhật thông tin để tham gia nhiều sự kiện hơn",
      time: "2 ngày trước",
      isRead: true,
      link: "/user/profile",
    },
  ]);

  const [filter, setFilter] = useState<"all" | "unread">("all");

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const filteredNotifications = filter === "unread" 
    ? notifications.filter((n) => !n.isRead)
    : notifications;

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "success":
      case "approved":
        return <FaCheckCircle className="text-2xl text-green-500" />;
      case "info":
        return <FaInfoCircle className="text-2xl text-blue-500" />;
      case "warning":
        return <FaExclamationCircle className="text-2xl text-yellow-500" />;
      case "like":
        return <FaHeart className="text-2xl text-pink-500" />;
      case "comment":
        return <FaComment className="text-2xl text-purple-500" />;
      case "join":
        return <FaUserPlus className="text-2xl text-indigo-500" />;
      default:
        return <FaBell className="text-2xl text-gray-500" />;
    }
  };

  const getBackgroundClass = (type: NotificationType) => {
    switch (type) {
      case "success":
      case "approved":
        return "from-green-50 to-green-100 border-green-200";
      case "info":
        return "from-blue-50 to-blue-100 border-blue-200";
      case "warning":
        return "from-yellow-50 to-yellow-100 border-yellow-200";
      case "like":
        return "from-pink-50 to-pink-100 border-pink-200";
      case "comment":
        return "from-purple-50 to-purple-100 border-purple-200";
      case "join":
        return "from-indigo-50 to-indigo-100 border-indigo-200";
      default:
        return "from-gray-50 to-gray-100 border-gray-200";
    }
  };

  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, isRead: true })));
  };

  const deleteNotification = (id: number) => {
    setNotifications(notifications.filter((n) => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-blue-600 mb-2">
                Thông Báo
              </h1>
              <p className="text-gray-600">
                Bạn có {unreadCount} thông báo chưa đọc
              </p>
            </div>
            <div className="relative">
              <FaBell className="text-5xl text-green-500 animate-pulse" />
              {unreadCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>

          {/* Filter & Actions */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={'px-6 py-2 rounded-xl font-semibold transition-all ' + (filter === "all" ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg" : "bg-white text-gray-700 border border-gray-300 hover:border-green-500")}
              >
                Tất cả ({notifications.length})
              </button>
              <button
                onClick={() => setFilter("unread")}
                className={'px-6 py-2 rounded-xl font-semibold transition-all ' + (filter === "unread" ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-lg" : "bg-white text-gray-700 border border-gray-300 hover:border-green-500")}
              >
                Chưa đọc ({unreadCount})
              </button>
            </div>

            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="ml-auto px-6 py-2 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-all font-semibold flex items-center gap-2"
              >
                <FaCheck />
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {filteredNotifications.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-12 text-center border border-gray-100">
              <FaBell className="text-6xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-400 mb-2">
                Không có thông báo
              </h3>
              <p className="text-gray-500">
                {filter === "unread" 
                  ? "Bạn đã đọc hết tất cả thông báo"
                  : "Chưa có thông báo nào"}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={'relative bg-gradient-to-r rounded-2xl shadow-md border p-5 transition-all hover:shadow-lg group ' + getBackgroundClass(notification.type) + (notification.isRead ? " opacity-60" : "")}
              >
                {/* Unread indicator */}
                {!notification.isRead && (
                  <div className="absolute top-3 left-3 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                )}

                <div className="flex gap-4">
                  {/* Icon */}
                  <div className="flex-shrink-0">
                    <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md">
                      {getIcon(notification.type)}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="font-bold text-gray-800 text-lg">
                        {notification.title}
                      </h3>
                      <span className="text-xs text-gray-500 whitespace-nowrap">
                        {notification.time}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3 leading-relaxed">
                      {notification.message}
                    </p>

                    {/* Actions */}
                    <div className="flex items-center gap-3">
                      {notification.link && (
                        <a
                          href={notification.link}
                          className="text-sm font-semibold text-green-600 hover:text-green-700 flex items-center gap-1 transition-all"
                        >
                          <FaEye />
                          Xem chi tiết
                        </a>
                      )}
                      {!notification.isRead && (
                        <button
                          onClick={() => markAsRead(notification.id)}
                          className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-all"
                        >
                          <FaCheck />
                          Đánh dấu đã đọc
                        </button>
                      )}
                      <button
                        onClick={() => deleteNotification(notification.id)}
                        className="ml-auto text-sm font-semibold text-red-600 hover:text-red-700 flex items-center gap-1 transition-all opacity-0 group-hover:opacity-100"
                      >
                        <FaTrash />
                        Xóa
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        {notifications.length > 0 && (
          <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-md p-4 text-center border border-gray-100">
              <FaBell className="text-3xl text-green-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{notifications.length}</p>
              <p className="text-sm text-gray-600">Tổng số</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center border border-gray-100">
              <FaEye className="text-3xl text-blue-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">
                {notifications.filter((n) => n.isRead).length}
              </p>
              <p className="text-sm text-gray-600">Đã đọc</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center border border-gray-100">
              <FaExclamationCircle className="text-3xl text-red-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">{unreadCount}</p>
              <p className="text-sm text-gray-600">Chưa đọc</p>
            </div>
            <div className="bg-white rounded-xl shadow-md p-4 text-center border border-gray-100">
              <FaHeart className="text-3xl text-pink-500 mx-auto mb-2" />
              <p className="text-2xl font-bold text-gray-800">
                {notifications.filter((n) => n.type === "like" || n.type === "comment").length}
              </p>
              <p className="text-sm text-gray-600">Tương tác</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
