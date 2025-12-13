"use client";
import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  FaHeart,
  FaComment,
  FaShare,
  FaRegHeart,
  FaPaperPlane,
  FaEllipsisV,
  FaImage,
  FaSmile,
  FaTimes,
  FaHashtag,
  FaUsers,
  FaPaperclip,
  FaComments,
  FaClock,
  FaFileAlt,
  FaDownload,
  FaFilter,
  FaArrowLeft,
  FaPlus,
  FaFire,
  FaThumbtack,
  FaMedal,
} from "react-icons/fa";
import { authFetch } from "@/utils/auth";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface User {
  id: number;
  name: string;
  avatar: string;
  role: "user" | "manager" | "admin";
}

interface Post {
  id: number;
  eventId: string;
  content: string;
  author: User;
  images?: string[];
  timestamp: string;
  likes: number;
  comments: Comment[];
  shares: number;
  isLiked: boolean;
  isPinned?: boolean;
  reactions?: Reaction[];
  views?: number;
}

interface Comment {
  id: number;
  content: string;
  timestamp: string;
  author: User;
  likes: number;
  isLiked: boolean;
  replies: Comment[];
  parentId?: number;
}

type ReactionType = "like" | "love" | "haha" | "wow" | "sad" | "angry";

interface Reaction {
  type: ReactionType;
  count: number;
  users: User[];
}

interface ActivityUser {
  user: User;
  lastActive: string;
  contribution: number;
}

interface Event {
  id: number;
  eventId: string;
  title: string;
  description: string;
  image: string;
  date: string;
  time: string;
  location: string;
  maxParticipants: number;
  currentParticipants: number;
  category: string;
  organizer: User;
  status: "upcoming" | "ongoing" | "completed" | "cancelled";
  isHidden: boolean;
  approvalStatus: "pending" | "approved" | "rejected";
  createdAt: string;
}

interface ChatMessage {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: string;
  isCurrentUser: boolean;
}

interface Resource {
  id: number;
  name: string;
  type: "pdf" | "doc" | "image" | "video" | "link";
  url: string;
  size?: string;
  uploadedBy: User;
  uploadedAt: string;
}

interface GroupProps {
  eventId: string;
  role?: "user" | "manager" | "admin";
}

