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
  FaUserCircle,
  FaCalendarAlt,
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
  title?: string;
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

  const [currentUserData, setCurrentUserData] = useState<User | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Helper function to validate and get safe avatar URL
  const getSafeAvatarUrl = (imageUrl: string | null | undefined): string => {
    const defaultAvatar = "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop";
    if (!imageUrl) return defaultAvatar;
    // Check if it's a valid URL (starts with http:// or https://)
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }
    return defaultAvatar;
  };

  // ✅ Sync currentUserData từ useAuth
  useEffect(() => {
    if (user) {
      setCurrentUserData({
        id: user.id,
        name: user.username || "User",
        avatar: getSafeAvatarUrl(user.image),
        role: user.role || "user",
      });
    }
  }, [user]);

  // ✅ STEP 1: Kiểm tra quyền truy cập TRƯỚC KHI fetch bất kỳ dữ liệu nào
  useEffect(() => {
    const checkAccess = async () => {
      try {
        console.log("🔐 Checking access for event:", eventId);

        // BƯỚC 1: Kiểm tra xem event đã được admin duyệt chưa
        const eventResponse = await authFetch(`/api/events/getEventDetails/${eventId}`);
        if (eventResponse.ok) {
          const eventData = await eventResponse.json();
          const event = eventData.event || eventData;
          console.log("📊 Event details:", event);

          // ⛔ Kiểm tra sự kiện đã được admin duyệt chưa (status phải là approved/accepted/ongoing/completed)
          const eventStatus = event.status;
          if (eventStatus === "pending" || eventStatus === "rejected") {
            setHasAccess(false);
            setAccessError(
              eventStatus === "pending"
                ? "Sự kiện này chưa được admin duyệt. Vui lòng chờ."
                : "Sự kiện này đã bị từ chối."
            );
            return;
          }

          // Nếu user là manager (author) của sự kiện, cho phép truy cập ngay
          if (user && (event.author_id === user.id || event.manager_id === user.id)) {
            console.log("✅ User is the event manager - access granted!");
            setHasAccess(true);
            return;
          }
        }

        // BƯỚC 2: Nếu không phải manager, kiểm tra registration
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

        // Kiểm tra trạng thái đăng ký - chấp nhận cả "approved" và "accepted"
        if (registration.status !== "approved" && registration.status !== "accepted") {
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
  }, [eventId, user]);

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
            // Backend có thể trả về {channel: {...}} hoặc trực tiếp {...}
            const channel = channelData.channel || channelData;
            if (channel && channel.id) {
              const fetchedChannelId = channel.id;
              console.log(
                `✅ Event ID: ${eventId} → Channel ID: ${fetchedChannelId}`
              );
              setChannelId(fetchedChannelId);
            } else {
              console.error("❌ No channel ID found in response:", channelData);
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
      if (!channelId || !currentUserData) return;

      console.log("🔄 Fetching posts for channel:", channelId);
      setLoadingPosts(true);

      try {
        // Gửi user_id để backend check is_liked
        const response = await authFetch(
          `/api/posts/channel/${channelId}?user_id=${currentUserData.id}`
        );
        
        if (!response.ok) {
          console.error("❌ Failed to fetch posts", response.status);
          setPosts([]); // Clear posts on error
          return;
        }

        const data = await response.json();
        const fetched = data.posts || data;

        console.log("📥 Fetched posts:", fetched);

        if (Array.isArray(fetched)) {
          const normalized = fetched.map((p: any) => {
            return {
              id: p.id,
              eventId: eventId,
              content: p.content || "",
              title: p.title || "",
              author: {
                id: p.user?.id || p.author_id,
                name: p.user?.username || p.username || p.name || "User",
                avatar: getSafeAvatarUrl(
                  p.user?.image ||
                  p.user?.avatar ||
                  p.image ||
                  p.avatar
                ),
                role: p.user?.role || p.role || "user",
              },
              images: p.image ? [p.image] : [],
              timestamp: new Date(p.created_at).toLocaleString("vi-VN"),
              likes: Number(p.likes_count || p.likes || 0),
              comments: (p.comments || []).map((c: any) => ({
                id: c.id,
                content: c.content,
                timestamp: new Date(c.created_at).toLocaleString("vi-VN"),
                author: {
                  id: c.user?.id || c.author?.id || c.author_id,
                  name: c.user?.username || c.user?.name || c.author?.username || c.author?.name || "User",
                  avatar: getSafeAvatarUrl(
                    c.user?.image ||
                    c.user?.avatar ||
                    c.author?.image ||
                    c.author?.avatar
                  ),
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
                    name: r.user?.username || r.user?.name || r.author?.username || r.author?.name || "User",
                    avatar: getSafeAvatarUrl(
                      r.user?.image ||
                      r.user?.avatar ||
                      r.author?.image ||
                      r.author?.avatar
                    ),
                    role: r.user?.role || r.author?.role || "user",
                  },
                  likes: 0,
                  isLiked: false,
                  replies: [],
                })),
              })),
              shares: 0,
              isLiked: p.is_liked === true || p.is_liked === 1,
              isPinned: p.status === "pinned",
              views: 0,
            };
          });

          console.log("✅ Normalized posts:", normalized.length, "posts");
          setPosts(normalized);
        } else {
          console.warn("⚠️ Invalid posts response format:", data);
          setPosts([]); // Clear posts if invalid format
        }
      } catch (error) {
        console.error("❌ Error fetching posts:", error);
        setPosts([]); // Clear posts on error
      } finally {
        setLoadingPosts(false);
      }
    };

    // Fetch posts ngay khi có channelId, không cần đợi activeTab
    if (channelId) {
      fetchPosts();
    }
  }, [channelId, eventId, currentUserData]);

  // Fetch messages when channel is available
  useEffect(() => {
    const fetchMessages = async () => {
      if (!channelId) return;
      try {
        setLoadingMessages(true);
        const response = await authFetch(`/api/messages/channel/${channelId}`);
        const data = await response.json();
        console.log("📥 Messages response:", data);
        
        // Backend trả về {messages: [...]}
        const messagesData = data.messages || data;
        
        if (messagesData && Array.isArray(messagesData)) {
          const normalizedMessages: ChatMessage[] = messagesData.map((msg: any) => ({
            id: msg.id,
            userId: msg.sender_id,
            userName: msg.sender?.username || msg.sender?.name || "User",
            userAvatar: getSafeAvatarUrl(
              msg.sender?.image ||
              msg.sender?.avatar
            ),
            message: msg.content,
            timestamp: new Date(msg.sent_at).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            }),
            isCurrentUser: currentUserData ? msg.sender_id === currentUserData.id : false,
          }));
          setMessages(normalizedMessages);
        }
      } catch (error) {
        console.error("❌ Error fetching messages:", error);
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
  }, [channelId, currentUserData]);

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
    if (postFilter === "myposts") return post.author.id === currentUserData!.id;
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
    if (!newPost.trim() && newPostImages.length === 0) {
      alert("Vui lòng nhập nội dung hoặc chọn ảnh!");
      return;
    }

    if (!channelId || !currentUserData) {
      alert("Không tìm thấy thông tin channel hoặc user!");
      return;
    }

    const postContent = newPost;
    const postImgs = [...newPostImages];

    // Clear form ngay
    setNewPost("");
    setNewPostImages([]);
    setImageUrlInput("");
    setShowFAB(false);
    setShowCreatePostModal(false);

    try {
      const response = await authFetch("/api/posts/channel", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          channel_id: channelId,
          content: postContent,
          image: postImgs[0] || null,
          author_id: currentUserData.id, // Thêm author_id để fallback nếu JWT không có auth()->id()
        }),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Failed to create post", response.status, text);
        throw new Error("Failed to create post");
      }

      const data = await response.json();
      console.log("✅ Post created successfully:", data);

      // Tạo post object mới và thêm vào đầu danh sách với đầy đủ dữ liệu
      if (data && data.post) {
        const createdPost = data.post;
        const newPostObj: Post = {
          id: createdPost.id,
          eventId: eventId,
          content: createdPost.content || postContent,
          title: createdPost.title || "",
          author: {
            id: createdPost.author_id || currentUserData.id,
            name: createdPost.user?.name || currentUserData.name,
            avatar: createdPost.user?.avatar || currentUserData.avatar,
            role: createdPost.user?.role || currentUserData.role,
          },
          images: createdPost.image ? [createdPost.image] : [],
          timestamp: new Date(createdPost.created_at || Date.now()).toLocaleString("vi-VN"),
          likes: Number(createdPost.likes_count || createdPost.likes || 0),
          comments: [],
          shares: 0,
          isLiked: false,
          isPinned: createdPost.status === "pinned",
          views: 0,
        };
        setPosts([newPostObj, ...posts]);
        alert("Đăng bài thành công! 🎉");
      }
    } catch (error) {
      console.error("❌ Error creating post:", error);

      // Rollback form
      setNewPost(postContent);
      setNewPostImages(postImgs);
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
      const endpoint = post.isLiked 
        ? `/api/likes/unlike/${postId}`
        : `/api/likes/like/${postId}`;
      
      const response = await authFetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to toggle like");
      }
    } catch (error) {
      console.error("❌ Error toggling like:", error);
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
      author: {
        id: currentUserData!.id,
        name: currentUserData!.name,
        avatar: currentUserData!.avatar || "",
        role: currentUserData!.role,
      },
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
          postId: postId,
          content: comment,
          parentId: parentCommentId || null,
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
    if (!newMessage.trim() || !channelId || !currentUserData) return;

    // Optimistic Update - Hiển thị tin nhắn ngay lập tức
    const tempId = Date.now();
    const optimisticMsg: ChatMessage = {
      id: tempId,
      userId: currentUserData.id,
      userName: currentUserData.name,
      userAvatar: currentUserData.avatar || "",
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

  if (!currentUserData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Đang tải thông tin người dùng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white">
      {/* Header Bar - Improved spacing */}
      <div className="bg-gradient-to-r from-green-100/80 via-blue-100/80 to-teal-100/80 backdrop-blur-lg border-b border-white/50 sticky top-[72px] z-40 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3">
          {/* Event Info Row */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center space-x-3">
              <button
                onClick={() => router.back()}
                className="p-2 hover:bg-white/60 rounded-lg transition-all"
              >
                <FaArrowLeft className="text-gray-700 text-lg" />
              </button>
              <div className="flex items-center space-x-3 bg-white/70 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-sm">
                <Image
                  src={event.image}
                  alt={event.title}
                  width={44}
                  height={44}
                  className="rounded-lg object-cover ring-2 ring-white shadow-sm"
                  unoptimized
                />
                <div>
                  <h1 className="text-base font-bold text-gray-900 line-clamp-1">
                    {event.title}
                  </h1>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                      {onlineMembers} online
                    </span>
                    <span>•</span>
                    <span>{event.currentParticipants} thành viên</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs Row */}
          <div className="flex items-center space-x-1.5 bg-white/50 backdrop-blur-sm rounded-xl p-1 shadow-sm">
            <button
              onClick={() => setActiveTab("posts")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === "posts"
                  ? "bg-white shadow-sm text-green-600"
                  : "text-gray-600 hover:text-gray-800 hover:bg-white/60"
              }`}
            >
              <FaHashtag className="text-sm" />
              <span>Bảng tin</span>
            </button>

            <button
              onClick={() => setActiveTab("chat")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === "chat"
                  ? "bg-white shadow-sm text-blue-600"
                  : "text-gray-600 hover:text-gray-800 hover:bg-white/60"
              }`}
            >
              <FaComments className="text-sm" />
              <span>Trò chuyện</span>
            </button>

            <button
              onClick={() => setActiveTab("resources")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                activeTab === "resources"
                  ? "bg-white shadow-sm text-purple-600"
                  : "text-gray-600 hover:text-gray-800 hover:bg-white/60"
              }`}
            >
              <FaFileAlt className="text-sm" />
              <span>Tài liệu</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content - Improved layout */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* POSTS TAB */}
        {activeTab === "posts" && (
          <div className="space-y-4">
            {/* Filter Bar - Compact */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 p-4">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="font-semibold text-gray-800 flex items-center gap-2 text-sm">
                  <FaFilter className="text-green-500" />
                  <span>Bộ lọc bài viết</span>
                </h2>
                <div className="flex gap-2 flex-wrap">
                  <button
                    onClick={() => setPostFilter("all")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      postFilter === "all"
                        ? "bg-gradient-to-r from-green-500 to-blue-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Tất cả
                  </button>
                  <button
                    onClick={() => setPostFilter("organizer")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      postFilter === "organizer"
                        ? "bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Từ BTC
                  </button>
                  <button
                    onClick={() => setPostFilter("media")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      postFilter === "media"
                        ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Ảnh & Video
                  </button>
                  <button
                    onClick={() => setPostFilter("myposts")}
                    className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      postFilter === "myposts"
                        ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    Bài của tôi
                  </button>
                </div>
              </div>
            </div>

            {/* Create Post Button - Compact */}
            <button
              onClick={() => setShowCreatePostModal(true)}
              className="w-full bg-white/90 backdrop-blur-sm rounded-xl shadow-md border border-gray-100 p-4 hover:shadow-lg transition-all group"
            >
              <div className="flex items-center gap-3">
                {currentUserData.avatar ? (
                  <Image
                    src={currentUserData.avatar}
                    alt={currentUserData.name}
                    width={44}
                    height={44}
                    className="rounded-full ring-2 ring-white shadow-sm"
                    unoptimized
                  />
                ) : (
                  <div className="w-11 h-11 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                    <FaUserCircle className="text-white text-xl" />
                  </div>
                )}
                <div className="flex-1 text-left px-4 py-2.5 bg-gray-50 group-hover:bg-gray-100 rounded-full transition-colors">
                  <p className="text-sm text-gray-500">
                    {currentUserData.name} ơi, bạn đang nghĩ gì về sự kiện này?
                  </p>
                </div>
              </div>
            </button>

            {/* Posts Feed */}
            {loadingPosts ? (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-white/50 p-20 text-center">
                <div className="w-16 h-16 mx-auto mb-4">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500"></div>
                </div>
                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                  Đang tải bài viết...
                </h3>
                <p className="text-sm text-gray-500">
                  Vui lòng chờ trong giây lát
                </p>
              </div>
            ) : posts.length === 0 ? (
              <div className="space-y-4">
                {/* Welcome Card - Improved design */}
                <div className="bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 rounded-xl shadow-md border border-green-200 p-8 text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-md">
                    <FaComment className="text-3xl text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Chào mừng đến với kênh sự kiện! 🎉
                  </h3>
                  <p className="text-sm text-gray-600 mb-5 max-w-lg mx-auto">
                    Đây là nơi tất cả thành viên có thể chia sẻ, trao đổi về sự kiện. 
                    Hãy là người đầu tiên tạo bài viết để bắt đầu cuộc trò chuyện!
                  </p>
                  <div className="flex justify-center gap-6">
                    <div className="text-xs text-gray-500 flex items-center gap-1.5">
                      <FaUsers className="text-green-500 text-sm" />
                      <span>{event?.currentParticipants || 0} thành viên</span>
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1.5">
                      <FaCalendarAlt className="text-blue-500 text-sm" />
                      <span>{event?.date}</span>
                    </div>
                    </div>
                  </div>
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
                          onClick={() => {
                            const profilePath = post.author.role === 'manager' 
                              ? `/manager/profile` 
                              : post.author.role === 'admin' 
                                ? `/admin/profile` 
                                : `/user/profile}`;
                            router.push(profilePath);
                          }}
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
                              onClick={() => {
                                const profilePath = post.author.role === 'manager' 
                                  ? `/manager/profile` 
                                  : post.author.role === 'admin' 
                                    ? `/admin/profile` 
                                    : `/user/profile`;
                                router.push(profilePath);
                              }}
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
                        {currentUserData.avatar ? (
                          <Image
                            src={currentUserData.avatar}
                            alt={currentUserData.name}
                            width={40}
                            height={40}
                            className="rounded-full ring-2 ring-white shadow-sm"
                            unoptimized
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                            <FaUserCircle className="text-white" />
                          </div>
                        )}
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
                                onClick={() => {
                                  const profilePath = comment.author.role === 'manager' 
                                    ? `/manager/profile` 
                                    : comment.author.role === 'admin' 
                                      ? `/admin/profile` 
                                      : `/user/profile`;
                                  router.push(profilePath);
                                }}
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
                                        onClick={() => {
                                          const profilePath = comment.author.role === 'manager' 
                                            ? `/manager/profile` 
                                            : comment.author.role === 'admin' 
                                              ? `/admin/profile` 
                                              : `/user/profile`;
                                          router.push(profilePath);
                                        }}
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
                                    {currentUserData.avatar ? (
                                      <Image
                                        src={currentUserData.avatar}
                                        alt={currentUserData.name}
                                        width={32}
                                        height={32}
                                        className="rounded-full flex-shrink-0"
                                        unoptimized
                                      />
                                    ) : (
                                      <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center">
                                        <FaUserCircle className="text-white text-sm" />
                                      </div>
                                    )}
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
                                            onClick={() => {
                                              const profilePath = reply.author.role === 'manager' 
                                                ? `/manager/profile` 
                                                : reply.author.role === 'admin' 
                                                  ? `/admin/profile` 
                                                  : `/user/profile`;
                                              router.push(profilePath);
                                            }}
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
                                                    onClick={() => {
                                                      const profilePath = reply.author.role === 'manager' 
                                                        ? `/manager/profile` 
                                                        : reply.author.role === 'admin' 
                                                          ? `/admin/profile` 
                                                          : `/user/profile`;
                                                      router.push(profilePath);
                                                    }}
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
                {currentUserData.avatar ? (
                  <Image
                    src={currentUserData.avatar}
                    alt={currentUserData.name}
                    width={52}
                    height={52}
                    className="rounded-full ring-2 ring-gray-200"
                    unoptimized
                  />
                ) : (
                  <div className="w-[52px] h-[52px] bg-gradient-to-br from-green-400 to-blue-400 rounded-full flex items-center justify-center ring-2 ring-gray-200">
                    <FaUserCircle className="text-white text-2xl" />
                  </div>
                )}
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
