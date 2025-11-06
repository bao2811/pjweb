'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FaBell, FaUser, FaSignOutAlt, FaCog, FaCalendarAlt, FaTrophy, FaHome } from 'react-icons/fa';

interface NavbarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role: 'user' | 'manager' | 'admin';
    points?: number;
  };
}

export default function Navbar({ user }: NavbarProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, message: 'Sự kiện "Trồng cây xanh" được duyệt', read: false, time: '2 giờ trước' },
    { id: 2, message: 'Bạn có 1 tin nhắn mới trong kênh "Dọn rác biển"', read: false, time: '1 ngày trước' },
    { id: 3, message: 'Sự kiện "Hỗ trợ người già" sắp bắt đầu', read: true, time: '2 ngày trước' },
  ]);

  // Mock user data for testing
  const mockUser = {
    name: "FL",
    email: "admin@example.com", 
    avatar: "https://i.pravatar.cc/150?img=12",
    role: "admin" as const,
    points: 2500,
  };

  // Use mock user if no user prop provided
  const currentUser = user || mockUser;

  const userMenuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Get base path theo role
  const getBasePath = (role: string) => {
    switch (role) {
      case 'admin':
        return '/admin';
      case 'manager':
        return '/manager';
      case 'user':
      default:
        return '/user';
    }
  };

  const basePath = getBasePath(currentUser.role);

  // Prevent hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    window.location.href = '/home/login';
  };

  const markAsRead = (id: number) => {
    setNotifications(notifications.map(n => 
      n.id === id ? { ...n, read: true } : n
    ));
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-8">
            <Link href={`${basePath}/dashboard`} className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-xl flex items-center justify-center transform group-hover:scale-110 transition-transform duration-200 shadow-md">
                <span className="text-white text-2xl">🌱</span>
              </div>
              <div>
                <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                  VolunteerHub
                </div>
                <div className="text-[10px] text-gray-500 font-medium -mt-1">
                  Lan tỏa yêu thương, kiến tạo tương lai
                </div>
              </div>
            </Link>

            {/* Main Navigation - Dynamic theo role */}
            <div className="hidden md:flex items-center space-x-1">
              <Link 
                href={`${basePath}/dashboard`}
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-green-600 transition-colors duration-200 font-medium"
              >
                Bảng tin
              </Link>
              
              <Link 
                href={`${basePath}/events`}
                className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-green-600 transition-colors duration-200 font-medium"
              >
                Sự kiện
              </Link>

              {/* User role: Sự kiện đã tham gia */}
              {currentUser.role === 'user' && (
                <Link 
                  href="/user/eventsattended" 
                  className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-green-600 transition-colors duration-200 font-medium"
                >
                  Sự kiện đã tham gia
                </Link>
              )}

              {/* Manager role: Quản lý sự kiện */}
              {currentUser.role === 'manager' && (
                <>
                  <Link 
                    href="/manager/manage-events" 
                    className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-purple-600 transition-colors duration-200 font-medium"
                  >
                    Quản lý sự kiện
                  </Link>
                  <Link 
                    href="/manager/reports" 
                    className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-purple-600 transition-colors duration-200 font-medium"
                  >
                    Báo cáo
                  </Link>
                </>
              )}

              {/* Admin role: All management features */}
              {currentUser.role === 'admin' && (
                <>
                  <Link 
                    href="/admin/users" 
                    className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors duration-200 font-medium"
                  >
                    Quản lý người dùng
                  </Link>
                  <Link 
                    href="/admin/manage-events" 
                    className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors duration-200 font-medium"
                  >
                    Duyệt sự kiện
                  </Link>
                  <Link 
                    href="/admin/analytics" 
                    className="px-4 py-2 rounded-lg text-gray-700 hover:bg-gray-100 hover:text-red-600 transition-colors duration-200 font-medium"
                  >
                    Thống kê
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Side */}
          <div className="flex items-center space-x-4">
            {currentUser ? (
              <>
                {/* Points Badge */}
                <div className="hidden sm:flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-orange-100 px-4 py-2 rounded-full border border-yellow-300">
                  <FaTrophy className="text-yellow-600" />
                  <span className="font-bold text-yellow-700">{currentUser.points || 0}</span>
                  <span className="text-xs text-yellow-600">điểm</span>
                </div>

                {/* Notifications */}
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="relative p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors duration-200"
                  >
                    <FaBell className="text-xl" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {/* Notifications Dropdown */}
                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                      <div className="bg-gradient-to-r from-green-500 to-blue-500 px-4 py-3">
                        <h3 className="text-white font-semibold">Thông báo</h3>
                      </div>
                      <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            Không có thông báo mới
                          </div>
                        ) : (
                          notifications.map(noti => (
                            <div
                              key={noti.id}
                              onClick={() => markAsRead(noti.id)}
                              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                                !noti.read ? 'bg-blue-50' : ''
                              }`}
                            >
                              <p className={`text-sm ${!noti.read ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                {noti.message}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">{noti.time}</p>
                            </div>
                          ))
                        )}
                      </div>
                      <Link
                        href={`${basePath}/notifications`}
                        className="block p-3 text-center text-green-600 hover:bg-gray-50 font-medium text-sm"
                      >
                        Xem tất cả thông báo
                      </Link>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-3 hover:bg-gray-100 rounded-full pl-1 pr-4 py-1 transition-colors duration-200"
                  >
                    <div className="relative">
                      {currentUser.avatar ? (
                        <Image
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          width={40}
                          height={40}
                          className="rounded-full border-2 border-green-400"
                        />
                      ) : (
                        <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white font-bold text-lg">
                            {currentUser.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      {/* Online indicator */}
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-sm font-semibold text-gray-800">{currentUser.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{currentUser.role}</p>
                    </div>
                  </button>

                  {/* User Dropdown Menu */}
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
                      {/* User Info Header */}
                      <div className="bg-gradient-to-r from-green-500 to-blue-500 px-4 py-4">
                        <p className="text-white font-semibold">{currentUser.name}</p>
                        <p className="text-white/80 text-sm">{currentUser.email}</p>
                        <div className="flex items-center space-x-2 mt-2">
                          <span className="bg-white/20 text-white text-xs font-medium px-2 py-1 rounded-full capitalize">
                            {currentUser.role}
                          </span>
                          <span className="bg-white/20 text-white text-xs font-medium px-2 py-1 rounded-full">
                            ⭐ {currentUser.points || 0} điểm
                          </span>
                        </div>
                      </div>

                      {/* Menu Items - Dynamic theo role */}
                      <div className="py-2">
                        <Link
                          href={`${basePath}/profile`}
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <FaUser className="text-gray-500" />
                          <span className="text-gray-700 font-medium">Trang cá nhân</span>
                        </Link>

                        {/* User specific links */}
                        {currentUser.role === 'user' && (
                          <Link
                            href="/user/eventsattended"
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                          >
                            <FaCalendarAlt className="text-gray-500" />
                            <span className="text-gray-700 font-medium">Sự kiện của tôi</span>
                          </Link>
                        )}

                        {/* Manager specific links */}
                        {currentUser.role === 'manager' && (
                          <Link
                            href="/manager/my-events"
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                          >
                            <FaCalendarAlt className="text-gray-500" />
                            <span className="text-gray-700 font-medium">Sự kiện tôi quản lý</span>
                          </Link>
                        )}

                        {/* Admin specific links */}
                        {currentUser.role === 'admin' && (
                          <Link
                            href="/admin/system-settings"
                            className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                          >
                            <FaCog className="text-gray-500" />
                            <span className="text-gray-700 font-medium">Cài đặt hệ thống</span>
                          </Link>
                        )}

                        <Link
                          href={`${basePath}/settings`}
                          className="flex items-center space-x-3 px-4 py-3 hover:bg-gray-50 transition-colors"
                        >
                          <FaCog className="text-gray-500" />
                          <span className="text-gray-700 font-medium">Cài đặt</span>
                        </Link>
                        <hr className="my-2" />
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center space-x-3 px-4 py-3 hover:bg-red-50 transition-colors text-red-600"
                        >
                          <FaSignOutAlt />
                          <span className="font-medium">Đăng xuất</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              /* Login/Register buttons when not logged in */
              <div className="flex items-center space-x-3">
                <Link
                  href="/home/login"
                  className="px-4 py-2 text-gray-700 hover:text-green-600 font-medium transition-colors"
                >
                  Đăng nhập
                </Link>
                <Link
                  href="/home/register"
                  className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Đăng ký
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}