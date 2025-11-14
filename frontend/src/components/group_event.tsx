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
  FaChevronDown,
  FaPlus,
  FaCog,
  FaBell,
  FaSearch,
  FaThumbsUp,
  FaPaperclip,
  FaGift,
  FaVideo,
  FaMicrophone,
  FaEdit,
  FaTrash,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaComments,
  FaClock,
} from "react-icons/fa";
import api from  "@/utils/api";
interface User {
  id: number;
  name: string;
  avatar: string;
  role: "user" | "manager" | "admin";
}

interface Post {
  id: number;
  eventId: string;  // ID từ database
  content: string;
  author: User;
  images?: string[];
  timestamp: string;
  likes: number;
  comments: Comment[];
  shares: number;
  isLiked: boolean;
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

interface Event {
  id: number;
  eventId: string;  // ID từ database
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

interface GroupProps {
  eventId: string;
  role?: "user" | "manager" | "admin";
}

// Mock current user
const currentUser: User = {
  id: 1,
  name: "Bạn",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
  role: "user"
};

// Mock events data - danh sách đầy đủ các events
const mockEvents: Event[] = [
  {
    id: 1,
    eventId: "evt_001",
    title: "Trồng cây xanh - Vì môi trường sạch",
    description: "Cùng nhau trồng cây tại công viên để tạo ra không gian xanh, sạch cho cộng đồng. Hoạt động bao gồm trồng cây, tưới nước và chăm sóc cây con.",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&h=400&fit=crop",
    date: "2025-10-15",
    time: "07:00 - 11:00",
    location: "Công viên Tao Đàn, Quận 1, TP.HCM",
    maxParticipants: 100,
    currentParticipants: 45,
    category: "Môi trường",
    organizer: {
      id: 2,
      name: "Trần Thị B",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b2e4a0ee?w=150&h=150&fit=crop&crop=face",
      role: "manager"
    },
    status: "ongoing",
    isHidden: false,
    approvalStatus: "approved",
    createdAt: "2025-10-01"
  },
  {
    id: 2,
    eventId: "evt_002",
    title: "Dạy học miễn phí cho trẻ em vùng cao",
    description: "Chương trình giáo dục tình nguyện dành cho trẻ em ở vùng núi cao. Chúng ta sẽ dạy các môn cơ bản và tặng sách vở, dụng cụ học tập.",
    image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&h=400&fit=crop",
    date: "2025-10-20",
    time: "Cả ngày (3 ngày 2 đêm)",
    location: "Sapa, Lào Cai",
    maxParticipants: 20,
    currentParticipants: 12,
    category: "Giáo dục",
    organizer: {
      id: 3,
      name: "Lê Văn C",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      role: "manager"
    },
    status: "upcoming",
    isHidden: false,
    approvalStatus: "approved",
    createdAt: "2025-09-25"
  },
  {
    id: 3,
    eventId: "evt_003",
    title: "Nấu cơm từ thiện cuối tuần",
    description: "Chuẩn bị và phục vụ bữa ăn miễn phí cho người vô gia cư và người nghèo trong khu vực. Mang đến sự ấm áp và tình người.",
    image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=400&fit=crop",
    date: "2025-10-14",
    time: "16:00 - 20:00",
    location: "Chùa Vĩnh Nghiêm, Quận 3, TP.HCM",
    maxParticipants: 80,
    currentParticipants: 67,
    category: "Xã hội",
    organizer: {
      id: 1,
      name: "Nguyễn Văn A",
      avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
      role: "user"
    },
    status: "upcoming",
    isHidden: true,
    approvalStatus: "approved",
    createdAt: "2025-10-02"
  },
  {
    id: 4,
    eventId: "evt_004",
    title: "Hiến máu tình nguyện",
    description: "Chương trình hiến máu nhân đạo để cứu giúp những bệnh nhân đang cần máu điều trị. Mỗi đơn vị máu có thể cứu được 3 sinh mạng.",
    image: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=600&h=400&fit=crop",
    date: "2025-10-18",
    time: "08:00 - 17:00",
    location: "Viện Huyết học Truyền máu TP.HCM",
    maxParticipants: 200,
    currentParticipants: 89,
    category: "Y tế",
    organizer: {
      id: 4,
      name: "Phạm Thị D",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      role: "manager"
    },
    status: "upcoming",
    isHidden: false,
    approvalStatus: "approved",
    createdAt: "2025-09-30"
  },
  {
    id: 5,
    eventId: "evt_005",
    title: "Dọn dẹp bãi biển Vũng Tàu",
    description: "Hoạt động dọn dẹp rác thải trên bãi biển để bảo vệ môi trường biển và tạo không gian sạch đẹp cho du khách.",
    image: "https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=600&h=400&fit=crop",
    date: "2025-10-25",
    time: "06:00 - 10:00",
    location: "Bãi biển Thùy Vân, Vũng Tàu",
    maxParticipants: 50,
    currentParticipants: 0,
    category: "Môi trường",
    organizer: {
      id: 3,
      name: "Lê Văn C",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      role: "manager"
    },
    status: "upcoming",
    isHidden: false,
    approvalStatus: "pending",
    createdAt: "2025-10-09"
  }
];

// Mock chat messages cho từng event
const mockChatMessages: Record<string, ChatMessage[]> = {
  "evt_001": [
    {
      id: 1,
      userId: 2,
      userName: "Nguyễn Văn An",
      userAvatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      message: "Xin chào mọi người! Sự kiện trồng cây sẽ diễn ra lúc 7h sáng nhé! 🌱",
      timestamp: "10:30",
      isCurrentUser: false,
    },
    {
      id: 2,
      userId: 3,
      userName: "Trần Thị Bình",
      userAvatar: "https://images.unsplash.com/photo-1494790108755-2616b2e4a0ee?w=150&h=150&fit=crop&crop=face",
      message: "Đã chuẩn bị xẻng và găng tay rồi! 🧤",
      timestamp: "10:32",
      isCurrentUser: false,
    },
  ],
  "evt_002": [
    {
      id: 1,
      userId: 3,
      userName: "Lê Văn C",
      userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      message: "Các bạn nhớ mang theo sách vở cũ để tặng các em nhé! 📚",
      timestamp: "09:15",
      isCurrentUser: false,
    },
  ],
  "evt_003": [
    {
      id: 1,
      userId: 1,
      userName: "Nguyễn Văn A",
      userAvatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
      message: "Cần thêm vài người giúp nấu cơm. Ai rảnh thì tham gia nhé! 🍚",
      timestamp: "14:20",
      isCurrentUser: false,
    },
  ],
  "evt_004": [
    {
      id: 1,
      userId: 4,
      userName: "Phạm Thị D",
      userAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      message: "Nhớ ăn sáng đầy đủ trước khi đến hiến máu nhé! �❤️",
      timestamp: "07:45",
      isCurrentUser: false,
    },
  ],
  "evt_005": [
    {
      id: 1,
      userId: 3,
      userName: "Lê Văn C",
      userAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      message: "Sự kiện dọn biển sẽ bắt đầu sớm để tránh nắng. Mọi người chuẩn bị sẵn sàng! 🏖️",
      timestamp: "05:30",
      isCurrentUser: false,
    },
  ],
};

// Mock posts cho từng event
const mockPostsByEvent: Record<string, Post[]> = {
  "evt_001": [
    {
      id: 1,
      eventId: "evt_001",
      content: "Hôm nay chúng mình đã trồng được 50 cây xanh tại công viên! Cảm ơn tất cả mọi người đã nhiệt tình tham gia. Môi trường xanh - sạch - đẹp là trách nhiệm của chúng ta! ��",
      images: [
        "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1574263867128-a3d5c1b1deae?w=800&h=600&fit=crop",
      ],
      timestamp: "2 giờ trước",
      author: {
        id: 2,
        name: "Trần Thị B",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b2e4a0ee?w=150&h=150&fit=crop&crop=face",
        role: "manager"
      },
      likes: 45,
      shares: 5,
      isLiked: false,
      comments: [
        {
          id: 1,
          content: "Tuyệt vời! Hẹn gặp mọi người lần sau 🌱",
          timestamp: new Date().toLocaleString(),
          author: {
            id: 3,
            name: "Nguyễn Văn An",
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
            role: "user"
          },
          likes: 2,
          isLiked: false,
          replies: []
        }
      ]
    }
  ],
  "evt_002": [
    {
      id: 2,
      eventId: "evt_002",
      content: "Chuẩn bị sách vở và đồ dùng học tập để mang lên Sapa cho các em! Ai có sách cũ thì mang theo nhé 📚✏️",
      images: [
        "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
      ],
      timestamp: "1 ngày trước",
      author: {
        id: 3,
        name: "Lê Văn C",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        role: "manager"
      },
      likes: 23,
      shares: 3,
      isLiked: true,
      comments: []
    }
  ],
  "evt_003": [
    {
      id: 3,
      eventId: "evt_003",
      content: "Hôm nay chúng ta đã nấu được 200 suất cơm để phát cho bà con nghèo! Cảm ơn mọi người đã đóng góp tâm huyết 🍚❤️",
      images: [
        "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=600&fit=crop",
      ],
      timestamp: "4 giờ trước",
      author: {
        id: 1,
        name: "Nguyễn Văn A",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face",
        role: "user"
      },
      likes: 67,
      shares: 12,
      isLiked: false,
      comments: []
    }
  ],
  "evt_004": [
    {
      id: 4,
      eventId: "evt_004",
      content: "Thông báo: Sự kiện hiến máu sẽ có xe đưa đón từ trung tâm thành phố. Liên hệ với ban tổ chức để đăng ký 🚌🩸",
      timestamp: "6 giờ trước",
      author: {
        id: 4,
        name: "Phạm Thị D",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        role: "manager"
      },
      likes: 34,
      shares: 8,
      isLiked: false,
      comments: []
    }
  ],
  "evt_005": [
    {
      id: 5,
      eventId: "evt_005",
      content: "Chuẩn bị cho sự kiện dọn bãi biển! Mọi người nhớ mang theo găng tay, túi rác và kem chống nắng nhé 🏖️🧤",
      timestamp: "12 giờ trước",
      author: {
        id: 3,
        name: "Lê Văn C",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        role: "manager"
      },
      likes: 18,
      shares: 2,
      isLiked: true,
      comments: []
    }
  ]
};

export default function Group({ eventId, role = "user" }: GroupProps) {
  
  // States
  const [isLoading, setIsLoading] = useState(true);
  const [event, setEvent] = useState<Event | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages[eventId] || []);
  const [newMessage, setNewMessage] = useState("");
  const [newPost, setNewPost] = useState("");
  const [postImages, setPostImages] = useState<string[]>([]);
  const [showComments, setShowComments] = useState<Record<number, boolean>>({});
  const [newComment, setNewComment] = useState<Record<string, string>>({});
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Effects
  useEffect(() => {
    const fetchEventDetail = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching event with ID:", eventId);
        const response = await api.get(`events/getEventDetails/${eventId}`);
        console.log("Response:", response);
        if (response.data && response.data.event) {
          console.log("Fetched event details:", response.data.event);
          const eventData = response.data.event;
          
          // Normalize event data - add default values for missing fields
          const normalizedEvent: Event = {
            id: eventData.id || parseInt(eventId),
            eventId: eventData.eventId || eventId,
            title: eventData.title || "Sự kiện",
            description: eventData.description || "Chưa có mô tả",
            image: eventData.image || "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&h=400&fit=crop",
            date: eventData.date || eventData.start_date || "Chưa xác định",
            time: eventData.time || "Chưa xác định",
            location: eventData.location || "Chưa xác định",
            maxParticipants: eventData.maxParticipants || eventData.max_participants || 0,
            currentParticipants: eventData.currentParticipants || eventData.current_participants || 0,
            category: eventData.category || "Khác",
            organizer: eventData.organizer || {
              id: eventData.creator_id || 1,
              name: eventData.creator?.name || "Ban tổ chức",
              avatar: eventData.creator?.avatar || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop",
              role: "manager" as const
            },
            status: eventData.status || "upcoming",
            isHidden: eventData.isHidden || false,
            approvalStatus: eventData.approvalStatus || eventData.approval_status || "approved",
            createdAt: eventData.createdAt || eventData.created_at || new Date().toISOString()
          };
          
          setEvent(normalizedEvent);
        }
      } catch (error: any) {
        console.error("Error fetching event details:", error);
        console.error("Error response:", error.response?.data);
        console.error("Error status:", error.response?.status);
        
        // Fallback to mock data if API fails
        console.log("Falling back to mock data...");
        const mockEvent = mockEvents.find(e => e.id === parseInt(eventId));
        if (mockEvent) {
          console.log("Using mock event:", mockEvent);
          setEvent(mockEvent);
          const mockPosts = mockPostsByEvent[mockEvent.eventId];
          if (mockPosts) {
            setPosts(mockPosts);
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchEventDetail();
  }, [eventId]);

  // useEffect(() => {
  //   // TODO: Fetch posts
  //   // fetch(`/api/events/${eventId}/posts`).then(...)
  // }, [eventId]);

  useEffect(() => {
    if (showChat && chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, showChat]);

  // Handlers
  const handlePost = () => {
    if (!newPost.trim()) return;

    const post: Post = {
      id: posts.length + 1,
      eventId,
      content: newPost,
      images: postImages,
      timestamp: "Vừa xong",
      author: currentUser,
      likes: 0,
      comments: [],
      shares: 0,
      isLiked: false,
    };

    setPosts([post, ...posts]);
    setNewPost("");
    setPostImages([]);
  };

  const handleLike = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          isLiked: !post.isLiked,
          likes: post.isLiked ? post.likes - 1 : post.likes + 1
        };
      }
      return post;
    }));
  };

  const handleShare = (postId: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        return { ...post, shares: post.shares + 1 };
      }
      return post;
    }));
    alert("Đã chia sẻ bài viết!");
  };

  const handleComment = (postId: number, parentCommentId?: number) => {
    const comment = newComment[postId];
    if (!comment?.trim()) return;

    const newCommentObj: Comment = {
      id: Date.now(),
      content: comment,
      timestamp: new Date().toLocaleString(),
      author: currentUser,
      likes: 0,
      isLiked: false,
      replies: [],
      parentId: parentCommentId
    };

    setPosts(posts.map(post => {
      if (post.id === postId) {
        if (parentCommentId) {
          // Adding reply to a comment
          const updatedComments = post.comments.map(c => {
            if (c.id === parentCommentId) {
              return {
                ...c,
                replies: [...c.replies, newCommentObj]
              };
            }
            return c;
          });
          return {
            ...post,
            comments: updatedComments
          };
        } else {
          // Adding new top-level comment
          return {
            ...post,
            comments: [...post.comments, newCommentObj]
          };
        }
      }
      return post;
    }));

    setNewComment({ ...newComment, [postId]: "" });
  };

  const handleLikeComment = (postId: number, commentId: number, isReply: boolean = false, parentCommentId?: number) => {
    setPosts(posts.map(post => {
      if (post.id === postId) {
        let updatedComments;
        if (isReply && parentCommentId) {
          // Handling reply likes
          updatedComments = post.comments.map(c => {
            if (c.id === parentCommentId) {
              return {
                ...c,
                replies: c.replies.map(r => {
                  if (r.id === commentId) {
                    return {
                      ...r,
                      isLiked: !r.isLiked,
                      likes: r.isLiked ? r.likes - 1 : r.likes + 1
                    };
                  }
                  return r;
                })
              };
            }
            return c;
          });
        } else {
          // Handling top-level comment likes
          updatedComments = post.comments.map(c => {
            if (c.id === commentId) {
              return {
                ...c,
                isLiked: !c.isLiked,
                likes: c.isLiked ? c.likes - 1 : c.likes + 1
              };
            }
            return c;
          });
        }
        return {
          ...post,
          comments: updatedComments
        };
      }
      return post;
    }));
  };

  const handleSendMessage = () => {
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: messages.length + 1,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      message: newMessage,
      timestamp: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit"
      }),
      isCurrentUser: true
    };

    setMessages([...messages, message]);
    setNewMessage("");
  };

  if (isLoading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-500">Đang tải sự kiện...</p>
    </div>
  );
}

  // Loading state nếu không tìm thấy event
  if (!event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy sự kiện</h1>
          <p className="text-gray-600">Sự kiện với ID "{eventId}" không tồn tại.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-white flex">
      <div className="flex w-full">
      {/* Left Sidebar - Event Info + Joined Events */}
      <div className="hidden lg:flex lg:flex-col w-80 xl:w-96 bg-white border-r border-gray-200 h-screen overflow-hidden">
        {/* Current Event Info - Full Display, No Scroll */}
        <div className="flex-shrink-0 border-b border-gray-200">
        <div className="p-6 space-y-5">
          {/* Event Cover */}
          <div className="relative h-56 rounded-xl overflow-hidden shadow-lg">
            <Image
              src={event.image || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&h=300&fit=crop'}
              alt={event.title}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            <div className="absolute bottom-3 left-3 right-3">
              <h2 className="text-white font-bold text-lg line-clamp-2">{event.title}</h2>
            </div>
          </div>

          {/* Event Details */}
          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FaCalendarAlt className="text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase font-semibold">Thời gian</p>
                <p className="text-sm font-medium text-gray-800">{event.date}</p>
                <p className="text-xs text-gray-600">{event.time}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <FaMapMarkerAlt className="text-red-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase font-semibold">Địa điểm</p>
                <p className="text-sm font-medium text-gray-800 line-clamp-2">{event.location}</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <FaUsers className="text-green-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 uppercase font-semibold">Thành viên</p>
                <p className="text-sm font-medium text-gray-800">
                  {event.currentParticipants}/{event.maxParticipants} người
                </p>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                    style={{ 
                      width: `${Math.min((event.currentParticipants / event.maxParticipants) * 100, 100)}%` 
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="p-4 bg-gradient-to-br from-blue-50 to-green-50 rounded-xl">
            <h3 className="text-sm font-semibold text-gray-800 mb-2 flex items-center">
              <FaHashtag className="mr-2 text-blue-600" />
              Mô tả sự kiện
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">{event.description}</p>
          </div>

          {/* Organizer */}
          <div className="p-4 bg-white border border-gray-200 rounded-xl">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">Ban tổ chức</h3>
            <div className="flex items-center space-x-3">
              <Image
                src={event.organizer.avatar}
                alt={event.organizer.name}
                width={48}
                height={48}
                className="rounded-full"
                unoptimized
              />
              <div>
                <p className="font-semibold text-gray-800">{event.organizer.name}</p>
                <p className="text-xs text-gray-500 capitalize">{event.organizer.role}</p>
              </div>
            </div>
          </div>
        </div>
        </div>

        {/* Joined Events List - Recent/Featured Only */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3 flex items-center">
              <FaCalendarAlt className="mr-2 text-green-600" />
              Truy cập gần đây
            </h3>
            <div className="space-y-1">
              {/* Mock joined events - replace with real data */}
              {[
                { id: 1, title: 'Dọn rác bãi biển Vũng Tàu', image: 'https://images.unsplash.com/photo-1618477388954-7852f32655ec?w=100' },
                { id: 2, title: 'Trồng cây xanh Hà Nội', image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=100' },
                { id: 3, title: 'Hỗ trợ người già Neo', image: 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=100' },
              ].map((evt) => (
                <button
                  key={evt.id}
                  className="w-full flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50 transition-colors text-left group"
                >
                  <Image
                    src={evt.image}
                    alt={evt.title}
                    width={36}
                    height={36}
                    className="rounded-lg object-cover"
                    unoptimized
                  />
                  <span className="flex-1 text-xs text-gray-600 group-hover:text-gray-900 line-clamp-2">{evt.title}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Posts Feed */}
      <div className="flex-1 overflow-y-auto bg-gray-50">
        <div className="max-w-2xl lg:max-w-3xl mx-auto py-4 px-3">
        {/* Mobile Event Header */}
        <div className="lg:hidden bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-3">
          <div className="flex items-center space-x-4">
            <Image
              src={event.image || 'https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=100&h=100&fit=crop'}
              alt={event.title}
              width={60}
              height={60}
              className="rounded-xl object-cover"
              unoptimized
            />
            <div className="flex-1">
              <h1 className="text-xl font-bold text-gray-900 line-clamp-1">{event.title}</h1>
              <p className="text-sm text-gray-500">{event.currentParticipants}/{event.maxParticipants} thành viên</p>
            </div>
          </div>
        </div>

        {/* Create Post Card */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-4 mb-3">
          <div className="flex items-start space-x-3 mb-4">
            <Image
              src={currentUser.avatar}
              alt={currentUser.name}
              width={48}
              height={48}
              className="rounded-full"
              unoptimized
            />
            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder={`${currentUser.name} ơi, bạn đang nghĩ gì về sự kiện này?`}
              className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl 
                        focus:ring-2 focus:ring-blue-400 focus:border-blue-400 
                        resize-none text-gray-800 placeholder-gray-400 transition-all"
              rows={3}
            />
          </div>
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1">
              <button className="p-2.5 text-gray-500 hover:text-blue-600 rounded-xl hover:bg-blue-50 transition-all">
                <FaImage className="w-5 h-5" />
              </button>
              <button className="p-2.5 text-gray-500 hover:text-green-600 rounded-xl hover:bg-green-50 transition-all">
                <FaSmile className="w-5 h-5" />
              </button>
              <button className="p-2.5 text-gray-500 hover:text-purple-600 rounded-xl hover:bg-purple-50 transition-all">
                <FaPaperclip className="w-5 h-5" />
              </button>
              <button className="p-2.5 text-gray-500 hover:text-red-600 rounded-xl hover:bg-red-50 transition-all">
                <FaVideo className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={handlePost}
              disabled={!newPost.trim()}
              className="px-6 py-2.5 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-xl 
                       hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed
                       font-semibold shadow-lg transition-all transform hover:scale-105"
            >
              Đăng bài
            </button>
          </div>
        </div>

        {/* Posts Feed */}
        <div className="space-y-3">
          {posts.length === 0 && (
            <div className="bg-white rounded-xl shadow-md border border-gray-200 p-12 text-center">
              <div className="text-gray-400 mb-4">
                <FaComment className="text-6xl mx-auto mb-4" />
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa có bài viết nào</h3>
              <p className="text-gray-500">Hãy là người đầu tiên chia sẻ về sự kiện này!</p>
            </div>
          )}
          
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden 
                                        hover:shadow-lg hover:border-gray-300 transition-all duration-200">
              {/* Post Header */}
              <div className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <Image 
                        src={post.author.avatar} 
                        alt={post.author.name}
                        width={48}
                        height={48}
                        className="rounded-full ring-2 ring-blue-100"
                        unoptimized
                      />
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{post.author.name}</h3>
                      <p className="text-xs text-gray-500 flex items-center">
                        <FaClock className="mr-1" />
                        {post.timestamp}
                      </p>
                    </div>
                  </div>
                  {(role === "admin" || post.author.id === currentUser.id) && (
                    <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-all">
                      <FaEllipsisV />
                    </button>
                  )}
                </div>
                
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{post.content}</p>
              </div>
              
              {/* Post Images */}
              {post.images && post.images.length > 0 && (
                <div className={`grid gap-1 ${post.images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {post.images.map((image, index) => (
                    <div key={index} className="relative aspect-square overflow-hidden">
                      <Image
                        src={image}
                        alt={`Post image ${index + 1}`}
                        fill
                        className="object-cover hover:scale-110 transition-transform duration-300"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}
              
              {/* Post Actions */}
              <div className="px-6 py-3 bg-gradient-to-r from-green-50/70 to-blue-50/70 border-y border-green-100">
                <div className="flex items-center justify-between text-sm">
                  <button
                    onClick={() => handleLike(post.id)}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-xl font-medium transition-all ${
                      post.isLiked 
                        ? 'bg-green-100 text-green-600' 
                        : 'text-gray-600 hover:bg-green-50 hover:text-green-600'
                    }`}
                  >
                    {post.isLiked ? <FaHeart className="w-5 h-5" /> : <FaRegHeart className="w-5 h-5" />}
                    <span>{post.likes}</span>
                  </button>
                  
                  <button
                    onClick={() => setShowComments({...showComments, [post.id]: !showComments[post.id]})}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-600 hover:bg-blue-50 hover:text-blue-600 font-medium transition-all"
                  >
                    <FaComment className="w-5 h-5" />
                    <span>{post.comments.length}</span>
                  </button>
                  
                  <button
                    onClick={() => handleShare(post.id)}
                    className="flex items-center space-x-2 px-4 py-2 rounded-xl text-gray-600 hover:bg-purple-50 hover:text-purple-600 font-medium transition-all"
                  >
                    <FaShare className="w-5 h-5" />
                    <span>{post.shares}</span>
                  </button>
                </div>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div className="px-6 py-4 space-y-4 bg-gradient-to-br from-green-50/30 to-blue-50/30">
                  {/* Add Comment Input */}
                  <div className="flex space-x-3">
                    <Image
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      width={36}
                      height={36}
                      className="rounded-full"
                      unoptimized
                    />
                    <div className="flex-1 flex items-center space-x-2">
                      <input
                        type="text"
                        value={newComment[post.id] || ''}
                        onChange={(e) => setNewComment({...newComment, [post.id]: e.target.value})}
                        placeholder="Viết bình luận của bạn..."
                        className="flex-1 px-4 py-2.5 bg-white border-2 border-gray-200 rounded-full 
                                 focus:ring-2 focus:ring-green-400 focus:border-green-400 
                                 text-gray-800 placeholder-gray-400 transition-all"
                        onKeyPress={(e) => e.key === "Enter" && handleComment(post.id)}
                      />
                      <button
                        onClick={() => handleComment(post.id)}
                        disabled={!newComment[post.id]?.trim()}
                        className="p-2.5 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full 
                                 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed
                                 transition-all transform hover:scale-110"
                      >
                        <FaPaperPlane className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Comments List */}
                  <div className="space-y-4">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <Image
                          src={comment.author.avatar}
                          alt={comment.author.name}
                          width={36}
                          height={36}
                          className="rounded-full"
                          unoptimized
                        />
                        <div className="flex-1">
                          <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
                            <div className="flex items-start justify-between mb-1">
                              <h4 className="font-semibold text-gray-900 text-sm">{comment.author.name}</h4>
                              <span className="text-xs text-gray-400">{comment.timestamp}</span>
                            </div>
                            <p className="text-gray-700 text-sm">{comment.content}</p>
                          </div>
                          
                          <div className="flex items-center space-x-4 mt-2 ml-2">
                            <button
                              onClick={() => handleLikeComment(post.id, comment.id)}
                              className={`text-xs font-medium flex items-center space-x-1 ${
                                comment.isLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                              } transition-all`}
                            >
                              {comment.isLiked ? <FaHeart className="w-3 h-3" /> : <FaRegHeart className="w-3 h-3" />}
                              <span>{comment.likes > 0 && comment.likes}</span>
                            </button>
                            <button
                              onClick={() => setNewComment({
                                ...newComment,
                                [`${post.id}-${comment.id}`]: ''
                              })}
                              className="text-xs font-medium text-gray-500 hover:text-green-600 transition-all"
                            >
                              Trả lời
                            </button>
                          </div>

                          {/* Reply Input */}
                          {newComment[`${post.id}-${comment.id}`] !== undefined && (
                              <div className="flex space-x-2 mt-2">
                                <Image
                                  src={currentUser.avatar}
                                  alt={currentUser.name}
                                  width={24}
                                  height={24}
                                  className="rounded-full"
                                />
                                <div className="flex-1">
                                  <input
                                    type="text"
                                    value={newComment[`${post.id}-${comment.id}`]}
                                    onChange={(e) => setNewComment({
                                      ...newComment,
                                      [`${post.id}-${comment.id}`]: e.target.value
                                    })}
                                    placeholder="Viết trả lời..."
                                    className="w-full px-3 py-1 border border-gray-300 rounded-full 
                                             focus:ring-2 focus:ring-blue-500 focus:border-transparent 
                                             text-sm text-gray-800 placeholder-gray-500"
                                  />
                                  <button
                                    onClick={() => {
                                      handleComment(post.id, comment.id);
                                      const { [`${post.id}-${comment.id}`]: _, ...rest } = newComment;
                                      setNewComment(rest);
                                    }}
                                    className="mt-1 px-3 py-1 bg-blue-600 text-white rounded-full text-xs hover:bg-blue-700"
                                  >
                                    Gửi
                                  </button>
                                </div>
                              </div>
                            )}

                          {/* Replies */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="ml-8 space-y-3 mt-3">
                              {comment.replies.map((reply) => (
                                <div key={reply.id} className="flex space-x-2">
                                  <Image
                                    src={reply.author.avatar}
                                    alt={reply.author.name}
                                    width={24}
                                    height={24}
                                    className="rounded-full"
                                    unoptimized
                                  />
                                  <div className="flex-1">
                                    <div className="bg-gray-50 rounded-lg p-2">
                                      <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-gray-900 text-sm">{reply.author.name}</h4>
                                        <span className="text-xs text-gray-500">{reply.timestamp}</span>
                                      </div>
                                      <p className="text-gray-800 text-sm mt-1">{reply.content}</p>
                                    </div>
                                    
                                    <div className="flex items-center space-x-4 mt-1 text-xs">
                                      <button
                                        onClick={() => handleLikeComment(post.id, reply.id, true, comment.id)}
                                        className={`${reply.isLiked ? 'text-blue-600' : 'text-gray-500'} hover:text-blue-600`}
                                      >
                                        {reply.likes} Thích
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        </div>
      </div>

      {/* Right Sidebar - Members List */}
      <div className="hidden lg:flex lg:flex-col w-72 xl:w-80 bg-white border-l border-gray-200 h-screen">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">Thành viên</h3>
            <span className="text-sm text-gray-500">{event.currentParticipants}</span>
          </div>
          <button
            onClick={() => setShowChat(!showChat)}
            className="w-full py-2 px-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg font-medium text-sm hover:shadow-lg transition-all flex items-center justify-center space-x-2"
          >
            <FaComments />
            <span>Mở chat nhóm</span>
          </button>
        </div>

        {/* Members List */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-1">
            {/* Mock members - replace with real data */}
            {[
              { id: 1, name: 'Nguyễn Văn A', avatar: 'https://i.pravatar.cc/150?img=1', online: true },
              { id: 2, name: 'Trần Thị B', avatar: 'https://i.pravatar.cc/150?img=2', online: true },
              { id: 3, name: 'Lê Văn C', avatar: 'https://i.pravatar.cc/150?img=3', online: false },
              { id: 4, name: 'Phạm Thị D', avatar: 'https://i.pravatar.cc/150?img=4', online: true },
              { id: 5, name: 'Hoàng Văn E', avatar: 'https://i.pravatar.cc/150?img=5', online: false },
              { id: 6, name: 'Vũ Thị F', avatar: 'https://i.pravatar.cc/150?img=6', online: true },
              { id: 7, name: 'Đặng Văn G', avatar: 'https://i.pravatar.cc/150?img=7', online: false },
              { id: 8, name: 'Bùi Thị H', avatar: 'https://i.pravatar.cc/150?img=8', online: true },
            ].map((member) => (
              <div
                key={member.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
              >
                <div className="relative">
                  <Image
                    src={member.avatar}
                    alt={member.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                    unoptimized
                  />
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    member.online ? 'bg-green-500' : 'bg-gray-400'
                  }`}></div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{member.name}</p>
                  <p className="text-xs text-gray-500">{member.online ? 'Đang hoạt động' : 'Không hoạt động'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Overlay - Facebook Style */}
      {showChat && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/20 z-40 lg:hidden"
            onClick={() => setShowChat(false)}
          ></div>
          
          {/* Chat Box */}
          <div className="fixed bottom-0 right-0 lg:right-4 lg:bottom-4 w-full lg:w-96 h-[70vh] lg:h-[600px] bg-white rounded-t-2xl lg:rounded-2xl shadow-2xl z-50 flex flex-col border border-gray-200">
            {/* Chat Header */}
            <div className="p-4 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-t-2xl lg:rounded-t-2xl flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <FaComments className="text-xl" />
                <div>
                  <h3 className="font-bold">Chat nhóm</h3>
                  <p className="text-xs text-green-100">{messages.length} tin nhắn</p>
                </div>
              </div>
              <button
                onClick={() => setShowChat(false)}
                className="p-2 hover:bg-white/20 rounded-lg transition-all"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-gradient-to-br from-green-50/40 to-blue-50/40">
              {messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center py-12">
                  <div className="bg-white rounded-full p-6 mb-4 shadow-lg">
                    <FaComments className="text-5xl text-gray-300" />
                  </div>
                  <h3 className="font-semibold text-gray-700 mb-2">Chưa có tin nhắn</h3>
                  <p className="text-sm text-gray-500 px-8">Hãy bắt đầu cuộc trò chuyện với các thành viên khác!</p>
                </div>
              ) : (
                <>
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex items-end space-x-2 ${
                        message.isCurrentUser ? "flex-row-reverse space-x-reverse" : "flex-row"
                      }`}
                    >
                      {!message.isCurrentUser && (
                        <Image
                          src={message.userAvatar}
                          alt={message.userName}
                          width={32}
                          height={32}
                          className="rounded-full ring-2 ring-white"
                          unoptimized
                        />
                      )}
                      <div className={`flex flex-col ${
                        message.isCurrentUser ? 'items-end' : 'items-start'
                      } max-w-[75%]`}>
                        {!message.isCurrentUser && (
                          <span className="text-xs font-medium text-gray-600 mb-1 ml-2">{message.userName}</span>
                        )}
                        <div
                          className={`relative px-4 py-2.5 rounded-2xl shadow-sm ${
                            message.isCurrentUser
                              ? "bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-br-sm"
                              : "bg-white text-gray-800 rounded-bl-sm border border-gray-100"
                          }`}
                        >
                          <p className="text-sm leading-relaxed">{message.message}</p>
                          <span className={`text-xs mt-1 block ${
                            message.isCurrentUser ? 'text-green-100' : 'text-gray-400'
                          }`}>
                            {message.timestamp}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 bg-gradient-to-r from-green-50 to-blue-50 border-t border-gray-200 rounded-b-2xl">
              <div className="flex items-center space-x-2 bg-white rounded-full shadow-md p-2">
                <button 
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                  title="Emoji"
                >
                  <FaSmile className="text-lg" />
                </button>
                <button 
                  className="p-2 text-gray-400 hover:text-green-500 hover:bg-green-50 rounded-full transition-colors"
                  title="Đính kèm file"
                >
                  <FaPaperclip className="text-lg" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Nhập tin nhắn..."
                  className="flex-1 bg-transparent px-3 py-2 focus:outline-none text-gray-700 placeholder-gray-400"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2.5 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-full hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FaPaperPlane />
                </button>
              </div>
            </div>
          </div>
        </>
      )}
      </div>
    </div>
  );
}