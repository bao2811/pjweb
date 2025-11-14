"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
// import Navbar from "./navbar";
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

// Mock current user
const mockCurrentUser = {
  name: "Nguyễn Văn An",
  email: "nguyenvanan@example.com",
  avatar: "https://i.pravatar.cc/150?img=12",
  role: "user" as const,
  points: 1250,
};

// Mock data for volunteer events
const mockPosts = [
  {
    id: 1,
    author: {
      name: "Nguyễn Văn An",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      role: "Tình nguyện viên",
    },
    timestamp: "2 giờ trước",
    content:
      "🌱 Cùng nhau trồng cây xanh tại Công viên Tao Đàn! Hãy tham gia với chúng mình để góp phần làm xanh thành phố. Mỗi cái cây nhỏ hôm nay sẽ là tấm bóng mát cho tương lai! 🌳",
    event: {
      title: "Trồng cây xanh - Vì môi trường sạch",
      date: "15/10/2025",
      time: "7:00 - 11:00",
      location: "Công viên Tao Đàn, Q.1",
      participants: 45,
      maxParticipants: 100,
    },
    image:
      "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop",
    likes: 128,
    comments: 23,
    shares: 12,
    isLiked: false,
  },
  {
    id: 2,
    author: {
      name: "Trần Thị Bình",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b2e4a0ee?w=150&h=150&fit=crop&crop=face",
      role: "Trưởng nhóm",
    },
    timestamp: "5 giờ trước",
    content:
      "📚 Chương trình dạy học miễn phí cho trẻ em vùng cao đang cần thêm tình nguyện viên! Nếu bạn có kiến thức và tình yêu với trẻ em, hãy tham gia cùng chúng mình nhé! ❤️",
    event: {
      title: "Dạy học cho trẻ em vùng cao",
      date: "20-22/10/2025",
      time: "Cả ngày",
      location: "Sapa, Lào Cai",
      participants: 12,
      maxParticipants: 20,
    },
    image:
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop",
    likes: 89,
    comments: 15,
    shares: 8,
    isLiked: true,
  },
  {
    id: 3,
    author: {
      name: "Lê Minh Châu",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      role: "Tình nguyện viên",
    },
    timestamp: "1 ngày trước",
    content:
      "🍲 Nấu cơm từ thiện cho người vô gia cư! Cùng nhau mang đến những bữa ăn ấm áp và tình người đến với những hoàn cảnh khó khăn trong thành phố. Mọi người hãy tham gia nhé! 🤝",
    event: {
      title: "Nấu cơm từ thiện cuối tuần",
      date: "14/10/2025",
      time: "16:00 - 20:00",
      location: "Chùa Vĩnh Nghiêm, Q.3",
      participants: 67,
      maxParticipants: 80,
    },
    image:
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop",
    likes: 156,
    comments: 31,
    shares: 19,
    isLiked: false,
  },
];

// Mock trending events
const trendingEvents = [
  {
    id: 1,
    title: "Hiến máu nhân đạo",
    participants: 234,
    date: "18/11/2025",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop",
  },
  {
    id: 2,
    title: "Dọn rác bãi biển",
    participants: 189,
    date: "25/11/2025",
    image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&h=300&fit=crop",
  },
  {
    id: 3,
    title: "Xây nhà tình nghĩa",
    participants: 156,
    date: "02/12/2025",
    image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=400&h=300&fit=crop",
  },
];

export default function Dashboard() {
  const [posts, setPosts] = useState<any[]>([]);
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>(
    {}
  );
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      setCurrentUser(JSON.parse(userData));
    }
  }, []);

  async function fetchPosts() {
    const res = await fetch("http://localhost:8000/api/posts/getAllPosts", {
      headers: {
        Authorization: `Bearer ${currentUser?.token}`,
      },
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
              <p className="text-white/90 text-sm">Hãy tham gia sự kiện mới và tích điểm nhé!</p>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
              <h3 className="font-bold text-gray-800 mb-4">Thống kê nhanh</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <FaStar className="text-yellow-500 text-xl" />
                    <span className="text-gray-700 font-medium">Điểm</span>
                  </div>
                  <span className="text-2xl font-bold text-yellow-600">{currentUser?.points || 0}</span>
                </div>
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
                <Link href="/user/events" className="block w-full text-center py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all">
                  🔍 Tìm sự kiện
                </Link>
                <Link href="/user/eventsattended" className="block w-full text-center py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all">
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
                    {currentUser?.name?.charAt(0) || 'U'}
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
                          src={post.author.avatar}
                          alt={post.author.name}
                          width={56}
                          height={56}
                          className="rounded-full ring-2 ring-blue-100"
                          unoptimized
                        />
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {post.author.name}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">{post.author.role}</span>
                          <span>•</span>
                          <span>{formatTime(post.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 p-3 rounded-full hover:bg-gray-100 transition-all duration-200">
                      <FaEllipsisH />
                    </button>
                  </div>

              {/* Post Content */}
              <div className="px-4 pb-4">
                <p className="text-gray-800 leading-relaxed">{post.content}</p>
              </div>

              {/* Event Info Card */}
              <div className="mx-4 mb-4 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={post.image}
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
                          {post.participants}/{post.maxParticipants} người tham
                          gia
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
                        src={event.image}
                        alt={event.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-300"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                      <div className="absolute bottom-2 left-2 right-2">
                        <p className="text-white font-semibold text-sm line-clamp-2">{event.title}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-1 text-gray-600">
                        <FaUsers className="text-blue-500" />
                        <span className="font-medium">{event.participants}</span>
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
                Tham gia nhiều sự kiện để tích điểm và nhận huy hiệu đặc biệt. Chia sẻ kinh nghiệm để truyền cảm hứng cho người khác!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
