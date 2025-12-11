"use client";
import { useState, useEffect, useRef } from "react";
import { authFetch, decodeToken } from "@/utils/auth";
import Image from "next/image";
import CreatePost from "@/components/CreatePost";
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
  FaPlus,
} from "react-icons/fa";

export default function Dashboard() {
  const [posts, setPosts] = useState<any[]>([]);
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
  const commentSectionRefs = useRef<{ [key: number]: HTMLDivElement | null }>(
    {}
  );

  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  const token = localStorage.getItem("jwt_token") || null;

  // Decode current user from token
  useEffect(() => {
    if (token) {
      try {
        const payload = decodeToken(token);
        setCurrentUser(payload);
      } catch (e) {
        console.error("Failed to decode token:", e);
      }
    }
  }, [token]);

  // Fetch posts from backend. Uses cursor-based pagination by index (id) instead of offset.
  // Server should accept { last_id?: number, limit?: number } and return next N posts where id < last_id.
  // SQL example (MySQL/Postgres):
  // SELECT * FROM posts WHERE id < :last_id ORDER BY id DESC LIMIT :limit;
  // For initial load, omit last_id and return newest posts: ORDER BY id DESC LIMIT :limit
  async function fetchPosts(lastId?: number, limit: number = 20) {
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
        // Normalize each post so the UI expects `isLiked` (0/1) and `likes`/`comments` fields
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
            // provide both camelCase and lowercase variants used across the app
            isLiked: isLikedVal,
            isliked: isLikedVal,
            // backend uses `like` and `comment` (singular) not `likes` and `comments`
            likes: Number(p.like || 0),
            comments: Number(p.comment || 0),
          };
        });

        if (lastId) {
          // Append
          setPosts((prev) => [...prev, ...normalized]);
        } else {
          // Initial load / refresh
          setPosts(normalized);
        }

        // If fewer than limit returned, no more posts
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

  // Initial load is handled in useEffect to avoid duplicate calls

  const handleLike = async (postId: number) => {
    // Optimistic update: toggle like locally (use numeric 0/1 and set both variants)
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
      // Decide which API to call based on previous state (wasLiked)
      const wasLikedNumeric = Number(
        previousPosts.find((p) => p.id === postId)?.isLiked ??
          previousPosts.find((p) => p.id === postId)?.isliked ??
          0
      );

      // If it was liked, we need to call the unlike endpoint; otherwise call like
      const endpoint =
        wasLikedNumeric === 1
          ? `/api/likes/unlike/${postId}`
          : `/api/likes/like/${postId}`;

      // Use authFetch to automatically include JWT token
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
        // Revert optimistic update on failure
        console.error("Like request failed", await res.text());
        setPosts(previousPosts);
      } else {
        // Optionally sync with server response (if server returns updated post)
        try {
          const data = await res.json();
          if (data.post) {
            setPosts((cur) =>
              cur.map((p) => (p.id === data.post.id ? data.post : p))
            );
          }
        } catch (err) {
          // If parsing fails, ignore — we already applied optimistic update
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
    if (loadingComments[postId]) return; // Skip if already loading

    setLoadingComments((prev) => ({ ...prev, [postId]: true }));
    try {
      const res = await authFetch(`/api/posts/getCommentsOfPost/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.comments) {
        setComments((prev) => ({ ...prev, [postId]: data.comments }));
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoadingComments((prev) => ({ ...prev, [postId]: false }));
    }
  };

  const handleCommentSubmit = async (postId: number) => {
    if (!commentInputs[postId]?.trim()) return;

    const commentText = commentInputs[postId].trim();

    // Try to extract user info from token for optimistic UI
    let userId: any = null;
    let userName = "Bạn";
    let userImage =
      "data:image/png;base64,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";

    try {
      const payload = token ? decodeToken(token) : null;
      if (payload) {
        userId = payload.sub || payload.id || null;
        userName =
          payload.username || payload.name || payload.email || userName;
        if (payload.image) userImage = payload.image;
      }
    } catch (e) {
      // ignore decode errors, we'll still allow anonymous optimistic comment
    }

    const tempId = `temp-${Date.now()}`;

    const newComment: any = {
      id: tempId, // temporary id until backend returns real id
      postId: postId,
      userId: userId,
      userName: userName,
      userImage: userImage,
      content: commentText,
      created_at: new Date().toISOString(),
      _optimistic: true,
    };

    // Add comment to UI immediately (optimistic)
    setComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
    }));

    // Update comment count in post
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: (p.comments || 0) + 1 } : p
      )
    );

    // Clear input immediately
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));

    // Send to backend
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
        const text = await res.text();
        console.error("Failed to save comment to backend", res.status, text);
        // revert optimistic UI
        setComments((prev) => ({
          ...prev,
          [postId]: (prev[postId] || []).filter((c) => c.id !== tempId),
        }));
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, comments: (p.comments || 1) - 1 } : p
          )
        );
        setCommentInputs((prev) => ({ ...prev, [postId]: commentText }));
        alert("Không thể lưu bình luận. Vui lòng thử lại!");
        return;
      }

      // parse response and replace optimistic comment with server one (if provided)
      try {
        const data = await res.json();
        const serverComment = data.comment;
        console.log("Server comment:", serverComment);
        if (serverComment) {
          setComments((prev) => ({
            ...prev,
            [postId]: (prev[postId] || []).map((c) =>
              c.id === tempId
                ? { ...c, ...serverComment, _optimistic: false }
                : c
            ),
          }));
        } else {
          // no server comment returned; just remove optimistic flag
          setComments((prev) => ({
            ...prev,
            [postId]: (prev[postId] || []).map((c) =>
              c.id === tempId ? { ...c, _optimistic: false } : c
            ),
          }));
        }
      } catch (err) {
        // ignore parse errors
      }
    } catch (error) {
      console.error("Error saving comment:", error);
      // Network error - revert the UI changes
      setComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((c) => c.id !== tempId),
      }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: (p.comments || 1) - 1 } : p
        )
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: commentText }));
      alert("Lỗi kết nối. Vui lòng thử lại!");
    }
  };

  const toggleComments = (postId: number) => {
    const willShow = !showComments[postId];
    setShowComments((prev) => ({ ...prev, [postId]: willShow }));

    // Fetch comments when opening (always fetch to show latest)
    if (willShow) {
      fetchCommentsForPost(postId);

      // Auto scroll to comment section after a brief delay for render
      setTimeout(() => {
        const commentSection = commentSectionRefs.current[postId];
        if (commentSection) {
          commentSection.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          });
        }
      }, 100);
    }
  };

  const formatTime = (timestamp: string) => {
    return timestamp;
  };

  // Guard to avoid double-fetch in React Strict Mode (dev) or duplicate mounts
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) return;
    hasFetchedRef.current = true;
    fetchPosts();
  }, []);

  return (
    <div className="min-h-screen ">
      {/* Header */}
      <div className="">
        {/* <div className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-10"></div> */}
        <div className="max-w-4xl mx-auto px-4 py-4 bg-white shadow-sm border-b border-gray-200 rounded-3xl">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <FaHeart className="text-red-500 mr-3" />
            Bảng tin tình nguyện
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Create Post Quick Access */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 mb-6 overflow-hidden">
          <div className="p-4">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg shadow-md">
                {currentUser?.username?.charAt(0).toUpperCase() || "U"}
              </div>
              <div className="flex-1">
                <button
                  onClick={() => setShowCreatePost(true)}
                  className="w-full bg-gray-100 hover:bg-gray-200 rounded-full px-6 py-3 text-gray-600 text-left transition duration-200 font-medium"
                >
                  Chia sẻ hoạt động tình nguyện của bạn...
                </button>
              </div>
            </div>
            <div className="flex items-center justify-around mt-4 pt-4 border-t border-gray-200">
              <button
                onClick={() => setShowCreatePost(true)}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition text-gray-700 font-medium"
              >
                <FaImage className="text-green-600 text-xl" />
                <span>Hình ảnh</span>
              </button>
              <button
                onClick={() => setShowCreatePost(true)}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition text-gray-700 font-medium"
              >
                <FaCalendarAlt className="text-blue-600 text-xl" />
                <span>Sự kiện</span>
              </button>
              <button
                onClick={() => setShowCreatePost(true)}
                className="flex items-center space-x-2 px-4 py-2 hover:bg-gray-100 rounded-lg transition text-gray-700 font-medium"
              >
                <FaUsers className="text-purple-600 text-xl" />
                <span>Nhóm</span>
              </button>
            </div>
          </div>
        </div>

        {/* Create Post Modal */}
        {showCreatePost && (
          <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="max-w-2xl w-full">
              <CreatePost
                currentUser={currentUser}
                onPostCreated={(newPost) => {
                  // Add new post to the top of the feed
                  setPosts((prev) => [
                    {
                      ...newPost,
                      likes: 0,
                      comments: 0,
                      isLiked: 0,
                      author: currentUser?.username || "Bạn",
                      author_image: currentUser?.image || "",
                      created_at: new Date().toISOString(),
                    },
                    ...prev,
                  ]);
                  setShowCreatePost(false);
                }}
                onClose={() => setShowCreatePost(false)}
              />
            </div>
          </div>
        )}

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div
              key={post.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200"
            >
              {/* Post Header */}
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                    {post.user?.username?.charAt(0).toUpperCase() || "U"}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      {post.user?.username || "Người dùng"}
                    </h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>
                        {post.created_at
                          ? new Date(post.created_at).toLocaleDateString(
                              "vi-VN"
                            )
                          : "Vừa xong"}
                      </span>
                      {post.status && (
                        <>
                          <span>•</span>
                          <span>Công khai</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100">
                  <FaEllipsisH />
                </button>
              </div>

              {/* Post Content */}
              <div className="px-4 pb-4">
                <p className="text-gray-800 leading-relaxed">{post.content}</p>
              </div>

              {/* Post Image */}
              {post.image && (
                <div
                  className="relative w-full"
                  style={{ paddingBottom: "56.25%" }}
                >
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
                <div className="px-4 pt-3">
                  <h4 className="font-bold text-lg text-gray-900">
                    {post.title}
                  </h4>
                </div>
              )}

              {/* Event Info (if event_id exists, show event details) */}
              {post.event && (
                <div className="mx-4 mb-4 bg-gray-50 rounded-lg border border-gray-200 p-4">
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-2">
                      <FaCalendarAlt className="text-blue-500" />
                      <span>Sự kiện: {post.event.name}</span>
                    </div>
                    {post.event.address && (
                      <div className="flex items-center space-x-2">
                        <FaMapMarkerAlt className="text-red-500" />
                        <span>{post.event.address}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Engagement Stats */}
              <div className="px-4 py-2 border-t border-gray-100">
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    {post.likes > 0 && (
                      <span className="flex items-center">
                        <FaHeart className="text-red-500 mr-1" />
                        {post.likes}
                      </span>
                    )}
                    {post.comments > 0 && (
                      <span>{post.comments} bình luận</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="px-4 py-2 border-t border-gray-100">
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center justify-center space-x-2 py-3 rounded-lg transition duration-200 ${
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
                    className={`flex items-center justify-center space-x-2 py-3 rounded-lg transition duration-200 ${
                      showComments[post.id]
                        ? "text-blue-500 bg-blue-50 hover:bg-blue-100"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <FaComment />
                    <span className="font-medium">Bình luận</span>
                  </button>
                  <button
                    className="flex items-center justify-center space-x-2 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition duration-200"
                    disabled
                  >
                    <FaShare />
                    <span className="font-medium">Chia sẻ</span>
                  </button>
                </div>
              </div>

              {/* Comment Section */}
              {showComments[post.id] && (
                <div
                  ref={(el) => {
                    commentSectionRefs.current[post.id] = el;
                  }}
                  className="px-4 pb-4 border-t border-gray-100"
                >
                  {/* Existing Comments */}
                  {loadingComments[post.id] ? (
                    <div className="py-4 text-center text-gray-500">
                      <div className="animate-pulse">Đang tải bình luận...</div>
                    </div>
                  ) : (
                    comments[post.id] &&
                    comments[post.id].length > 0 && (
                      <div className="space-y-3 mt-3 mb-4 max-h-96 overflow-y-auto">
                        {comments[post.id].map((comment: any, idx: number) => (
                          <div key={idx} className="flex space-x-3">
                            <Image
                              src={
                                comment.userImage ||
                                "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face"
                              }
                              alt={comment.userName || "User"}
                              width={32}
                              height={32}
                              className="rounded-full flex-shrink-0"
                              unoptimized
                            />
                            <div className="flex-1">
                              <div className="bg-gray-100 rounded-2xl px-4 py-2">
                                <p className="font-semibold text-sm text-gray-900">
                                  {comment.userName || "Người dùng"}
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
                                <button className="hover:underline font-medium">
                                  Thích
                                </button>
                                <button className="hover:underline font-medium">
                                  Trả lời
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )
                  )}

                  {/* Add Comment Input */}
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
                fetchPosts(lastId, 20);
              }}
              disabled={loadingMore}
              className={`bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-8 rounded-full transition duration-200 transform hover:scale-105 shadow-lg ${
                loadingMore ? "opacity-60 cursor-wait" : ""
              }`}
            >
              {loadingMore ? "Đang tải..." : "Tải thêm bài viết"}
            </button>
          ) : (
            <div className="text-gray-500">Không còn bài viết nào</div>
          )}
        </div>
      </div>
    </div>
  );
}
