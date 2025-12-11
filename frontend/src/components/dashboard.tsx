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

export default function Dashboard() {
  const { user: currentUser } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [trendingEvents, setTrendingEvents] = useState<any[]>([]);
  const [commentInputs, setCommentInputs] = useState<{ [key: number]: string }>(
    {}
  );
  const [showComments, setShowComments] = useState<{ [key: number]: boolean }>(
    {}
  );
  const [comments, setComments] = useState<{ [key: number]: any[] }>({});
  const [loadingComments, setLoadingComments] = useState<{
    [key: number]: boolean;
  }>({});
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [newPostContent, setNewPostContent] = useState("");
  const [newPostImage, setNewPostImage] = useState("");
  const [isSubmittingPost, setIsSubmittingPost] = useState(false);

  const token =
    typeof window !== "undefined" ? localStorage.getItem("jwt_token") : null;

  // Fetch hot events (top events with most likes in last 7 days)
  const fetchTrendingEvents = async () => {
    try {
      const response = await authFetch("/api/events/getTrendingEvents?limit=5");
      if (response.ok) {
        const data = await response.json();
        console.log("🔥 Trending events:", data);
        if (data.events && Array.isArray(data.events)) {
          setTrendingEvents(data.events);
        }
      }
    } catch (error) {
      console.error("Error fetching trending events:", error);
    }
  };

  // Debug: Log state changes
  useEffect(() => {
    console.log("🟡 State updated - showComments:", showComments);
    console.log("🟡 State updated - comments:", comments);
    console.log("🟡 State updated - loadingComments:", loadingComments);
  }, [showComments, comments, loadingComments]);

  async function fetchPosts(lastId?: number, limit: number = 10) {
    try {
      if (lastId) setLoadingMore(true);
      else setLoading(true);

      const res = await authFetch("/api/posts/getAllPosts", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ last_id: lastId || null, limit: limit }),
      });

      if (!res.ok) {
        console.error("Failed to fetch posts", res.status);
        return;
      }

      const data = await res.json();
      const fetched = data.posts || data;

      console.log("Fetched posts:", fetched);

      if (Array.isArray(fetched)) {
        const normalized = fetched.map((p: any) => {
          const isLikedVal =
            typeof p.isLiked !== "undefined"
              ? Number(p.isLiked)
              : typeof p.isliked !== "undefined"
              ? Number(p.isliked)
              : typeof p.liked !== "undefined"
              ? Number(p.liked)
              : 0;

          return {
            ...p,
            isLiked: isLikedVal,
            isliked: isLikedVal,
            likes: Number(p.likes || 0),
            comments: Number(p.comments || 0),
          };
        });

        if (lastId) {
          setPosts((prev) => [...prev, ...normalized]);
        } else {
          setPosts(normalized);
        }

        if (normalized.length < limit) {
          setHasMore(false);
        } else {
          setHasMore(true);
        }
      }
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  const handleLike = async (postId: number) => {
    const previousPosts = posts;
    const prev = previousPosts.find((p) => p.id === postId);
    const wasLiked = prev ? Number(prev.isLiked ?? prev.isliked ?? 0) : 0;
    const newLiked = wasLiked === 1 ? 0 : 1;

    const updatedPosts = posts.map((post) =>
      post.id === postId
        ? {
            ...post,
            isLiked: newLiked,
            isliked: newLiked,
            likes:
              newLiked === 1
                ? Number(post.likes || 0) + 1
                : Number(post.likes || 0) - 1,
          }
        : post
    );

    setPosts(updatedPosts);

    try {
      const wasLikedNumeric = Number(
        previousPosts.find((p) => p.id === postId)?.isLiked ??
          previousPosts.find((p) => p.id === postId)?.isliked ??
          0
      );

      const endpoint =
        wasLikedNumeric === 1
          ? `/api/likes/unlike/${postId}`
          : `/api/likes/like/${postId}`;

      const res = await authFetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId,
          total_likes: updatedPosts.find((p) => p.id === postId)?.likes || 0,
        }),
      });

      if (!res.ok) {
        console.error("Like request failed", await res.text());
        setPosts(previousPosts);
      } else {
        try {
          const data = await res.json();
          if (data.post) {
            setPosts((cur) =>
              cur.map((p) => (p.id === data.post.id ? data.post : p))
            );
          }
        } catch (err) {
          // ignore
        }
      }
    } catch (error) {
      console.error("Network error when liking post:", error);
      setPosts(previousPosts);
    }
  };

  const handleCommentChange = (postId: number, value: string) => {
    setCommentInputs((prev) => ({ ...prev, [postId]: value }));
  };

  const fetchCommentsForPost = async (postId: number) => {
    console.log("🟢 fetchCommentsForPost started for postId:", postId);
    console.log("🟢 loadingComments[postId]:", loadingComments[postId]);

    if (loadingComments[postId]) {
      console.log("⚠️ Already loading comments, returning early");
      return;
    }

    setLoadingComments((prev) => ({ ...prev, [postId]: true }));
    console.log("🟢 Set loading to true, making API call...");

    try {
      const res = await authFetch(`/api/posts/getCommentsOfPost/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      console.log("🟢 API response status:", res.status);

      const data = await res.json();
      console.log("🟢 API response data:", data);

      if (data.comments) {
        console.log("🟢 Setting comments, count:", data.comments.length);
        setComments((prev) => ({ ...prev, [postId]: data.comments }));
      } else {
        console.log("⚠️ No comments field in response");
      }
    } catch (error) {
      console.error("❌ Error fetching comments:", error);
    } finally {
      setLoadingComments((prev) => ({ ...prev, [postId]: false }));
      console.log("🟢 Set loading to false");
    }
  };

  const handleCommentSubmit = async (postId: number) => {
    if (!commentInputs[postId]?.trim()) return;

    const commentText = commentInputs[postId].trim();
    const tempId = `temp-${Date.now()}`;

    // Optimistic UI update
    setComments((prev) => ({
      ...prev,
      [postId]: [
        ...(prev[postId] || []),
        {
          id: tempId,
          content: commentText,
          author: {
            username: currentUser?.username || "Bạn",
            image: currentUser?.image || null,
            role: currentUser?.role || "user",
          },
          userName: currentUser?.username || "Bạn",
          created_at: new Date().toISOString(),
          replies: [],
        },
      ],
    }));

    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p
      )
    );

    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));

    try {
      const res = await authFetch("/api/posts/addCommentOfPost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          postId: postId,
          content: commentText,
        }),
      });

      if (!res.ok) {
        console.error("Failed to save comment");
        // Revert optimistic update
        setComments((prev) => ({
          ...prev,
          [postId]: (prev[postId] || []).filter((c) => c.id !== tempId),
        }));
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, comments: Math.max(0, (p.comments || 1) - 1) }
              : p
          )
        );
        setCommentInputs((prev) => ({ ...prev, [postId]: commentText }));
        alert("Không thể lưu bình luận. Vui lòng thử lại!");
      } else {
        // Refresh comments to get server version with proper ID
        fetchCommentsForPost(postId);
      }
    } catch (error) {
      console.error("Error saving comment:", error);
      // Revert optimistic update
      setComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((c) => c.id !== tempId),
      }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments: Math.max(0, (p.comments || 1) - 1) }
            : p
        )
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: commentText }));
      alert("Lỗi kết nối. Vui lòng thử lại!");
    }
  };

  const toggleComments = (postId: number) => {
    console.log("🔵 toggleComments called for postId:", postId);
    const willShow = !showComments[postId];
    console.log(
      "🔵 willShow:",
      willShow,
      "current showComments state:",
      showComments[postId]
    );
    setShowComments((prev) => ({ ...prev, [postId]: willShow }));

    if (willShow) {
      console.log("🔵 Calling fetchCommentsForPost for postId:", postId);
      fetchCommentsForPost(postId);
    }
  };

  const handleCreatePost = async () => {
    if (!newPostContent.trim()) {
      alert("Vui lòng nhập nội dung bài viết!");
      return;
    }

    setIsSubmittingPost(true);

    try {
      const res = await authFetch("/api/posts/createPost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          content: newPostContent,
          image: newPostImage || null,
          title: "",
          status: true,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Failed to create post", res.status, text);
        alert("Không thể tạo bài viết. Vui lòng thử lại!");
        return;
      }

      const data = await res.json();
      console.log("Post created:", data);

      // Add new post to the top of the feed
      if (data.post) {
        setPosts((prev) => [
          {
            ...data.post,
            likes: 0,
            comments: 0,
            isliked: 0,
            user: currentUser,
            created_at: new Date().toISOString(),
          },
          ...prev,
        ]);
      }

      // Clear form
      setNewPostContent("");
      setNewPostImage("");
      alert("Đăng bài thành công! 🎉");
    } catch (error) {
      console.error("Error creating post:", error);
      alert("Lỗi kết nối. Vui lòng thử lại!");
    } finally {
      setIsSubmittingPost(false);
    }
  };

  const formatTime = (timestamp: string) => {
    return timestamp;
  };

  useEffect(() => {
    fetchPosts();
    fetchTrendingEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Main Content */}
      <div className="max-w-[1600px] mx-auto px-2 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
          {/* Left Sidebar - Quick Actions */}
          <div className="hidden lg:block lg:col-span-2">
            <div className="space-y-4 sticky top-24">
              {/* Welcome Card (sticky) */}
              <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-xl font-bold mb-2">
                  Chào mừng trở lại! 👋
                </h3>
                <p className="text-white/90 text-sm">
                  Hãy tham gia sự kiện mới và tích điểm nhé!
                </p>
              </div>

              {/* Duplicate Welcome Card */}
              <div className="bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl shadow-lg p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Nhắc nhở nhanh</h3>
                <p className="text-white/90 text-sm">
                  Kiểm tra lịch sự kiện của bạn và mời bạn bè tham gia.
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
                    <span className="text-2xl font-bold text-green-600">
                      15
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl">
                    <div className="flex items-center space-x-3">
                      <FaUsers className="text-blue-500 text-xl" />
                      <span className="text-gray-700 font-medium">Giờ TNV</span>
                    </div>
                    <span className="text-2xl font-bold text-blue-600">
                      48h
                    </span>
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
          </div>

          {/* Main Feed - Center Column */}
          <div className="lg:col-span-8 space-y-6">
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
                    value={newPostContent}
                    onChange={(e) => setNewPostContent(e.target.value)}
                    className="w-full p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
                    rows={3}
                  />
                  <input
                    id="imageUrlInput"
                    type="text"
                    placeholder="🖼️ URL hình ảnh (không bắt buộc)"
                    value={newPostImage}
                    onChange={(e) => setNewPostImage(e.target.value)}
                    className="w-full mt-2 p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent text-sm"
                  />
                  {newPostImage && (
                    <div className="mt-2 relative">
                      <Image
                        src={newPostImage}
                        alt="Preview"
                        width={200}
                        height={150}
                        className="rounded-lg object-cover"
                        unoptimized
                        onError={() => setNewPostImage("")}
                      />
                      <button
                        onClick={() => setNewPostImage("")}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        className="p-2 hover:bg-green-50 rounded-lg transition-colors"
                        onClick={() =>
                          document.getElementById("imageUrlInput")?.focus()
                        }
                        title="Thêm hình ảnh"
                      >
                        <FaImage className="text-green-600 text-xl" />
                      </button>
                      <button
                        type="button"
                        className="p-2 hover:bg-yellow-50 rounded-lg transition-colors"
                        title="Emoji"
                      >
                        <FaSmile className="text-yellow-500 text-xl" />
                      </button>
                    </div>
                    <button
                      onClick={handleCreatePost}
                      disabled={isSubmittingPost || !newPostContent.trim()}
                      className={`px-6 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 ${
                        isSubmittingPost || !newPostContent.trim()
                          ? "opacity-50 cursor-not-allowed"
                          : ""
                      }`}
                    >
                      {isSubmittingPost ? "Đang đăng..." : "Đăng bài"}
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
                        <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-xl ring-2 ring-blue-100">
                          <Image
                            src={post.avatar || "/default-profile.png"}
                            alt={post.name || "User"}
                            width={56}
                            height={56}
                            className="rounded-full object-cover"
                            unoptimized
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-900 text-lg">
                          {post.name || "Người dùng"}
                        </h3>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <span className="bg-blue-100 text-blue-600 px-2 py-1 rounded-full text-xs font-medium">
                            {post.role || "Tình nguyện viên"}
                          </span>
                          <span>•</span>
                          <span>
                            {post.created_at
                              ? new Date(post.created_at).toLocaleDateString(
                                  "vi-VN"
                                )
                              : "Vừa xong"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600 p-3 rounded-full hover:bg-gray-100 transition-all duration-200">
                      <FaEllipsisH />
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="px-6 pb-4">
                    <p className="text-gray-800 leading-relaxed">
                      {post.content}
                    </p>
                  </div>

                  {/* Post Image */}
                  {post.image && (
                    <div className="relative w-full h-96">
                      <Image
                        src={post.image}
                        alt={post.title || "Post image"}
                        fill
                        className="object-cover"
                        unoptimized
                      />
                    </div>
                  )}

                  {/* Post Title (if exists) */}
                  {post.title && (
                    <div className="px-6 pt-4">
                      <h4 className="font-bold text-xl text-gray-900">
                        {post.title}
                      </h4>
                    </div>
                  )}

                  {/* Event Info (if event_id exists) */}
                  {post.event && (
                    <div className="mx-6 my-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-xl border border-blue-200 p-4">
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center space-x-2 text-blue-700">
                          <FaCalendarAlt className="text-blue-500" />
                          <span className="font-semibold">
                            Sự kiện: {post.event.name}
                          </span>
                        </div>
                        {post.address && (
                          <div className="flex items-center space-x-2 text-gray-700">
                            <FaMapMarkerAlt className="text-red-500" />
                            <span>{post.address}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Engagement Stats */}
                  <div className="px-6 py-3 border-t border-gray-100">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center font-medium text-gray-600">
                          <FaHeart className="text-red-500 mr-1.5" />
                          <span
                            className={
                              post.likes > 0 ? "text-red-600" : "text-gray-500"
                            }
                          >
                            {post.likes || 0}
                          </span>
                        </span>
                        <span
                          className={`font-medium ${
                            post.comments > 0
                              ? "text-blue-600"
                              : "text-gray-500"
                          }`}
                        >
                          {post.comments || 0} bình luận
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="px-6 py-2 border-t border-gray-100">
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center justify-center space-x-2 py-3 rounded-xl transition duration-200 font-semibold ${
                          post.isliked == 1
                            ? "text-red-500 bg-red-50 hover:bg-red-100"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {post.isliked == 1 ? <FaHeart /> : <FaRegHeart />}
                        <span className="font-medium">Thích</span>
                      </button>
                      <button
                        onClick={() => toggleComments(post.id)}
                        className={`flex items-center justify-center space-x-2 py-3 rounded-xl transition duration-200 font-semibold ${
                          showComments[post.id]
                            ? "text-blue-500 bg-blue-50 hover:bg-blue-100"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        <FaComment />
                        <span className="font-medium">Bình luận</span>
                      </button>
                      <button
                        className="flex items-center justify-center space-x-2 py-3 text-gray-400 bg-gray-50 rounded-xl cursor-not-allowed"
                        disabled
                      >
                        <FaShare />
                        <span className="font-medium">Chia sẻ</span>
                      </button>
                    </div>
                  </div>

                  {/* Comment Section */}
                  {showComments[post.id] && (
                    <div className="px-6 pb-4 border-t border-gray-100">
                      {/* Existing Comments */}
                      {loadingComments[post.id] ? (
                        <div className="py-4 text-center text-gray-500">
                          <div className="animate-pulse">
                            Đang tải bình luận...
                          </div>
                        </div>
                      ) : comments[post.id] && comments[post.id].length > 0 ? (
                        <div className="space-y-3 mt-4 mb-4 max-h-96 overflow-y-auto">
                          {comments[post.id].map(
                            (comment: any, idx: number) => (
                              <div
                                key={comment.id || idx}
                                className="flex space-x-3"
                              >
                                <Image
                                  src={
                                    comment.author?.image ||
                                    "/default-profile.png"
                                  }
                                  alt={
                                    comment.author?.username ||
                                    comment.userName ||
                                    "User"
                                  }
                                  width={36}
                                  height={36}
                                  className="w-9 h-9 rounded-full object-cover"
                                  unoptimized
                                />
                                <div className="flex-1">
                                  <div className="bg-gray-100 rounded-2xl px-4 py-2">
                                    <p className="font-semibold text-sm text-gray-900">
                                      {comment.author?.username ||
                                        comment.userName ||
                                        "Người dùng"}
                                    </p>
                                    <p className="text-sm text-gray-800">
                                      {comment.content}
                                    </p>
                                  </div>
                                  <div className="flex items-center space-x-4 mt-1 px-4 text-xs text-gray-500">
                                    <span>
                                      {comment.created_at
                                        ? new Date(
                                            comment.created_at
                                          ).toLocaleDateString("vi-VN")
                                        : "Vừa xong"}
                                    </span>
                                    <button className="hover:underline font-medium text-gray-600 hover:text-blue-600">
                                      Thích
                                    </button>
                                    <button className="hover:underline font-medium text-gray-600 hover:text-blue-600">
                                      Trả lời
                                    </button>
                                    {comment.replies &&
                                      comment.replies.length > 0 && (
                                        <span className="text-blue-600 font-medium">
                                          {comment.replies.length} phản hồi
                                        </span>
                                      )}
                                  </div>
                                </div>
                              </div>
                            )
                          )}
                        </div>
                      ) : (
                        <div className="py-4 text-center text-gray-500">
                          <p className="text-sm">
                            Chưa có bình luận nào. Hãy là người đầu tiên bình
                            luận! 💬
                          </p>
                        </div>
                      )}

                      {/* Add Comment Input */}
                      <div className="flex items-center space-x-3 mt-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
                          {currentUser?.username?.charAt(0).toUpperCase() ||
                            "U"}
                        </div>
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
                            className="w-full bg-gray-100 rounded-full px-4 py-3 pr-20 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition duration-200"
                          />
                          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                            <button className="text-gray-400 hover:text-yellow-500 transition-colors">
                              <FaSmile />
                            </button>
                            <button
                              onClick={() => handleCommentSubmit(post.id)}
                              className="text-blue-500 hover:text-blue-600 transition-colors"
                            >
                              <FaPaperPlane />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Load More Button */}
            <div className="text-center mt-8">
              {hasMore ? (
                <button
                  onClick={() => {
                    const lastId = posts.length
                      ? posts[posts.length - 1].id
                      : undefined;
                    fetchPosts(lastId, 10);
                  }}
                  disabled={loadingMore}
                  className={`bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-10 rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl ${
                    loadingMore ? "opacity-60 cursor-wait" : ""
                  }`}
                >
                  {loadingMore ? "Đang tải..." : "Tải thêm bài viết"}
                </button>
              ) : (
                <div className="text-gray-500 font-medium">
                  Không còn bài viết nào
                </div>
              )}
            </div>
          </div>

          {/* Right Sidebar - Hot Events */}
          <div className="hidden lg:block lg:col-span-2 space-y-4 lg:-mr-6">
            {/* Trending Posts */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 sticky top-24 lg:pr-0">
              <h3 className="font-bold text-lg mb-4 flex items-center text-gray-900">
                <FaFire className="mr-2 text-orange-500" />
                Sự kiện HOT 🔥
              </h3>
              <div className="space-y-4">
                {trendingEvents.length > 0 ? (
                  trendingEvents.map((ev: any) => (
                    <div
                      key={ev.id}
                      className="group cursor-pointer hover:bg-gray-50 p-3 rounded-xl transition-all duration-200"
                    >
                      <div className="mb-2">
                        <p className="font-semibold text-gray-900 text-sm line-clamp-2">
                          {ev.title}
                        </p>
                        <p className="text-gray-600 text-xs line-clamp-2 mt-1">
                          {ev.content}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1 text-red-600">
                          <FaHeart className="text-red-500" />
                          <span className="font-bold">{ev.likes || 0}</span>
                        </div>
                        <div className="flex items-center space-x-1 text-gray-600">
                          <FaMapMarkerAlt className="text-blue-500" />
                          <span className="text-xs">{ev.address || "-"}</span>
                        </div>
                      </div>
                      <div className="mt-2 text-xs text-gray-500">
                        {ev.author?.username ||
                          ev.author?.name ||
                          "Người tổ chức"}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-gray-500 py-4">
                    <p className="text-sm">Chưa có sự kiện nổi bật</p>
                  </div>
                )}
              </div>
              <Link
                href="/user/events"
                className="block w-full mt-4 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white font-bold py-3 rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md text-center"
              >
                Xem tất cả
              </Link>
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