export default function Group({ eventId, role = "user" }: GroupProps) {
  const token = localStorage.getItem("token");
  const router = useRouter();
  const { user } = useAuth(); // ✅ Lấy user từ AuthContext
  const [isLoading, setIsLoading] = useState(true);
  const [hasAccess, setHasAccess] = useState<boolean | null>(null); // null = checking, true = allowed, false = denied
  const [accessError, setAccessError] = useState<string>("");
  const [event, setEvent] = useState<Event | null>(null);
  const [activeTab, setActiveTab] = useState<"posts" | "chat" | "resources">(
    "posts"
  );
  const [posts, setPosts] = useState<Post[]>([]);
  const [postFilter, setPostFilter] = useState<
    "all" | "organizer" | "media" | "myposts"
  >("all");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [newPost, setNewPost] = useState("");
  const [postImages, setPostImages] = useState<string[]>([]);
  const [showComments, setShowComments] = useState<Record<string, boolean>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  const [onlineMembers] = useState(12);
  const [showReactions, setShowReactions] = useState<Record<number, boolean>>(
    {}
  );
  const [showActivitySidebar, setShowActivitySidebar] = useState(false);
  const [activityUsers] = useState<ActivityUser[]>([]);
  const [showFAB, setShowFAB] = useState(false);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [newPostsCount, setNewPostsCount] = useState(0);
  const [channelId, setChannelId] = useState<number | null>(null);
  const [loadingPosts, setLoadingPosts] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showCreatePostModal, setShowCreatePostModal] = useState(false);
  const [newPostImages, setNewPostImages] = useState<string[]>([]);
  const [imageUrlInput, setImageUrlInput] = useState("");

  // ✅ Convert user từ AuthContext sang format của component
  const currentUserData: User = user
    ? {
        id: user.id,
        name: user.username,
        avatar:
          user.image ||
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
        role: user.role,
      }
    : {
        id: 0,
        name: "Guest",
        avatar:
          "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
        role: "user",
      };

  const chatEndRef = useRef<HTMLDivElement>(null);

  // ✅ STEP 1: Kiểm tra quyền truy cập TRƯỚC KHI fetch bất kỳ dữ liệu nào
  useEffect(() => {
    const checkAccess = async () => {
      try {
        console.log("🔐 Checking access for event:", eventId);

        // Lấy danh sách tất cả registrations của user
        const response = await authFetch("/user/my-registrations");

        if (!response.ok) {
          setHasAccess(false);
          setAccessError(
            "Không thể kiểm tra quyền truy cập. Vui lòng đăng nhập lại."
          );
          return;
        }

        const data = await response.json();
        console.log("📋 User registrations:", data);

        // data có thể là {registrations: [...]} hoặc trực tiếp [...]
        const registrations = data.registrations || data;

        if (!Array.isArray(registrations)) {
          console.error("❌ Invalid registrations format:", data);
          setHasAccess(false);
          setAccessError("Lỗi hệ thống. Vui lòng thử lại sau.");
          return;
        }

        // Kiểm tra xem user đã tham gia sự kiện này chưa
        const registration = registrations.find(
          (reg: any) => String(reg.event_id) === String(eventId)
        );

        if (!registration) {
          console.warn("⛔ User has NOT joined event:", eventId);
          setHasAccess(false);
          setAccessError("Bạn chưa đăng ký tham gia sự kiện này.");
          return;
        }

        // Kiểm tra trạng thái đăng ký
        if (registration.status !== "approved") {
          console.warn(`⏳ Registration status: ${registration.status}`);
          setHasAccess(false);
          setAccessError(
            registration.status === "pending"
              ? "Yêu cầu tham gia của bạn đang chờ manager duyệt."
              : registration.status === "rejected"
              ? "Yêu cầu tham gia của bạn đã bị từ chối."
              : "Bạn không có quyền truy cập vào nhóm này."
          );
          return;
        }

        // ✅ User đã được approved
        console.log("✅ Access granted for event:", eventId);
        setHasAccess(true);
      } catch (error) {
        console.error("❌ Error checking access:", error);
        setHasAccess(false);
        setAccessError("Lỗi kết nối. Vui lòng thử lại sau.");
      }
    };

    checkAccess();
  }, [eventId]);

  // Fetch event details and channel - CHỈ KHI ĐÃ CÓ QUYỀN TRUY CẬP
  useEffect(() => {
    // ⛔ Chỉ fetch khi đã có quyền truy cập
    if (hasAccess !== true) {
      return;
    }

    const fetchEventDetail = async () => {
      try {
        setIsLoading(true);
        const response = await authFetch(
          `/api/events/getEventDetails/${eventId}`
        );
        const data = await response.json();
        if (data && data.event) {
          const eventData = data.event;

          const normalizedEvent: Event = {
            id: eventData.id || parseInt(eventId),
            eventId: eventData.eventId || eventId,
            title: eventData.title || "Sự kiện",
            description: eventData.description || "Chưa có mô tả",
            image:
              eventData.image ||
              "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&h=400&fit=crop",
            date: eventData.date || eventData.start_date || "Chưa xác định",
            time: eventData.time || "Chưa xác định",
            location: eventData.location || "Chưa xác định",
            maxParticipants:
              eventData.maxParticipants || eventData.max_participants || 0,
            currentParticipants:
              eventData.currentParticipants ||
              eventData.current_participants ||
              0,
            category: eventData.category || "Khác",
            organizer: eventData.organizer || {
              id: eventData.creator_id || 1,
              name: eventData.creator?.name || "Ban tổ chức",
              avatar:
                eventData.creator?.avatar ||
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
              role: "manager" as const,
            },
            status: eventData.status || "upcoming",
            isHidden: eventData.isHidden || false,
            approvalStatus:
              eventData.approvalStatus ||
              eventData.approval_status ||
              "approved",
            createdAt:
              eventData.createdAt ||
              eventData.created_at ||
              new Date().toISOString(),
          };

          setEvent(normalizedEvent);

          // Get channel for this event
          try {
            const channelResponse = await authFetch(
              `/api/events/${eventId}/channel`
            );
            const channelData = await channelResponse.json();
            console.log("📡 Channel Response:", channelData);
            if (channelData && channelData.channel) {
              const fetchedChannelId = channelData.channel.id;
              console.log(
                `✅ Event ID: ${eventId} → Channel ID: ${fetchedChannelId}`
              );
              setChannelId(fetchedChannelId);
            }
          } catch (error) {
            console.error("Error fetching channel:", error);
          }
        }
      } catch (error) {
        console.error("Error fetching event details:", error);
        // Không dùng mock data nữa - để event = null
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventDetail();
  }, [eventId, hasAccess]);

  // Fetch posts when channel is available
  useEffect(() => {
    const fetchPosts = async () => {
      if (!channelId) return;

      console.log("🔄 Fetching posts for channel:", channelId);

      try {
        const response = await authFetch(
          `/api/posts/channel/${channelId}?user_id=${currentUserData.id}`
        );
        const data = await response.json();

        console.log("📥 Posts response:", data);

        // Backend trả về {posts: [...]} hoặc [...] trực tiếp
        const postsData = data.posts || data;

        if (postsData && Array.isArray(postsData)) {
          const normalizedPosts: Post[] = postsData.map((post: any) => ({
            id: post.id,
            eventId: eventId,
            content: post.content || "",
            author: {
              id: post.user?.id || post.author_id,
              name: post.user?.name || "User",
              avatar:
                post.user?.avatar ||
                "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
              role: post.user?.role || "user",
            },
            images: post.image ? [post.image] : [],
            timestamp: new Date(post.created_at).toLocaleString("vi-VN"),
            likes: post.likes_count || 0,
            comments: (post.comments || []).map((c: any) => ({
              id: c.id,
              content: c.content,
              timestamp: new Date(c.created_at).toLocaleString("vi-VN"),
              author: {
                id: c.user?.id || c.author?.id || c.author_id,
                name: c.user?.name || c.author?.name || "User",
                avatar:
                  c.user?.avatar ||
                  c.author?.avatar ||
                  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
                role: c.user?.role || c.author?.role || "user",
              },
              likes: 0,
              isLiked: false,
              replies: (c.replies || []).map((r: any) => ({
                id: r.id,
                content: r.content,
                timestamp: new Date(r.created_at).toLocaleString("vi-VN"),
                author: {
                  id: r.user?.id || r.author?.id || r.author_id,
                  name: r.user?.name || r.author?.name || "User",
                  avatar:
                    r.user?.avatar ||
                    r.author?.avatar ||
                    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
                  role: r.user?.role || r.author?.role || "user",
                },
                likes: 0,
                isLiked: false,
                replies: [],
              })),
            })),
            shares: 0,
            isLiked: post.is_liked || false,
            isPinned: post.status === "pinned",
            views: 0,
          }));

          console.log("✅ Normalized posts:", normalizedPosts.length, "posts");
          console.log(
            "🔍 Posts with likes:",
            normalizedPosts.map((p) => ({
              id: p.id,
              likes: p.likes,
              isLiked: p.isLiked,
            }))
          );
          setPosts(normalizedPosts);
        } else {
          console.warn("⚠️ Invalid posts response format:", data);
        }
      } catch (error) {
        console.error("❌ Error fetching posts:", error);
      }
    };

    // Fetch posts ngay khi có channelId, không cần đợi activeTab
    if (channelId) {
      fetchPosts();
    }
  }, [channelId, eventId]);

  // Fetch messages when channel is available
  useEffect(() => {
    const fetchMessages = async () => {
      if (!channelId) return;
      try {
        setLoadingMessages(true);
        const response = await authFetch(`/api/messages/channel/${channelId}`);
        const data = await response.json();
        if (data && Array.isArray(data)) {
          const normalizedMessages: ChatMessage[] = data.map((msg: any) => ({
            id: msg.id,
            userId: msg.sender_id,
            userName: msg.sender?.name || "User",
            userAvatar:
              msg.sender?.avatar ||
              "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
            message: msg.content,
            timestamp: new Date(msg.sent_at).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isCurrentUser: msg.sender_id === currentUserData.id,
          }));
          setMessages(normalizedMessages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      } finally {
        setLoadingMessages(false);
      }
    };

    // Load messages ngay khi có channelId, không đợi user click tab
    if (channelId) {
      fetchMessages();

      // Auto-refresh mỗi 3 giây để cập nhật tin nhắn mới
      const interval = setInterval(fetchMessages, 3000);
      return () => clearInterval(interval);
    }
  }, [channelId, currentUserData.id]);

  // Auto scroll chat
  useEffect(() => {
    if (activeTab === "chat" && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, activeTab]);

  // Filter posts
  const filteredPosts = posts.filter((post) => {
    if (postFilter === "organizer")
      return post.author.role === "manager" || post.author.role === "admin";
    if (postFilter === "media") return post.images && post.images.length > 0;
    if (postFilter === "myposts") return post.author.id === currentUserData.id;
    return true;
  });

  // Separate pinned and regular posts
  const pinnedPosts = filteredPosts.filter((post) => post.isPinned);
  const regularPosts = filteredPosts.filter((post) => !post.isPinned);

  // Calculate stats
  const totalPosts = posts.length;
  const todayMessages = messages.filter(
    (m) => m.timestamp.includes("giờ") || m.timestamp.includes("phút")
  ).length;
  const totalResources = resources.length;
  const activityScore = Math.round(
    (totalPosts * 10 + todayMessages * 5 + totalResources * 15) / 10
  );

  // Handlers
  const handlePost = async () => {
    if (!newPost.trim() || !channelId) return;

    // Optimistic Update - Hiển thị post ngay lập tức
    const tempId = Date.now();
    const optimisticPost: Post = {
      id: tempId,
      eventId,
      content: newPost,
      images: newPostImages.length > 0 ? newPostImages : undefined,
      timestamp: "Vừa xong",
      author: currentUserData,
      likes: 0,
      comments: [],
      shares: 0,
      isLiked: false,
      views: 0,
    };

    const postContent = newPost;
    const postImgs = [...newPostImages];

    // Cập nhật UI ngay lập tức
    setPosts([optimisticPost, ...posts]);
    setNewPost("");
    setNewPostImages([]);
    setImageUrlInput("");
    setShowFAB(false);

    try {
      const response = await authFetch("/api/posts/channel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          channel_id: channelId,
          title: postContent.substring(0, 100),
          content: postContent,
          image: postImgs[0] || null,
          author_id: currentUserData.id,
        }),
      });
      const data = await response.json();

      if (data && data.post) {
        // Cập nhật với ID thật từ server
        setPosts((prev) =>
          prev.map((p) => (p.id === tempId ? { ...p, id: data.post.id } : p))
        );
      }
    } catch (error) {
      console.error("Error creating post:", error);

      // Rollback - Xóa post nếu thất bại
      setPosts((prev) => prev.filter((p) => p.id !== tempId));
      setNewPost(postContent);
      setPostImages(postImgs);
      alert("Không thể đăng bài. Vui lòng thử lại!");
    }
  };

  const handleReaction = (postId: number, reactionType: ReactionType) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          const reactions = post.reactions || [];
          const existingReaction = reactions.find(
            (r) => r.type === reactionType
          );

          if (existingReaction) {
            return {
              ...post,
              reactions: reactions.map((r) =>
                r.type === reactionType ? { ...r, count: r.count + 1 } : r
              ),
            };
          } else {
            return {
              ...post,
              reactions: [
                ...reactions,
                { type: reactionType, count: 1, users: [] },
              ],
            };
          }
        }
        return post;
      })
    );
    setShowReactions({ ...showReactions, [postId]: false });
  };

  const handleLike = async (postId: number) => {
    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    // Optimistic update
    setPosts(
      posts.map((p) =>
        p.id === postId
          ? {
              ...p,
              isLiked: !p.isLiked,
              likes: p.isLiked ? p.likes - 1 : p.likes + 1,
            }
          : p
      )
    );

    try {
      if (post.isLiked) {
        await authFetch(`/api/likes/post/unlike/${postId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      } else {
        await authFetch(`/api/likes/post/like/${postId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      // Rollback on error
      setPosts(
        posts.map((p) =>
          p.id === postId
            ? {
                ...p,
                isLiked: !p.isLiked,
                likes: p.isLiked ? p.likes + 1 : p.likes - 1,
              }
            : p
        )
      );
    }
  };

  const handleShare = (postId: number) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          return { ...post, shares: post.shares + 1 };
        }
        return post;
      })
    );
    alert("Đã chia sẻ bài viết!");
  };

  const handleComment = async (postId: number, parentCommentId?: number) => {
    const commentKey = parentCommentId
      ? `${postId}-${parentCommentId}`
      : `${postId}`;
    const comment = newComment[commentKey];

    if (!comment?.trim()) return;

    const tempId = Date.now();
    const newCommentObj: Comment = {
      id: tempId,
      content: comment,
      timestamp: new Date().toLocaleString("vi-VN"),
      author: currentUserData,
      likes: 0,
      isLiked: false,
      replies: [],
      parentId: parentCommentId,
    };

    console.log("💬 Creating comment:", {
      postId,
      parentCommentId,
      content: comment,
    });

    // Optimistic update
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          if (parentCommentId) {
            // Add as reply to parent comment
            const updatedComments = post.comments.map((c) => {
              if (c.id === parentCommentId) {
                return {
                  ...c,
                  replies: [...c.replies, newCommentObj],
                };
              }
              return c;
            });
            return { ...post, comments: updatedComments };
          } else {
            // Add as top-level comment
            return {
              ...post,
              comments: [...post.comments, newCommentObj],
            };
          }
        }
        return post;
      })
    );

    // Clear input
    setNewComment({ ...newComment, [commentKey]: "" });

    // Call API to save comment
    try {
      const response = await authFetch("/api/posts/addCommentOfPost", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          post_id: postId,
          content: comment,
          parent_id: parentCommentId || null,
          author_id: currentUserData.id, // Fallback for non-JWT
        }),
      });
      const data = await response.json();

      console.log("✅ Comment created:", data);

      // Update with real comment from server
      if (data.comment) {
        const serverComment: Comment = {
          id: data.comment.id,
          content: data.comment.content,
          timestamp: new Date(data.comment.created_at).toLocaleString("vi-VN"),
          author: {
            id: data.comment.author.id,
            name: data.comment.author.name,
            avatar: data.comment.author.avatar,
            role: data.comment.author.role,
          },
          likes: 0,
          isLiked: false,
          replies: [],
          parentId: parentCommentId,
        };

        // Replace temp comment with server comment
        setPosts(
          posts.map((post) => {
            if (post.id === postId) {
              if (parentCommentId) {
                const updatedComments = post.comments.map((c) => {
                  if (c.id === parentCommentId) {
                    return {
                      ...c,
                      replies: c.replies.map((r) =>
                        r.id === tempId ? serverComment : r
                      ),
                    };
                  }
                  return c;
                });
                return { ...post, comments: updatedComments };
              } else {
                const updatedComments = post.comments.map((c) =>
                  c.id === tempId ? serverComment : c
                );
                return { ...post, comments: updatedComments };
              }
            }
            return post;
          })
        );
      }
    } catch (error) {
      console.error("❌ Error adding comment:", error);

      // Rollback on error
      setPosts(
        posts.map((post) => {
          if (post.id === postId) {
            if (parentCommentId) {
              const updatedComments = post.comments.map((c) => {
                if (c.id === parentCommentId) {
                  return {
                    ...c,
                    replies: c.replies.filter((r) => r.id !== tempId),
                  };
                }
                return c;
              });
              return { ...post, comments: updatedComments };
            } else {
              return {
                ...post,
                comments: post.comments.filter((c) => c.id !== tempId),
              };
            }
          }
          return post;
        })
      );

      // Restore input
      setNewComment({ ...newComment, [commentKey]: comment });
      alert("Không thể thêm bình luận. Vui lòng thử lại!");
    }
  };

  const handleLikeComment = (
    postId: number,
    commentId: number,
    isReply: boolean = false,
    parentCommentId?: number
  ) => {
    setPosts(
      posts.map((post) => {
        if (post.id === postId) {
          let updatedComments;
          if (isReply && parentCommentId) {
            updatedComments = post.comments.map((c) => {
              if (c.id === parentCommentId) {
                return {
                  ...c,
                  replies: c.replies.map((r) => {
                    if (r.id === commentId) {
                      return {
                        ...r,
                        isLiked: !r.isLiked,
                        likes: r.isLiked ? r.likes - 1 : r.likes + 1,
                      };
                    }
                    return r;
                  }),
                };
              }
              return c;
            });
          } else {
            updatedComments = post.comments.map((c) => {
              if (c.id === commentId) {
                return {
                  ...c,
                  isLiked: !c.isLiked,
                  likes: c.isLiked ? c.likes - 1 : c.likes + 1,
                };
              }
              return c;
            });
          }
          return {
            ...post,
            comments: updatedComments,
          };
        }
        return post;
      })
    );
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !channelId) return;

    // Optimistic Update - Hiển thị tin nhắn ngay lập tức
    const tempId = Date.now();
    const optimisticMsg: ChatMessage = {
      id: tempId,
      userId: currentUserData.id,
      userName: currentUserData.name,
      userAvatar: currentUserData.avatar,
      message: newMessage,
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      isCurrentUser: true,
    };

    const messageContent = newMessage;

    // Cập nhật UI ngay lập tức
    setMessages([...messages, optimisticMsg]);
    setNewMessage("");

    // Gửi request lên server ở background
    try {
      console.log("📤 Sending message:", {
        channel_id: channelId,
        sender_id: currentUserData.id,
        currentUserData,
      });

      const response = await authFetch("/api/messages/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          channel_id: channelId,
          content: messageContent,
          sender_id: currentUserData.id, // Tạm thời gửi để fallback khi không có JWT
        }),
      });
      const data = await response.json();

      // Cập nhật lại với ID thật từ server
      if (data) {
        setMessages((prev) =>
          prev.map((msg) => (msg.id === tempId ? { ...msg, id: data.id } : msg))
        );
      }
    } catch (error) {
      console.error("Error sending message:", error);

      // Rollback - Xóa tin nhắn nếu gửi thất bại
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
      setNewMessage(messageContent); // Khôi phục nội dung
      alert("Không thể gửi tin nhắn. Vui lòng thử lại!");
    }
  };

  // ✅ Kiểm tra quyền truy cập TRƯỚC TIÊN
  if (hasAccess === null) {
    // Đang kiểm tra quyền truy cập
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">
            Đang kiểm tra quyền truy cập...
          </p>
        </div>
      </div>
    );
  }

  if (hasAccess === false) {
    // Không có quyền truy cập
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12 max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimes className="text-red-600 text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">
            Không có quyền truy cập
          </h1>
          <p className="text-gray-600 mb-6">
            {accessError ||
              "Bạn chưa đăng ký hoặc chưa được duyệt tham gia sự kiện này."}
          </p>
          <div className="space-y-3">
            <button
              onClick={() => router.push(`/events/${eventId}`)}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all font-semibold"
            >
              Xem chi tiết sự kiện
            </button>
            <button
              onClick={() => router.push("/events")}
              className="w-full px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-all font-semibold"
            >
              Quay lại danh sách sự kiện
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải kênh sự kiện...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center bg-white rounded-2xl shadow-xl p-12">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FaTimes className="text-red-600 text-3xl" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Không tìm thấy sự kiện
          </h1>
          <p className="text-gray-600">
            Sự kiện với ID "{eventId}" không tồn tại hoặc đã bị xóa.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
      {/* Header Bar - Xanh nhạt gradient */}
      <div className="bg-gradient-to-r from-green-100/80 via-blue-100/80 to-teal-100/80 backdrop-blur-lg border-b border-white/50 sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Left: Back + Event Info */}
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2.5 hover:bg-white/60 rounded-xl transition-all backdrop-blur-sm shadow-sm"
              >
                <FaArrowLeft className="text-gray-700" />
              </button>
              <div className="flex items-center space-x-3 bg-white/60 backdrop-blur-sm rounded-xl px-4 py-2 shadow-sm">
                <Image
                  src={event.image}
                  alt={event.title}
                  width={48}
                  height={48}
                  className="rounded-lg object-cover ring-2 ring-white shadow-md"
                  unoptimized
                />
                <div>
                  <h1 className="text-lg font-bold text-gray-900 line-clamp-1">
                    {event.title}
                  </h1>
                  <div className="flex items-center space-x-3 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      {onlineMembers} đang online
                    </span>
                    <span>•</span>
                    <span>{event.currentParticipants} thành viên</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Removed unused buttons */}
          </div>

          {/* Tabs - Cải thiện với background */}
          <div className="flex items-center space-x-2 mt-5 bg-white/40 backdrop-blur-sm rounded-xl p-1.5 shadow-sm">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all ${
                activeTab === "posts"
                  ? "bg-white shadow-md text-green-600"
                  : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
              }`}
            >
              <FaHashtag />
              <span>Bảng tin</span>
            </button>

            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all ${
                activeTab === "chat"
                  ? "bg-white shadow-md text-blue-600"
                  : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
              }`}
            >
              <FaComments />
              <span>Trò chuyện</span>
            </button>

            <button
              onClick={() => setActiveTab("resources")}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg font-semibold transition-all ${
                activeTab === "resources"
                  ? "bg-white shadow-md text-purple-600"
                  : "text-gray-600 hover:text-gray-800 hover:bg-white/50"
              }`}
            >
              <FaFileAlt />
              <span>Tài liệu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Cải thiện layout */}
      <div className="flex gap-6 w-full max-w-7xl mx-auto px-6 py-6 relative">
        {/* Center Content Area - Full Width */}
        <div className="flex-1 max-w-4xl mx-auto">
          {/* POSTS TAB */}
          {activeTab === "posts" && (
            <div className="space-y-5">
              {/* Filter Bar */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-5">
                <div className="flex items-center justify-between">
                  <h2 className="font-bold text-gray-900 flex items-center gap-2.5">
                    <div className="p-2 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl">
                      <FaFilter className="text-white text-sm" />
                    </div>
                    <span>Bộ lọc bài viết</span>
                  </h2>
                  <div className="flex gap-2.5">
                    <button
                      onClick={() => setPostFilter("all")}
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md ${
                        postFilter === "all"
                          ? "bg-gradient-to-r from-green-500 to-blue-500 text-white scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Tất cả
                    </button>
                    <button
                      onClick={() => setPostFilter("organizer")}
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md ${
                        postFilter === "organizer"
                          ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Từ BTC
                    </button>
                    <button
                      onClick={() => setPostFilter("media")}
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md ${
                        postFilter === "media"
                          ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Ảnh & Video
                    </button>
                    <button
                      onClick={() => setPostFilter("myposts")}
                      className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-sm hover:shadow-md ${
                        postFilter === "myposts"
                          ? "bg-gradient-to-r from-orange-500 to-red-500 text-white scale-105"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      Bài viết của tôi
                    </button>
                  </div>
                </div>
              </div>

              {/* Create Post Button */}
              <button
                onClick={() => setShowCreatePostModal(true)}
                className="w-full bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 hover:shadow-xl transition-all group"
              >
                <div className="flex items-center gap-4">
                  <Image
                    src={currentUserData.avatar}
                    alt={currentUserData.name}
                    width={52}
                    height={52}
                    className="rounded-full ring-4 ring-white shadow-sm"
                    unoptimized
                  />
                  <div className="flex-1 text-left px-5 py-3 bg-gray-50 hover:bg-gray-100 rounded-full transition-colors">
                    <p className="text-gray-500">
                      {currentUserData.name} ơi, bạn đang nghĩ gì về sự kiện
                      này?
                    </p>
                  </div>
                </div>
              </button>

              {/* Posts Feed */}
              {posts.length === 0 ? (
                <div className="space-y-5">
                  {/* Skeleton Loading */}
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-6 animate-pulse"
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                          <div className="h-3 bg-gray-200 rounded w-1/6"></div>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="h-3 bg-gray-200 rounded w-full"></div>
                        <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-3 bg-gray-200 rounded w-4/6"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredPosts.length === 0 ? (
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-20 text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-5 shadow-inner">
                    <FaComment className="text-5xl text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Chưa có bài viết nào
                  </h3>
                  <p className="text-gray-500">
                    {postFilter === "myposts"
                      ? "Bạn chưa đăng bài viết nào trong sự kiện này"
                      : postFilter !== "all"
                      ? "Không tìm thấy bài viết phù hợp với bộ lọc"
                      : "Hãy là người đầu tiên chia sẻ về sự kiện này!"}
                  </p>
                </div>
              ) : null}

              {filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className={`bg-white rounded-2xl shadow-md border overflow-hidden 
                                            hover:shadow-xl transition-all duration-300 ${
                                              post.isPinned
                                                ? "border-green-400 border-2"
                                                : "border-gray-200"
                                            }`}
                >
                  {/* Pinned Badge */}
                  {post.isPinned && (
                    <div className="bg-gradient-to-r from-green-500 to-blue-500 px-4 py-2 flex items-center gap-2 text-white text-sm font-semibold">
                      <FaThumbtack />
                      <span>Bài viết được ghim bởi BTC</span>
                    </div>
                  )}

                  {/* Post Header */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() =>
                            router.push(`/user/profile/${post.author.id}`)
                          }
                          className="flex-shrink-0 hover:opacity-80 transition"
                        >
                          <Image
                            src={post.author.avatar}
                            alt={post.author.name}
                            width={48}
                            height={48}
                            className="rounded-full ring-2 ring-gray-100"
                            unoptimized
                          />
                        </button>
                        <div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() =>
                                router.push(`/user/profile/${post.author.id}`)
                              }
                              className="font-semibold text-gray-900 hover:text-blue-600 transition"
                            >
                              {post.author.name}
                            </button>
                            {(post.author.role === "manager" ||
                              post.author.role === "admin") && (
                              <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                BTC
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 flex items-center gap-1.5 mt-0.5">
                            <FaClock className="w-3 h-3" />
                            {post.timestamp}
                          </p>
                        </div>
                      </div>
                      {(role === "admin" ||
                        post.author.id === currentUserData.id) && (
                        <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition">
                          <FaEllipsisV />
                        </button>
                      )}
                    </div>

                    <p className="text-gray-800 text-[15px] leading-relaxed whitespace-pre-wrap mb-4">
                      {post.content}
                    </p>
                  </div>

                  {/* Post Images */}
                  {post.images && post.images.length > 0 && (
                    <div
                      className={`grid gap-1 ${
                        post.images.length === 1 ? "grid-cols-1" : "grid-cols-2"
                      }`}
                    >
                      {post.images.map((image, index) => (
                        <div
                          key={index}
                          className="relative aspect-square overflow-hidden"
                        >
                          <Image
                            src={image}
                            alt={`Post image ${index + 1}`}
                            fill
                            className="object-cover hover:scale-110 transition-transform duration-300 cursor-pointer"
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Post Actions */}
                  <div className="px-6 py-4 bg-gradient-to-r from-green-50/80 via-blue-50/80 to-purple-50/80 backdrop-blur-sm border-y border-white/50">
                    <div className="flex items-center justify-around text-sm">
                      <button
                        onClick={() => handleLike(post.id)}
                        className={`flex items-center gap-2.5 px-6 py-3 rounded-xl font-semibold transition-all ${
                          post.isLiked
                            ? "bg-red-500 text-white hover:bg-red-600"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {post.isLiked ? (
                          <FaHeart className="w-5 h-5" />
                        ) : (
                          <FaRegHeart className="w-5 h-5" />
                        )}
                        <span>{post.likes > 0 ? post.likes : "Thích"}</span>
                      </button>

                      <button
                        onClick={() =>
                          setShowComments({
                            ...showComments,
                            [post.id]: !showComments[post.id],
                          })
                        }
                        className="flex items-center gap-2.5 px-6 py-3 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold transition"
                      >
                        <FaComment className="w-5 h-5" />
                        <span>
                          {post.comments.length > 0
                            ? `${post.comments.length} bình luận`
                            : "Bình luận"}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {showComments[post.id] && (
                    <div className="px-6 py-5 space-y-4 bg-gray-50/50">
                      {/* Add Comment */}
                      <div className="flex gap-3">
                        <Image
                          src={currentUserData.avatar}
                          alt={currentUserData.name}
                          width={40}
                          height={40}
                          className="rounded-full ring-2 ring-white shadow-sm"
                          unoptimized
                        />
                        <div className="flex-1 flex gap-2">
                          <input
                            type="text"
                            value={newComment[post.id] || ""}
                            onChange={(e) =>
                              setNewComment({
                                ...newComment,
                                [post.id]: e.target.value,
                              })
                            }
                            placeholder="Viết bình luận..."
                            className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-full 
                                     focus:ring-2 focus:ring-blue-400 focus:border-blue-400 
                                     text-sm text-gray-800 placeholder-gray-400 transition-all shadow-sm"
                            onKeyPress={(e) =>
                              e.key === "Enter" &&
                              !e.shiftKey &&
                              handleComment(post.id)
                            }
                          />
                          <button
                            onClick={() => handleComment(post.id)}
                            disabled={!newComment[post.id]?.trim()}
                            className="px-4 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white rounded-full 
                                     hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed
                                     transition-all transform hover:scale-105 font-medium text-sm shadow-md"
                          >
                            Gửi
                          </button>
                        </div>
                      </div>

                      {/* Comments List */}
                      <div className="space-y-4 mt-4">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="space-y-3">
                            {/* Main Comment */}
                            <div className="flex gap-3 items-start">
                              <button
                                onClick={() =>
                                  router.push(
                                    `/user/profile/${comment.author.id}`
                                  )
                                }
                                className="flex-shrink-0 hover:opacity-80 transition"
                              >
                                <Image
                                  src={comment.author.avatar}
                                  alt={comment.author.name}
                                  width={40}
                                  height={40}
                                  className="rounded-full ring-2 ring-white shadow-sm"
                                  unoptimized
                                />
                              </button>
                              <div className="flex-1 min-w-0">
                                <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                  <div className="flex items-start justify-between gap-2 mb-1">
                                    <div className="flex items-center gap-2">
                                      <button
                                        onClick={() =>
                                          router.push(
                                            `/user/profile/${comment.author.id}`
                                          )
                                        }
                                        className="font-semibold text-gray-900 text-sm hover:text-blue-600 transition"
                                      >
                                        {comment.author.name}
                                      </button>
                                      {comment.author.role === "manager" && (
                                        <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                          BTC
                                        </span>
                                      )}
                                    </div>
                                    <span className="text-xs text-gray-400 whitespace-nowrap">
                                      {comment.timestamp}
                                    </span>
                                  </div>
                                  <p className="text-gray-700 text-sm leading-relaxed">
                                    {comment.content}
                                  </p>
                                </div>

                                <div className="flex items-center gap-4 mt-2 ml-1">
                                  <button
                                    onClick={() =>
                                      handleLikeComment(post.id, comment.id)
                                    }
                                    className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${
                                      comment.isLiked
                                        ? "text-red-500"
                                        : "text-gray-500 hover:text-red-500"
                                    }`}
                                  >
                                    {comment.isLiked ? (
                                      <FaHeart className="w-3.5 h-3.5" />
                                    ) : (
                                      <FaRegHeart className="w-3.5 h-3.5" />
                                    )}
                                    {comment.likes > 0 && (
                                      <span>{comment.likes}</span>
                                    )}
                                  </button>
                                  <button
                                    onClick={() => {
                                      const commentKey = `${post.id}-${comment.id}`;
                                      setShowComments({
                                        ...showComments,
                                        [commentKey]: !showComments[commentKey],
                                      });
                                    }}
                                    className="text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors"
                                  >
                                    Trả lời
                                  </button>
                                  {comment.replies &&
                                    comment.replies.length > 0 && (
                                      <span className="text-xs text-gray-400">
                                        {comment.replies.length} phản hồi
                                      </span>
                                    )}
                                </div>

                                {/* Reply Input */}
                                {showComments[`${post.id}-${comment.id}`] && (
                                  <div className="flex gap-2 mt-3 pl-1">
                                    <Image
                                      src={currentUserData.avatar}
                                      alt={currentUserData.name}
                                      width={32}
                                      height={32}
                                      className="rounded-full flex-shrink-0"
                                      unoptimized
                                    />
                                    <div className="flex-1 flex gap-2">
                                      <input
                                        type="text"
                                        value={
                                          newComment[
                                            `${post.id}-${comment.id}`
                                          ] || ""
                                        }
                                        onChange={(e) =>
                                          setNewComment({
                                            ...newComment,
                                            [`${post.id}-${comment.id}`]:
                                              e.target.value,
                                          })
                                        }
                                        placeholder={`Trả lời ${comment.author.name}...`}
                                        className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-full 
                                                 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 focus:bg-white
                                                 text-sm text-gray-800 placeholder-gray-400 transition-all"
                                        onKeyPress={(e) =>
                                          e.key === "Enter" &&
                                          !e.shiftKey &&
                                          handleComment(post.id, comment.id)
                                        }
                                      />
                                      <button
                                        onClick={() =>
                                          handleComment(post.id, comment.id)
                                        }
                                        disabled={
                                          !newComment[
                                            `${post.id}-${comment.id}`
                                          ]?.trim()
                                        }
                                        className="px-3 py-2 bg-blue-500 text-white rounded-full 
                                                 hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed
                                                 transition-all text-sm font-medium shadow-sm"
                                      >
                                        Gửi
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {/* Nested Replies */}
                                {comment.replies &&
                                  comment.replies.length > 0 && (
                                    <div className="ml-10 mt-3 space-y-3 border-l-2 border-blue-100 pl-4">
                                      {comment.replies.map((reply) => (
                                        <div
                                          key={reply.id}
                                          className="flex gap-2 items-start"
                                        >
                                          <button
                                            onClick={() =>
                                              router.push(
                                                `/user/profile/${reply.author.id}`
                                              )
                                            }
                                            className="flex-shrink-0 hover:opacity-80 transition"
                                          >
                                            <Image
                                              src={reply.author.avatar}
                                              alt={reply.author.name}
                                              width={32}
                                              height={32}
                                              className="rounded-full ring-2 ring-white shadow-sm"
                                              unoptimized
                                            />
                                          </button>
                                          <div className="flex-1 min-w-0">
                                            <div className="bg-gray-50 rounded-xl px-3 py-2 border border-gray-100 hover:bg-gray-100 transition-colors">
                                              <div className="flex items-start justify-between gap-2 mb-1">
                                                <div className="flex items-center gap-2">
                                                  <button
                                                    onClick={() =>
                                                      router.push(
                                                        `/user/profile/${reply.author.id}`
                                                      )
                                                    }
                                                    className="font-semibold text-gray-900 text-xs hover:text-blue-600 transition"
                                                  >
                                                    {reply.author.name}
                                                  </button>
                                                  {reply.author.role ===
                                                    "manager" && (
                                                    <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full font-medium">
                                                      BTC
                                                    </span>
                                                  )}
                                                </div>
                                                <span className="text-xs text-gray-400 whitespace-nowrap">
                                                  {reply.timestamp}
                                                </span>
                                              </div>
                                              <p className="text-gray-700 text-xs leading-relaxed">
                                                {reply.content}
                                              </p>
                                            </div>

                                            <div className="flex items-center gap-3 mt-1.5 ml-1">
                                              <button
                                                onClick={() =>
                                                  handleLikeComment(
                                                    post.id,
                                                    reply.id,
                                                    true,
                                                    comment.id
                                                  )
                                                }
                                                className={`flex items-center gap-1 text-xs font-medium transition-colors ${
                                                  reply.isLiked
                                                    ? "text-red-500"
                                                    : "text-gray-500 hover:text-red-500"
                                                }`}
                                              >
                                                {reply.isLiked ? (
                                                  <FaHeart className="w-3 h-3" />
                                                ) : (
                                                  <FaRegHeart className="w-3 h-3" />
                                                )}
                                                {reply.likes > 0 && (
                                                  <span>{reply.likes}</span>
                                                )}
                                              </button>
                                              <button
                                                onClick={() => {
                                                  const commentKey = `${post.id}-${comment.id}`;
                                                  setShowComments({
                                                    ...showComments,
                                                    [commentKey]: true,
                                                  });
                                                }}
                                                className="text-xs font-medium text-gray-500 hover:text-blue-600 transition-colors"
                                              >
                                                Trả lời
                                              </button>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* CHAT TAB */}
          {activeTab === "chat" && (
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden h-[calc(100vh-16rem)]">
                {/* Messages */}
                <div className="h-[calc(100%-5rem)] overflow-y-auto p-6 space-y-3 bg-gradient-to-br from-green-50/30 to-blue-50/30">
                  {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                      <div className="bg-white rounded-full p-8 mb-4 shadow-lg">
                        <FaComments className="text-6xl text-gray-300" />
                      </div>
                      <h3 className="font-bold text-gray-700 text-lg mb-2">
                        Chưa có tin nhắn
                      </h3>
                      <p className="text-gray-500">
                        Bắt đầu cuộc trò chuyện với các thành viên!
                      </p>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex items-end gap-2 ${
                            message.isCurrentUser
                              ? "flex-row-reverse"
                              : "flex-row"
                          }`}
                        >
                          {!message.isCurrentUser && (
                            <Image
                              src={message.userAvatar}
                              alt={message.userName}
                              width={36}
                              height={36}
                              className="rounded-full ring-2 ring-white"
                              unoptimized
                            />
                          )}
                          <div
                            className={`flex flex-col ${
                              message.isCurrentUser
                                ? "items-end"
                                : "items-start"
                            } max-w-[70%]`}
                          >
                            {!message.isCurrentUser && (
                              <span className="text-xs font-medium text-gray-600 mb-1 ml-2">
                                {message.userName}
                              </span>
                            )}
                            <div
                              className={`px-4 py-2.5 rounded-2xl shadow-sm ${
                                message.isCurrentUser
                                  ? "bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-br-sm"
                                  : "bg-white text-gray-800 rounded-bl-sm border border-gray-200"
                              }`}
                            >
                              <p className="text-sm leading-relaxed">
                                {message.message}
                              </p>
                              <span
                                className={`text-xs mt-1 block ${
                                  message.isCurrentUser
                                    ? "text-green-100"
                                    : "text-gray-400"
                                }`}
                              >
                                {message.timestamp}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                      <div ref={chatEndRef} />
                    </>
                  )}
                </div>

                {/* Chat Input */}
                <div className="h-20 p-4 bg-white border-t border-gray-200">
                  <div className="flex items-center gap-2 bg-gray-50 rounded-full p-2">
                    <button className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition">
                      <FaSmile className="text-lg" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-full transition">
                      <FaPaperclip className="text-lg" />
                    </button>
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSendMessage()
                      }
                      placeholder="Nhập tin nhắn..."
                      className="flex-1 bg-transparent px-3 py-2 focus:outline-none text-gray-700 placeholder-gray-400"
                    />
                    <button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      className="p-2.5 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full 
                               hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <FaPaperPlane />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* RESOURCES TAB */}
          {activeTab === "resources" && (
            <div className="space-y-4 max-w-4xl mx-auto">
              {/* Upload Section - Only for Manager/Admin */}
              {(role === "manager" || role === "admin") && (
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl shadow-md border-2 border-dashed border-green-300 p-8 text-center">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaPlus className="text-2xl text-green-600" />
                  </div>
                  <h3 className="font-bold text-gray-900 mb-2">
                    Tải lên tài liệu
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    Thêm tài liệu, hình ảnh hoặc video hữu ích cho sự kiện
                  </p>
                  <button className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl font-semibold hover:shadow-lg transition">
                    Chọn file
                  </button>
                </div>
              )}

              {/* Resources List */}
              {resources.length === 0 ? (
                <div className="bg-white rounded-xl shadow-md border border-gray-200 p-16 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FaFileAlt className="text-4xl text-gray-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Chưa có tài liệu
                  </h3>
                  <p className="text-gray-500">
                    Ban tổ chức sẽ cập nhật tài liệu sớm nhất
                  </p>
                </div>
              ) : (
                <div className="grid gap-4">
                  {resources.map((resource) => (
                    <div
                      key={resource.id}
                      className="bg-white rounded-xl shadow-md border border-gray-200 p-5 hover:shadow-lg transition"
                    >
                      <div className="flex items-center gap-4">
                        {/* File Icon */}
                        <div
                          className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                            resource.type === "pdf"
                              ? "bg-red-100"
                              : resource.type === "doc"
                              ? "bg-blue-100"
                              : resource.type === "image"
                              ? "bg-purple-100"
                              : resource.type === "video"
                              ? "bg-green-100"
                              : "bg-gray-100"
                          }`}
                        >
                          <FaFileAlt
                            className={`text-2xl ${
                              resource.type === "pdf"
                                ? "text-red-600"
                                : resource.type === "doc"
                                ? "text-blue-600"
                                : resource.type === "image"
                                ? "text-purple-600"
                                : resource.type === "video"
                                ? "text-green-600"
                                : "text-gray-600"
                            }`}
                          />
                        </div>

                        {/* File Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 truncate">
                            {resource.name}
                          </h4>
                          <div className="flex items-center gap-3 mt-1 text-sm text-gray-500">
                            <span className="flex items-center gap-1">
                              <Image
                                src={resource.uploadedBy.avatar}
                                alt={resource.uploadedBy.name}
                                width={20}
                                height={20}
                                className="rounded-full"
                                unoptimized
                              />
                              {resource.uploadedBy.name}
                            </span>
                            <span>•</span>
                            <span>{resource.size}</span>
                            <span>•</span>
                            <span>{resource.uploadedAt}</span>
                          </div>
                        </div>

                        {/* Download Button */}
                        <button className="p-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl hover:shadow-lg transition">
                          <FaDownload />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar - Activity Users (Toggle) */}
        {showActivitySidebar && (
          <div className="hidden xl:block w-80 flex-shrink-0">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 p-5 sticky top-24 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <h3 className="font-bold text-gray-900 flex items-center gap-2">
                  <FaUsers className="text-green-600" />
                  <span>Hoạt động</span>
                </h3>
                <button
                  onClick={() => setShowActivitySidebar(false)}
                  className="p-1.5 hover:bg-gray-100 rounded-lg transition"
                >
                  <FaTimes className="text-gray-400" />
                </button>
              </div>

              {/* Online Members */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">
                  Online (
                  {
                    activityUsers.filter((u) => u.lastActive === "Online")
                      .length
                  }
                  )
                </h4>
                <div className="space-y-2">
                  {activityUsers
                    .filter((u) => u.lastActive === "Online")
                    .map((activityUser) => (
                      <div
                        key={activityUser.user.id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition cursor-pointer"
                      >
                        <div className="relative">
                          <Image
                            src={activityUser.user.avatar}
                            alt={activityUser.user.name}
                            width={40}
                            height={40}
                            className="rounded-full ring-2 ring-white shadow-sm"
                            unoptimized
                          />
                          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate flex items-center gap-1">
                            {activityUser.user.name}
                            {activityUser.user.role === "manager" && (
                              <span className="px-1.5 py-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 text-white text-xs rounded font-bold">
                                BTC
                              </span>
                            )}
                          </p>
                          <p className="text-xs text-green-600 font-medium">
                            Đang online
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Top Contributors */}
              <div className="pt-3 border-t border-gray-200">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3 flex items-center gap-1">
                  <FaMedal className="text-orange-500" />
                  Top Contributor
                </h4>
                <div className="space-y-2">
                  {activityUsers
                    .sort((a, b) => b.contribution - a.contribution)
                    .slice(0, 3)
                    .map((activityUser, index) => (
                      <div
                        key={activityUser.user.id}
                        className="flex items-center gap-3 p-2 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-xl"
                      >
                        <div className="relative">
                          <Image
                            src={activityUser.user.avatar}
                            alt={activityUser.user.name}
                            width={36}
                            height={36}
                            className="rounded-full ring-2 ring-white shadow-sm"
                            unoptimized
                          />
                          <div
                            className={`absolute -top-1 -left-1 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                              index === 0
                                ? "bg-yellow-500"
                                : index === 1
                                ? "bg-gray-400"
                                : "bg-orange-600"
                            }`}
                          >
                            {index + 1}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {activityUser.user.name}
                          </p>
                          <p className="text-xs text-gray-600">
                            <FaFire className="inline text-orange-500 mr-1" />
                            {activityUser.contribution} điểm
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>

              {/* Recently Active */}
              <div className="pt-3 border-t border-gray-200">
                <h4 className="text-xs font-bold text-gray-500 uppercase mb-3">
                  Hoạt động gần đây
                </h4>
                <div className="space-y-2">
                  {activityUsers
                    .filter((u) => u.lastActive !== "Online")
                    .map((activityUser) => (
                      <div
                        key={activityUser.user.id}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition cursor-pointer"
                      >
                        <Image
                          src={activityUser.user.avatar}
                          alt={activityUser.user.name}
                          width={36}
                          height={36}
                          className="rounded-full ring-2 ring-white shadow-sm"
                          unoptimized
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {activityUser.user.name}
                          </p>
                          <p className="text-xs text-gray-500">
                            {activityUser.lastActive}
                          </p>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Create Post Modal */}
      {showCreatePostModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">Tạo bài viết</h2>
              <button
                onClick={() => setShowCreatePostModal(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition"
              >
                <svg
                  className="w-6 h-6"
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

            {/* Modal Body */}
            <div className="p-6 space-y-4">
              {/* Author Info */}
              <div className="flex items-center gap-3">
                <Image
                  src={currentUserData.avatar}
                  alt={currentUserData.name}
                  width={52}
                  height={52}
                  className="rounded-full ring-2 ring-gray-200"
                  unoptimized
                />
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {currentUserData.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Đang đăng trong: {event.title}
                  </p>
                </div>
              </div>

              {/* Post Content */}
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                placeholder="Bạn đang nghĩ gì về sự kiện này?"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl 
                         focus:ring-2 focus:ring-blue-500 focus:border-blue-500 
                         resize-none text-gray-800 placeholder-gray-400 transition-all min-h-[200px]"
                autoFocus
              />

              {/* Image Preview */}
              {newPostImages.length > 0 && (
                <div className="grid grid-cols-2 gap-2">
                  {newPostImages.map((img, idx) => (
                    <div
                      key={idx}
                      className="relative aspect-square rounded-lg overflow-hidden group"
                    >
                      <img
                        src={img}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                      <button
                        onClick={() =>
                          setNewPostImages(
                            newPostImages.filter((_, i) => i !== idx)
                          )
                        }
                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full transition opacity-0 group-hover:opacity-100"
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
                  ))}
                </div>
              )}

              {/* Add Image URL */}
              <div className="border-2 border-gray-200 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <FaImage className="text-blue-600" />
                  Thêm ảnh
                </p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={imageUrlInput}
                    onChange={(e) => setImageUrlInput(e.target.value)}
                    placeholder="Nhập URL ảnh (https://...)"
                    className="flex-1 px-4 py-2.5 border-2 border-gray-200 rounded-lg
                             focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                             text-sm text-gray-800 placeholder-gray-400 transition-all"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && imageUrlInput.trim()) {
                        setNewPostImages([
                          ...newPostImages,
                          imageUrlInput.trim(),
                        ]);
                        setImageUrlInput("");
                      }
                    }}
                  />
                  <button
                    onClick={() => {
                      if (imageUrlInput.trim()) {
                        setNewPostImages([
                          ...newPostImages,
                          imageUrlInput.trim(),
                        ]);
                        setImageUrlInput("");
                      }
                    }}
                    disabled={!imageUrlInput.trim()}
                    className="px-4 py-2.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600
                             disabled:opacity-40 disabled:cursor-not-allowed transition-all
                             font-medium text-sm"
                  >
                    Thêm
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Nhấn Enter hoặc nút Thêm để thêm ảnh
                </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4">
              <button
                onClick={() => {
                  handlePost();
                  setShowCreatePostModal(false);
                  setNewPostImages([]);
                  setImageUrlInput("");
                }}
                disabled={!newPost.trim()}
                className="w-full px-6 py-3 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl 
                         hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
                         font-semibold shadow-md transition-all transform hover:scale-[1.02]"
              >
                Đăng bài
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Action Button */}
      <div className="fixed bottom-8 right-8 z-50">
        {showFAB && (
          <div className="absolute bottom-20 right-0 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl border border-white/50 p-4 space-y-2 min-w-[200px] animate-slideUp">
            <button
              onClick={() => {
                setShowCreatePostModal(true);
                setShowFAB(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-green-50 rounded-xl transition-all group"
            >
              <div className="p-2 bg-green-100 rounded-lg group-hover:bg-green-200 transition">
                <FaHashtag className="text-green-600" />
              </div>
              <span className="font-semibold text-gray-700 group-hover:text-green-600">
                Tạo bài viết
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab("chat");
                setShowFAB(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-blue-50 rounded-xl transition-all group"
            >
              <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition">
                <FaComments className="text-blue-600" />
              </div>
              <span className="font-semibold text-gray-700 group-hover:text-blue-600">
                Nhắn tin
              </span>
            </button>
            <button
              onClick={() => {
                setActiveTab("resources");
                setShowFAB(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-purple-50 rounded-xl transition-all group"
            >
              <div className="p-2 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition">
                <FaFileAlt className="text-purple-600" />
              </div>
              <span className="font-semibold text-gray-700 group-hover:text-purple-600">
                Tải tài liệu
              </span>
            </button>
          </div>
        )}

        <button
          onClick={() => setShowFAB(!showFAB)}
          className={`w-16 h-16 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full shadow-2xl hover:shadow-3xl transition-all transform hover:scale-110 flex items-center justify-center ${
            showFAB ? "rotate-45" : ""
          }`}
        >
          <FaPlus className="text-2xl" />
        </button>
      </div>
    </div>
  );
}
