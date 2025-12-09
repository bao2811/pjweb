"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { authFetch } from "@/utils/auth";
import {
  FaHeart,
  FaRegHeart,
  FaComment,
  FaShare,
  FaEllipsisH,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaUsers,
  FaPaperPlane,
  FaSmile,
  FaImage,
  FaFire,
  FaTrophy,
  FaStar,
} from "react-icons/fa";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Mock data for volunteer events
const trendingEvents: any[] = [
  {
    id: 1,
    title: "Clean Beach - Dọn biển",
    participants: 128,
    date: "2025-01-15",
    image: "https://via.placeholder.com/800x600/ef4444/ffffff?text=Event+1",
  },
  {
    id: 2,
    title: "Trồng cây xanh",
    participants: 86,
    date: "2025-02-10",
    image: "https://via.placeholder.com/800x600/10b981/ffffff?text=Event+2",
  },
  {
    id: 3,
    title: "Hội chợ từ thiện",
    participants: 45,
    date: "2025-03-05",
    image: "https://via.placeholder.com/800x600/3b82f6/ffffff?text=Event+3",
  },
];

export default function Dashboard() {
  const { user: currentUser } = useAuth(); // Dùng user từ AuthContext
  const [posts, setPosts] = useState<any[]>([]);
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>(
    {}
  );
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(false);

  async function fetchPosts(lastId?: number, limit: number = 10) {
    const token = localStorage.getItem("jwt_token");
    const res = await authFetch("/api/posts/getAllPosts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ last_id: lastId || null, limit: limit }),
    });
    const data = await res.json();
    if (data.posts) {
      setPosts(data.posts);
      console.log(data.posts);
    }
    setLoading(false);
  }

  // if (loading === false && posts.length === 0) {
  //   setLoading(true);
  //   fetchPosts();
  // }

  const handleLike = (postId: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId
          ? {
              ...post,
              isLiked: !post.isLiked,
              likes: post.isLiked ? post.likes - 1 : post.likes + 1,
            }
          : post
      )
    );
  };

  const handleCommentChange = (postId: number, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  const handleCommentSubmit = (postId: number) => {
    if (commentInputs[postId]?.trim()) {
      // Handle comment submission
      console.log(`Comment for post ${postId}:`, commentInputs[postId]);
      setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
    }
  };

  const formatTime = (timestamp: string) => {
    return timestamp;
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Sidebar - Quick Actions */}
          <div className="lg:col-span-3 space-y-4">
            {/* Welcome Card */}
            <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="text-xl font-bold mb-2">Chào mừng trở lại! 👋</h3>
              <p className="text-white/90 text-sm">
                Hãy tham gia sự kiện mới và tích điểm nhé!
              </p>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-800 mb-4">Thống kê nhanh</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <FaCalendarAlt className="text-green-500 text-xl" />
                    <span className="text-gray-700 font-medium">Sự kiện</span>
                  </div>
                  <span className="text-2xl font-bold text-green-600">15</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <FaUsers className="text-blue-500 text-xl" />
                    <span className="text-gray-700 font-medium">Giờ TNV</span>
                  </div>
                  <span className="text-2xl font-bold text-blue-600">48h</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-800 mb-4">Thao tác nhanh</h3>
              <div className="space-y-2">
                <Link
                  href="/user/events"
                  className="block w-full text-center py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all"
                >
                  🔍 Tìm sự kiện
                </Link>
                <Link
                  href="/user/eventsattended"
                  className="block w-full text-center py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all"
                >
                  📋 Sự kiện của tôi
                </Link>
              </div>
            </div>
          </div>

          {/* Main Feed - Center Column */}
          <div className="lg:col-span-6 space-y-6">
            {/* Create Post Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-lg">
                    {currentUser?.username?.charAt(0) || "U"}
                  </span>
                </div>
                <div className="flex-1">
                  <textarea
                    placeholder="Chia sẻ trải nghiệm tình nguyện của bạn..."
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex space-x-2">
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaImage className="text-green-600 text-xl" />
                      </button>
                      <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                        <FaSmile className="text-yellow-500 text-xl" />
                      </button>
                    </div>
                    <button className="px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200">
                      Đăng bài
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Posts Feed */}
            <div className="space-y-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-2xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                >
                  {/* Post Header */}
                  <div className="p-6 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="relative">
                        <Image
                          src={
                            post.avatar ||
                            post.author?.avatar ||
                            post.user?.image ||
                            "https://via.placeholder.com/150/3b82f6/ffffff?text=User"
                          }
                          alt={
                            post.name ||
                            post.author?.name ||
                            post.user?.username ||
                            "User"
                          }
                          width={56}
                          height={56}
                          className="rounded-full ring-2 ring-blue-100"
                          unoptimized
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {post.name ||
                            post.author?.name ||
                            post.user?.username ||
                            "Người dùng"}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                            {post.role ||
                              post.author?.role ||
                              post.user?.role ||
                              "Tình nguyện viên"}
                          </span>
                          <span>•</span>
                          <span>
                            {formatTime(post.created_at || post.timestamp)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 p-3 rounded-full hover:bg-gray-100 transition-all duration-200">
                      <FaEllipsisH />
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="px-4 pb-4">
                    <p className="text-gray-800 leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  {/* Event Info Card */}
                  <div className="mx-4 mb-4 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                    <div className="relative h-48">
                      <Image
                        src={
                          post.image ||
                          "https://via.placeholder.com/800x600/10b981/ffffff?text=Volunteer+Post"
                        }
                        alt={post.title}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-lg text-gray-900 mb-2">
                        {post.title}
                      </h4>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <FaCalendarAlt className="text-blue-500" />
                          <span>
                            {post.start_time} • {post.end_time}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaMapMarkerAlt className="text-red-500" />
                          <span>{post.address}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <FaUsers className="text-green-500" />
                          {post.role === "manager" ? (
                            <span>
                              {post.participants}/{post.maxParticipants} người
                              tham gia
                            </span>
                          ) : (
                            <span></span>
                          )}
                        </div>
                      </div>
                      {/* <div className="mt-3">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            (post.event.participants /
                              post.event.maxParticipants) *
                            100
                          }%`,
                        }}
                      ></div>
                    </div>
                  </div> */}
                    </div>
                  </div>

                  {/* Engagement Stats */}
                  <div className="px-4 py-2 border-t border-gray-100">
                    <div className="flex justify-between items-center text-sm text-gray-500">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center">
                          <FaHeart className="text-red-500 mr-1" />
                          {post.likes}
                        </span>
                        <span>{post.comments} bình luận</span>
                        <span>{post.shares} chia sẻ</span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-4 py-2 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center justify-center space-x-2 py-3 rounded-lg transition duration-200 ${
                          post.isLiked
                            ? "text-red-500 bg-red-50 hover:bg-red-100"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {post.isLiked ? <FaHeart /> : <FaRegHeart />}
                        <span className="font-medium">Thích</span>
                      </button>
                      <button className="flex items-center justify-center space-x-2 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition duration-200">
                        <FaComment />
                        <span className="font-medium">Bình luận</span>
                      </button>
                      <button className="flex items-center justify-center space-x-2 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition duration-200">
                        <FaShare />
                        <span className="font-medium">Chia sẻ</span>
                      </button>
                    </div>
                  </div>

                  {/* Comment Section */}
                  <div className="px-4 pb-4 border-t border-gray-100">
                    <div className="flex items-center space-x-3 mt-3">
                      <Image
                        src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face"
                        alt="Your Avatar"
                        width={32}
                        height={32}
                        className="rounded-full"
                        unoptimized
                      />
                      <div className="flex-1 relative">
                        <input
                          type="text"
                          placeholder="Viết bình luận..."
                          value={commentInputs[post.id] || ""}
                          onChange={(e) =>
                            handleCommentChange(post.id, e.target.value)
                          }
                          onKeyPress={(e) =>
                            e.key === "Enter" && handleCommentSubmit(post.id)
                          }
                          className="w-full bg-gray-100 rounded-full px-4 py-2 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition duration-200"
                        />
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                          <button className="text-gray-400 hover:text-gray-600">
                            <FaSmile />
                          </button>
                          <button
                            onClick={() => handleCommentSubmit(post.id)}
                            className="text-blue-500 hover:text-blue-600"
                          >
                            <FaPaperPlane />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-8">
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl">
                Tải thêm bài viết
              </button>
            </div>
          </div>

          {/* Right Sidebar - Trending Events */}
          <div className="lg:col-span-3 space-y-4">
            {/* Trending Events */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-24">
              <h3 className="font-bold text-lg mb-4 flex items-center text-gray-900">
                <FaFire className="mr-2 text-orange-500" />
                Sự kiện HOT
              </h3>
              <div className="space-y-4">
                {trendingEvents.map((event) => (
                  <div
                    key={event.id}
                    className="group cursor-pointer hover:bg-gray-50 p-3 rounded-xl transition-all duration-200"
                  >
                    <div className="relative h-32 rounded-lg overflow-hidden mb-3">
                      <Image
                        src={
                          event.image ||
                          "https://via.placeholder.com/800x600/3b82f6/ffffff?text=Event"
                        }
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white font-semibold text-sm line-clamp-2">
                          {event.title}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <FaUsers className="text-blue-500" />
                        <span className="font-medium">
                          {event.participants}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1 text-gray-600">
                        <FaCalendarAlt className="text-green-500" />
                        <span className="text-xs">{event.date}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <button className="w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md">
                Xem tất cả
              </button>
            </div>

            {/* Tips Card */}
            <div className="bg-gradient-to-br from-green-400 to-blue-500 rounded-2xl shadow-lg p-6 text-white">
              <h3 className="font-bold text-lg mb-3">💡 Mẹo hữu ích</h3>
              <p className="text-sm text-white/90 leading-relaxed">
                Tham gia nhiều sự kiện để tích điểm và nhận huy hiệu đặc biệt.
                Chia sẻ kinh nghiệm để truyền cảm hứng cho người khác!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
