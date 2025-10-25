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
  FaPaperclip,
  FaGift,
  FaVideo,
  FaMicrophone,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

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
          }
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
  // Tìm event từ danh sách theo eventId
  const currentEvent = mockEvents.find(e => e.eventId === eventId);
  
  // States
  const [event, setEvent] = useState<Event | null>(currentEvent || null);
  const [posts, setPosts] = useState<Post[]>(mockPostsByEvent[eventId] || []);
  const [showChat, setShowChat] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages[eventId] || []);
  const [newMessage, setNewMessage] = useState("");
  const [newPost, setNewPost] = useState("");
  const [postImages, setPostImages] = useState<string[]>([]);
  const [showComments, setShowComments] = useState<Record<number, boolean>>({});
  const [newComment, setNewComment] = useState<Record<number, string>>({});
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Effects
  useEffect(() => {
    // Cập nhật event khi eventId thay đổi
    const foundEvent = mockEvents.find(e => e.eventId === eventId);
    setEvent(foundEvent || null);
    setPosts(mockPostsByEvent[eventId] || []);
    setMessages(mockChatMessages[eventId] || []);
    
    // TODO: Fetch event data from API
    // fetch(`/api/events/${eventId}`).then(...)
  }, [eventId]);

  useEffect(() => {
    // TODO: Fetch posts
    // fetch(`/api/events/${eventId}/posts`).then(...)
  }, [eventId]);

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

  const handleComment = (postId: number) => {
    const comment = newComment[postId];
    if (!comment?.trim()) return;

    setPosts(posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [...post.comments, {
            id: post.comments.length + 1,
            content: comment,
            timestamp: new Date().toLocaleString(),
            author: currentUser
          }]
        };
      }
      return post;
    }));

    setNewComment({ ...newComment, [postId]: "" });
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
    <div className="min-h-screen bg-gray-50 flex">
      {/* Main Content */}
      <div className="flex-1 max-w-4xl mx-auto px-4 py-8">
        {/* Event Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
            <button
              onClick={() => setShowChat(!showChat)}
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              {showChat ? "Ẩn chat" : "Hiện chat"}
            </button>
          </div>
          <p className="text-gray-600 mb-4">{event.description}</p>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            <span>🗓️ {event.date} • {event.time}</span>
            <span>📍 {event.location}</span>
            <span>👥 {event.currentParticipants}/{event.maxParticipants} người tham gia</span>
          </div>
        </div>

        {/* Create Post */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Chia sẻ cập nhật về sự kiện..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
          <div className="flex justify-between items-center mt-4">
            <div className="flex items-center space-x-2">
              <button className="p-2 text-gray-500 hover:text-blue-500 rounded-lg hover:bg-blue-50">
                <FaImage className="w-5 h-5" />
              </button>
              <button className="p-2 text-gray-500 hover:text-blue-500 rounded-lg hover:bg-blue-50">
                <FaSmile className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={handlePost}
              disabled={!newPost.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              Đăng bài
            </button>
          </div>
        </div>

        {/* Posts List */}
        <div className="space-y-6">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              {/* Post Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Image
                    src={post.author.avatar}
                    alt={post.author.name}
                    width={40}
                    height={40}
                    className="rounded-full"
                    unoptimized
                  />
                  <div className="ml-3">
                    <p className="font-medium text-gray-900">{post.author.name}</p>
                    <p className="text-sm text-gray-500">{post.timestamp}</p>
                  </div>
                </div>
                {(role === "admin" || post.author.id === currentUser.id) && (
                  <button className="text-gray-400 hover:text-gray-600">
                    <FaEllipsisV />
                  </button>
                )}
              </div>

              {/* Post Content */}
              <p className="text-gray-700 mb-4">{post.content}</p>

              {/* Post Images */}
              {post.images && post.images.length > 0 && (
                <div className="mb-4 grid gap-2 grid-cols-2">
                  {post.images.map((image, index) => (
                    <div key={index} className="relative pt-[75%]">
                      <Image
                        src={image}
                        alt={`Post image ${index + 1}`}
                        fill
                        className="absolute inset-0 object-cover rounded-lg"
                        unoptimized
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center space-x-4 border-t border-gray-100 pt-4">
                <button
                  onClick={() => handleLike(post.id)}
                  className={`flex items-center space-x-1 ${
                    post.isLiked ? "text-red-500" : "text-gray-500 hover:text-red-500"
                  }`}
                >
                  {post.isLiked ? <FaHeart /> : <FaRegHeart />}
                  <span>{post.likes}</span>
                </button>
                <button
                  onClick={() => setShowComments({ ...showComments, [post.id]: !showComments[post.id] })}
                  className="flex items-center space-x-1 text-gray-500 hover:text-blue-500"
                >
                  <FaComment />
                  <span>{post.comments.length}</span>
                </button>
                <button
                  onClick={() => handleShare(post.id)}
                  className="flex items-center space-x-1 text-gray-500 hover:text-green-500"
                >
                  <FaShare />
                  <span>{post.shares}</span>
                </button>
              </div>

              {/* Comments Section */}
              {showComments[post.id] && (
                <div className="mt-4 space-y-4">
                  {post.comments.map((comment) => (
                    <div key={comment.id} className="flex space-x-3">
                      <Image
                        src={comment.author.avatar}
                        alt={comment.author.name}
                        width={32}
                        height={32}
                        className="rounded-full"
                        unoptimized
                      />
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-lg px-4 py-2">
                          <p className="font-medium text-gray-900">
                            {comment.author.name}
                            <span className="ml-2 text-sm font-normal text-gray-500">
                              {comment.timestamp}
                            </span>
                          </p>
                          <p className="text-gray-700">{comment.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Add Comment */}
                  <div className="flex space-x-3">
                    <Image
                      src={currentUser.avatar}
                      alt={currentUser.name}
                      width={32}
                      height={32}
                      className="rounded-full"
                      unoptimized
                    />
                    <div className="flex-1">
                      <input
                        type="text"
                        value={newComment[post.id] || ""}
                        onChange={(e) => setNewComment({ ...newComment, [post.id]: e.target.value })}
                        placeholder="Viết bình luận..."
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        onKeyPress={(e) => e.key === "Enter" && handleComment(post.id)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Chat Sidebar */}
      {showChat && (
        <div className="w-96 bg-white border-l border-gray-200 flex flex-col h-screen sticky top-0">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Chat nhóm sự kiện</h2>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.isCurrentUser ? "justify-end" : "justify-start"
                }`}
              >
                {!message.isCurrentUser && (
                  <Image
                    src={message.userAvatar}
                    alt={message.userName}
                    width={32}
                    height={32}
                    className="rounded-full mr-2"
                    unoptimized
                  />
                )}
                <div
                  className={`max-w-[70%] ${
                    message.isCurrentUser
                      ? "bg-blue-500 text-white rounded-l-lg rounded-br-lg"
                      : "bg-gray-100 text-gray-700 rounded-r-lg rounded-bl-lg"
                  } px-4 py-2`}
                >
                  {!message.isCurrentUser && (
                    <p className="text-xs font-medium mb-1">{message.userName}</p>
                  )}
                  <p>{message.message}</p>
                  <p className="text-xs mt-1 opacity-70">{message.timestamp}</p>
                </div>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t border-gray-200">
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Nhập tin nhắn..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                onKeyPress={(e) => e.key === "Enter" && handleSendMessage()}
              />
              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg disabled:opacity-50"
              >
                <FaPaperPlane />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}