"use client";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { IoIosNotifications } from "react-icons/io";
import {
  FaUserCircle,
  FaChevronDown,
  FaUsers,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { RiSettings4Fill, RiLogoutBoxLine } from "react-icons/ri";
import { MdDashboard, MdEvent } from "react-icons/md";

export default function NavbarManager() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    // Clear authentication tokens
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    // Redirect to login
    router.push("/home/login");
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  return (
    <div className="sticky top-0 text-black w-full z-10 bg-blue-400 shadow-md flex">
      <div className="ml-10 flex items-center p-2 bg-blue-400 w-1/5">
        <Image
          src="data:image/jpeg;base64,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"
          alt="Logo"
          className="h-12 border-2 border-white rounded-full"
          width={48}
          height={48}
          unoptimized
        />
        <h1 className="text-white text-xl font-bold leading-tigh text-center">
          Nhiệt huyết tình nguyện viên
        </h1>
      </div>
      <div className="ml-10 mb-4 mt-4 text-xl flex items-center justify-between space-x-4 bg-gray-200 border-5 border-red-300 rounded-full w-1/2">
        <Link
          href="/manager/dashboard"
          className={pathname === "/manager/dashboard" ? "underline" : ""}
        >
          Dashboard
        </Link>
        <Link
          href="/manager/events"
          className={pathname === "/manager/events" ? "underline" : ""}
        >
          Events
        </Link>
        <Link
          href="/manager/members"
          className={pathname === "/manager/members" ? "underline" : ""}
        >
          Members
        </Link>
      </div>

      <div className="relative ml-auto mr-10 flex items-center space-x-6">
        {/* Notifications Icon */}
        <Link href="/manager/notifications" className="relative">
          <IoIosNotifications className="text-white h-8 w-8 hover:text-gray-200 transition-colors cursor-pointer" />
          <span className="absolute -top-1 -right-1 text-white bg-red-500 rounded-full px-1.5 py-0.5 text-xs font-bold">
            3
          </span>
        </Link>

        {/* Profile Dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={toggleDropdown}
            className="flex items-center space-x-2 hover:bg-blue-500 px-3 py-2 rounded-lg transition-colors"
          >
            {user?.image ? (
              <Image
                src={user.image}
                alt="Profile"
                width={40}
                height={40}
                className="rounded-full border-2 border-white object-cover"
              />
            ) : (
              <FaUserCircle className="text-white h-10 w-10" />
            )}
            <span className="text-white font-medium hidden md:block">
              {user?.username || "Manager"}
            </span>
            <FaChevronDown
              className={`text-white transition-transform ${
                isDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl py-2 z-50 border border-gray-200">
              {/* User Info */}
              <div className="px-4 py-3 border-b border-gray-200">
                <p className="text-sm font-semibold text-gray-900">
                  {user?.username || "Manager"}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || "manager@example.com"}
                </p>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <Link
                  href="/manager/profile"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaUserCircle className="mr-3 h-5 w-5 text-gray-400" />
                  Hồ sơ của tôi
                </Link>

                <Link
                  href="/manager/dashboard"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <MdDashboard className="mr-3 h-5 w-5 text-gray-400" />
                  Dashboard
                </Link>

                <Link
                  href="/manager/events"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <MdEvent className="mr-3 h-5 w-5 text-gray-400" />
                  Quản lý sự kiện
                </Link>

                <Link
                  href="/manager/members"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <FaUsers className="mr-3 h-5 w-5 text-gray-400" />
                  Quản lý thành viên
                </Link>

                <Link
                  href="/manager/settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <RiSettings4Fill className="mr-3 h-5 w-5 text-gray-400" />
                  Cài đặt
                </Link>

                <Link
                  href="/manager/notifications-settings"
                  className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 transition-colors"
                  onClick={() => setIsDropdownOpen(false)}
                >
                  <IoIosNotifications className="mr-3 h-5 w-5 text-gray-400" />
                  Cài đặt thông báo
                </Link>
              </div>

              {/* Logout */}
              <div className="border-t border-gray-200 py-1">
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <RiLogoutBoxLine className="mr-3 h-5 w-5" />
                  Đăng xuất
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
