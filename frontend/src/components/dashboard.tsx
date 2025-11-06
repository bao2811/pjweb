"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
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
} from "react-icons/fa";

// Mock data for volunteer events
// const mockPosts = [
//   {
//     id: 1,
//     author: {
//       name: "Nguyễn Văn An",
//       avatar:
//         "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
//       role: "Tình nguyện viên",
//     },
//     timestamp: "2 giờ trước",
//     content:
//       "🌱 Cùng nhau trồng cây xanh tại Công viên Tao Đàn! Hãy tham gia với chúng mình để góp phần làm xanh thành phố. Mỗi cái cây nhỏ hôm nay sẽ là tấm bóng mát cho tương lai! 🌳",
//     event: {
//       title: "Trồng cây xanh - Vì môi trường sạch",
//       date: "15/10/2025",
//       time: "7:00 - 11:00",
//       location: "Công viên Tao Đàn, Q.1",
//       participants: 45,
//       maxParticipants: 100,
//     },
//     image:
//       "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop",
//     likes: 128,
//     comments: 23,
//     shares: 12,
//     isLiked: false,
//   },
//   {
//     id: 2,
//     author: {
//       name: "Trần Thị Bình",
//       avatar:
//         "https://images.unsplash.com/photo-1494790108755-2616b2e4a0ee?w=150&h=150&fit=crop&crop=face",
//       role: "Trưởng nhóm",
//     },
//     timestamp: "5 giờ trước",
//     content:
//       "📚 Chương trình dạy học miễn phí cho trẻ em vùng cao đang cần thêm tình nguyện viên! Nếu bạn có kiến thức và tình yêu với trẻ em, hãy tham gia cùng chúng mình nhé! ❤️",
//     event: {
//       title: "Dạy học cho trẻ em vùng cao",
//       date: "20-22/10/2025",
//       time: "Cả ngày",
//       location: "Sapa, Lào Cai",
//       participants: 12,
//       maxParticipants: 20,
//     },
//     image:
//       "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop",
//     likes: 89,
//     comments: 15,
//     shares: 8,
//     isLiked: true,
//   },
//   {
//     id: 3,
//     author: {
//       name: "Lê Minh Châu",
//       avatar:
//         "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
//       role: "Tình nguyện viên",
//     },
//     timestamp: "1 ngày trước",
//     content:
//       "🍲 Nấu cơm từ thiện cho người vô gia cư! Cùng nhau mang đến những bữa ăn ấm áp và tình người đến với những hoàn cảnh khó khăn trong thành phố. Mọi người hãy tham gia nhé! 🤝",
//     event: {
//       title: "Nấu cơm từ thiện cuối tuần",
//       date: "14/10/2025",
//       time: "16:00 - 20:00",
//       location: "Chùa Vĩnh Nghiêm, Q.3",
//       participants: 67,
//       maxParticipants: 80,
//     },
//     image:
//       "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop",
//     likes: 156,
//     comments: 31,
//     shares: 19,
//     isLiked: false,
//   },
// ];

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

  const [loading, setLoading] = useState(false);

  async function fetchPosts() {
    const res = await fetch("http://localhost:8000/api/posts/getAllPosts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: 4 }),
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

  const handleLike = async (postId: number) => {
    // Optimistic update: toggle like locally
    const previousPosts = posts;
    const updatedPosts = posts.map((post) =>
      post.id === postId
        ? {
            ...post,
            isLiked: !post.isLiked,
            likes: post.isLiked ? post.likes - 1 : post.likes + 1,
          }
        : post
    );

    setPosts(updatedPosts);

    try {
      const res = await fetch("http://localhost:8000/api/posts/likePost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ postId }),
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
    if (loadingComments[postId] || comments[postId]) return; // Skip if already loading or loaded

    setLoadingComments((prev) => ({ ...prev, [postId]: true }));
    try {
      const res = await fetch(
        `http://localhost:8000/api/posts/getCommentsOfPost/${postId}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
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

    // Create new comment object from frontend data
    const newComment = {
      id: Date.now(), // Use timestamp as unique ID
      postId: postId,
      userId: 4, // TODO: Replace with actual logged-in user ID
      userName: "Bạn", // TODO: Replace with actual user name from auth
      userImage:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face", // TODO: Replace with actual user avatar
      content: commentInputs[postId].trim(),
      created_at: new Date().toISOString(),
    };

    // Add comment to UI immediately
    setComments((prev) => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment],
    }));

    // Update comment count in post
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: p.comments + 1 } : p
      )
    );

    // Store comment text for potential rollback
    const commentText = commentInputs[postId];

    // Clear input immediately
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));

    // Send to backend in background (only for saving to database)
    try {
      // const res = await fetch(
      //   "http://localhost:8000/api/posts/addCommentOfPost",
      //   {
      //     method: "POST",
      //     headers: {
      //       "Content-Type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       postId: postId,
      //       userId: 4, // TODO: Replace with actual logged-in user ID
      //       content: commentText,
      //     }),
      //   }
      // );

      if (0) {
        // Backend save failed - revert the UI changes
        console.error("Failed to save comment to backend");
        setComments((prev) => ({
          ...prev,
          [postId]: (prev[postId] || []).filter((c) => c.id !== newComment.id),
        }));
        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId ? { ...p, comments: p.comments - 1 } : p
          )
        );
        // Restore input so user can try again
        setCommentInputs((prev) => ({ ...prev, [postId]: commentText }));
        alert("Không thể lưu bình luận. Vui lòng thử lại!");
      }
      // If successful, do nothing - comment already in UI
    } catch (error) {
      console.error("Error saving comment:", error);
      // Network error - revert the UI changes
      setComments((prev) => ({
        ...prev,
        [postId]: (prev[postId] || []).filter((c) => c.id !== newComment.id),
      }));
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: p.comments - 1 } : p
        )
      );
      setCommentInputs((prev) => ({ ...prev, [postId]: commentText }));
      alert("Lỗi kết nối. Vui lòng thử lại!");
    }
  };

  const toggleComments = (postId: number) => {
    const willShow = !showComments[postId];
    setShowComments((prev) => ({ ...prev, [postId]: willShow }));

    // Fetch comments when opening
    if (willShow && !comments[postId]) {
      fetchCommentsForPost(postId);
    }
  };

  const formatTime = (timestamp: string) => {
    return timestamp;
  };

  useEffect(() => {
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
        {/* Create Post Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="p-4">
            <div className="flex items-center space-x-4">
              <Image
                src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face"
                alt="Your Avatar"
                width={40}
                height={40}
                className="rounded-full"
                unoptimized
              />
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Chia sẻ hoạt động tình nguyện của bạn..."
                  className="w-full bg-gray-100 rounded-full px-4 py-3 text-gray-700 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition duration-200"
                />
              </div>
            </div>
            <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
              <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition duration-200">
                <FaImage className="text-green-500" />
                <span>Ảnh/Video</span>
              </button>
              <button className="flex items-center space-x-2 text-gray-600 hover:bg-gray-100 px-4 py-2 rounded-lg transition duration-200">
                <FaCalendarAlt className="text-blue-500" />
                <span>Sự kiện</span>
              </button>
            </div>
          </div>
        </div>

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
                  <Image
                    src={post.image}
                    alt={post.name || "Post image"}
                    width={50}
                    height={50}
                    className="rounded-full"
                    unoptimized
                  />
                  <div>
                    <h3 className="font-semibold text-gray-900">{post.name}</h3>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{post.role}</span>
                      <span>•</span>
                      <span>{formatTime(post.timestamp)}</span>
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

              {/* Event Info Card */}
              <div className="mx-4 mb-4 bg-gray-50 rounded-lg border border-gray-200 overflow-hidden">
                <div className="relative h-48">
                  <Image
                    src={post.image}
                    alt={post.title || "Post image"}
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
                  <button className="flex items-center justify-center space-x-2 py-3 text-gray-600 hover:bg-gray-100 rounded-lg transition duration-200">
                    <FaShare />
                    <span className="font-medium">Chia sẻ</span>
                  </button>
                </div>
              </div>

              {/* Comment Section */}
              {showComments[post.id] && (
                <div className="px-4 pb-4 border-t border-gray-100">
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
          <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-3 px-8 rounded-full transition duration-200 transform hover:scale-105 shadow-lg">
            Tải thêm bài viết
          </button>
        </div>
      </div>
    </div>
  );
}
