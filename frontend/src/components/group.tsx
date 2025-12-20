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
} from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import { useReverbChannel } from "@/hooks/useReverbChannel";

// Mock current user
const currentUser = {
  id: 1,
  name: "Bạn",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
};

// Mock event groups data
const mockEventGroups = [
  {
    id: 1,
    name: "Dọn rác bãi biển",
    icon: "🏖️",
    color: "bg-blue-500",
    unreadCount: 3,
    lastMessage: "Hẹn gặp lại lần sau nhé!",
    isOnline: true,
  },
  {
    id: 2,
    name: "Trồng cây xanh",
    icon: "🌳",
    color: "bg-green-500",
    unreadCount: 0,
    lastMessage: "Cảm ơn mọi người đã tham gia!",
    isOnline: true,
  },
  {
    id: 3,
    name: "Chia sẻ thức ăn",
    icon: "🍲",
    color: "bg-orange-500",
    unreadCount: 7,
    lastMessage: "Còn ai cần đồ ăn không?",
    isOnline: false,
  },
  {
    id: 4,
    name: "Dạy học miễn phí",
    icon: "📚",
    color: "bg-purple-500",
    unreadCount: 1,
    lastMessage: "Buổi học tiếp theo là thứ 7",
    isOnline: true,
  },
  {
    id: 5,
    name: "Hiến máu nhân đạo",
    icon: "💉",
    color: "bg-red-500",
    unreadCount: 0,
    lastMessage: "Đã hoàn thành xuất sắc!",
    isOnline: false,
  },
];

// Mock posts data
const mockPosts = [
  {
    id: 1,
    groupId: 1,
    author: {
      id: 2,
      name: "Nguyễn Văn An",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    },
    content:
      "Hôm nay chúng mình đã dọn được 50kg rác tại bãi biển Vũng Tàu! Cảm ơn tất cả mọi người đã nhiệt tình tham gia. Môi trường xanh - sạch - đẹp là trách nhiệm của chúng ta! 🌊🌴",
    images: [
      "https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1621451537084-482c73073a0f?w=800&h=600&fit=crop",
    ],
    timestamp: "2 giờ trước",
    likes: 45,
    comments: 12,
    shares: 5,
    isLiked: false,
  },
  {
    id: 2,
    groupId: 2,
    author: {
      id: 3,
      name: "Trần Thị Bình",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b2e4a0ee?w=150&h=150&fit=crop&crop=face",
    },
    content:
      "200 cây xanh đã được trồng tại công viên Tao Đàn! 🌱 Cảm ơn các bạn tình nguyện viên đã đến sớm và làm việc cật lực. Hẹn gặp lại trong hoạt động tiếp theo!",
    images: [
      "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=600&fit=crop",
    ],
    timestamp: "5 giờ trước",
    likes: 89,
    comments: 23,
    shares: 8,
    isLiked: true,
  },
  {
    id: 3,
    groupId: 3,
    author: {
      id: 4,
      name: "Lê Minh Châu",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    },
    content:
      "Ngày hôm nay đã phát được 150 suất ăn cho người vô gia cư tại quận 1. Mọi người rất vui và biết ơn. Tình yêu thương lan tỏa! ❤️🍚",
    images: [
      "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1593113646773-028c64a8f1b8?w=800&h=600&fit=crop",
      "https://images.unsplash.com/photo-1532634993-15f421e42ec0?w=800&h=600&fit=crop",
    ],
    timestamp: "1 ngày trước",
    likes: 156,
    comments: 34,
    shares: 15,
    isLiked: true,
  },
  {
    id: 4,
    groupId: 4,
    author: {
      id: 5,
      name: "Phạm Văn Dũng",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
    },
    content:
      "Lớp học tiếng Anh miễn phí cho trẻ em đã bắt đầu! 25 em nhỏ rất hào hứng và chăm chỉ. Cùng nhau xây dựng tương lai tốt đẹp hơn cho các em! 📖✏️",
    images: [
      "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&h=600&fit=crop",
    ],
    timestamp: "2 ngày trước",
    likes: 67,
    comments: 18,
    shares: 9,
    isLiked: false,
  },
];

// Mock chat messages - Mỗi group có chat riêng
interface ChatMessage {
  id: number;
  userId: number;
  userName: string;
  userAvatar: string;
  message: string;
  timestamp: string;
  isCurrentUser: boolean;
}

const mockChatMessages: Record<number, ChatMessage[]> = {
  1: [
    // Dọn rác bãi biển
    {
      id: 1,
      userId: 2,
      userName: "Nguyễn Văn An",
      userAvatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      message:
        "Xin chào mọi người! Sự kiện dọn rác tuần sau sẽ diễn ra lúc 7h sáng nhé!",
      timestamp: "10:30",
      isCurrentUser: false,
    },
    {
      id: 2,
      userId: 3,
      userName: "Trần Thị Bình",
      userAvatar:
        "https://images.unsplash.com/photo-1494790108755-2616b2e4a0ee?w=150&h=150&fit=crop&crop=face",
      message: "Ok, mình sẽ đến đúng giờ! Đã chuẩn bị găng tay rồi 🧤",
      timestamp: "10:32",
      isCurrentUser: false,
    },
    {
      id: 3,
      userId: 1,
      userName: "Bạn",
      userAvatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      message: "Mình cũng vậy! Có cần mang theo túi rác không?",
      timestamp: "10:35",
      isCurrentUser: true,
    },
    {
      id: 4,
      userId: 2,
      userName: "Nguyễn Văn An",
      userAvatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      message:
        "Mang theo găng tay và túi đựng rác là được. Mọi thứ khác BTC đã chuẩn bị sẵn rồi!",
      timestamp: "10:37",
      isCurrentUser: false,
    },
    {
      id: 5,
      userId: 4,
      userName: "Lê Minh Châu",
      userAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      message: "Tuyệt vời! Hẹn gặp mọi người tại bãi biển! 🏖️👋",
      timestamp: "10:40",
      isCurrentUser: false,
    },
  ],
  2: [
    // Trồng cây xanh
    {
      id: 1,
      userId: 3,
      userName: "Trần Thị Bình",
      userAvatar:
        "https://images.unsplash.com/photo-1494790108755-2616b2e4a0ee?w=150&h=150&fit=crop&crop=face",
      message:
        "Chào mọi người! Ngày mai chúng ta trồng cây tại công viên Tao Đàn nhé 🌳",
      timestamp: "08:15",
      isCurrentUser: false,
    },
    {
      id: 2,
      userId: 1,
      userName: "Bạn",
      userAvatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      message: "Mình đã đăng ký rồi! Có cần mang gì không?",
      timestamp: "08:20",
      isCurrentUser: true,
    },
    {
      id: 3,
      userId: 3,
      userName: "Trần Thị Bình",
      userAvatar:
        "https://images.unsplash.com/photo-1494790108755-2616b2e4a0ee?w=150&h=150&fit=crop&crop=face",
      message:
        "Chỉ cần mang theo nón và nước uống thôi. Cây giống và dụng cụ đã có sẵn!",
      timestamp: "08:25",
      isCurrentUser: false,
    },
  ],
  3: [
    // Chia sẻ thức ăn
    {
      id: 1,
      userId: 4,
      userName: "Lê Minh Châu",
      userAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      message:
        "Hôm nay chúng ta sẽ phát cơm từ thiện tại quận 1. Ai có thể đến giúp không? 🍚",
      timestamp: "11:00",
      isCurrentUser: false,
    },
    {
      id: 2,
      userId: 1,
      userName: "Bạn",
      userAvatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      message: "Mình có thể đến được! Mấy giờ bắt đầu vậy?",
      timestamp: "11:05",
      isCurrentUser: true,
    },
    {
      id: 3,
      userId: 4,
      userName: "Lê Minh Châu",
      userAvatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      message: "2h chiều nhé! Cảm ơn bạn nhiều! ❤️",
      timestamp: "11:08",
      isCurrentUser: false,
    },
    {
      id: 4,
      userId: 2,
      userName: "Nguyễn Văn An",
      userAvatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      message: "Mình cũng đến! Có ai cần đi chung không?",
      timestamp: "11:15",
      isCurrentUser: false,
    },
  ],
  4: [
    // Dạy học miễn phí
    {
      id: 1,
      userId: 5,
      userName: "Phạm Văn Dũng",
      userAvatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      message: "Lớp học tiếng Anh miễn phí cho trẻ em sẽ bắt đầu thứ 7 này! 📚",
      timestamp: "14:30",
      isCurrentUser: false,
    },
    {
      id: 2,
      userId: 1,
      userName: "Bạn",
      userAvatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      message: "Mình có thể giúp dạy được! Cần chuẩn bị gì không?",
      timestamp: "14:35",
      isCurrentUser: true,
    },
    {
      id: 3,
      userId: 5,
      userName: "Phạm Văn Dũng",
      userAvatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face",
      message:
        "Tuyệt vời! Chỉ cần chuẩn bị giáo án đơn giản và tâm huyết thôi! ✏️",
      timestamp: "14:40",
      isCurrentUser: false,
    },
  ],
  5: [
    // Hiến máu nhân đạo
    {
      id: 1,
      userId: 2,
      userName: "Nguyễn Văn An",
      userAvatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
      message:
        "Chiến dịch hiến máu lần này rất thành công! Cảm ơn mọi người đã tham gia �❤️",
      timestamp: "16:00",
      isCurrentUser: false,
    },
    {
      id: 2,
      userId: 1,
      userName: "Bạn",
      userAvatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      message: "Lần sau có tổ chức nữa thì nhớ tag mình nhé!",
      timestamp: "16:05",
      isCurrentUser: true,
    },
    {
      id: 3,
      userId: 3,
      userName: "Trần Thị Bình",
      userAvatar:
        "https://images.unsplash.com/photo-1494790108755-2616b2e4a0ee?w=150&h=150&fit=crop&crop=face",
      message:
        "Đã hoàn thành xuất sắc! Hẹn gặp lại trong lần tổ chức tiếp theo! 🎉",
      timestamp: "16:10",
      isCurrentUser: false,
    },
  ],
};

export default function () {
  const [posts, setPosts] = useState(mockPosts);
  const [selectedGroup, setSelectedGroup] = useState(mockEventGroups[0]);
  const [showChat, setShowChat] = useState(false);
  const [chatMessagesByGroup, setChatMessagesByGroup] =
    useState(mockChatMessages);
  const [newMessage, setNewMessage] = useState("");
  const [newPost, setNewPost] = useState("");
  const [showComments, setShowComments] = useState<Record<number, boolean>>({});
  const [newComment, setNewComment] = useState<Record<number, string>>({});
  const [showGroupList, setShowGroupList] = useState(true);
  const chatMessagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auth (to get token for Reverb auth)
  const { user, token } = useAuth();

  // Connect to Reverb group channel for realtime chat/notifications
  useReverbChannel({
    groupId: selectedGroup?.id ?? null,
    authToken: token ?? null,
    onMessage: (data: any) => {
      console.log("[useReverbChannel] message received:", data);
      // Safe read group id from common payload shapes
      const gid =
        data.group_id ?? data.groupId ?? data.group ?? selectedGroup?.id;
      if (!gid) return;

      setChatMessagesByGroup((prev) => {
        const copy: typeof prev = { ...prev };
        const arr = copy[gid] ? [...copy[gid]] : [];
        const msg = {
          id: data.id ?? Date.now(),
          userId: data.user_id ?? data.userId ?? data.senderId ?? 0,
          userName:
            data.user_name ?? data.userName ?? data.senderName ?? "Người dùng",
          userAvatar: data.avatar ?? data.userAvatar ?? "",
          message: data.message ?? data.text ?? JSON.stringify(data),
          timestamp: data.timestamp ?? new Date().toLocaleTimeString(),
          isCurrentUser:
            (data.user_id ?? data.userId) === (user?.id ?? currentUser.id),
        };
        arr.push(msg);
        copy[gid] = arr;
        return copy;
      });
    },
    onMemberJoined: (d) => {
      console.log("[useReverbChannel] member joined:", d);
    },
    onMemberLeft: (d) => {
      console.log("[useReverbChannel] member left:", d);
    },
    onEvent: (eventName, payload) => {
      console.log(`[useReverbChannel] event ${eventName}:`, payload);
    },
  });

  // Get chat messages for selected group
  const currentChatMessages = chatMessagesByGroup[selectedGroup.id] || [];

  // Auto scroll to bottom when chat messages change or chat opens
  useEffect(() => {
    if (showChat && chatMessagesEndRef.current) {
      chatMessagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [currentChatMessages, showChat, selectedGroup.id]);

  // Filter posts by selected group
  const filteredPosts = posts.filter(
    (post) => post.groupId === selectedGroup.id
  );

  // Handle like post
  const handleLikePost = (postId: number) => {
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

  // Handle share post
  const handleSharePost = (postId: number) => {
    setPosts(
      posts.map((post) =>
        post.id === postId ? { ...post, shares: post.shares + 1 } : post
      )
    );
    alert("Đã chia sẻ bài viết!");
  };

  // Handle toggle comments
  const handleToggleComments = (postId: number) => {
    setShowComments((prev) => ({ ...prev, [postId]: !prev[postId] }));
  };

  // Handle add comment
  const handleAddComment = (postId: number) => {
    if (newComment[postId]?.trim()) {
      setPosts(
        posts.map((post) =>
          post.id === postId ? { ...post, comments: post.comments + 1 } : post
        )
      );
      setNewComment({ ...newComment, [postId]: "" });
    }
  };

  // Handle send message
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      const currentMessages = chatMessagesByGroup[selectedGroup.id] || [];
      const newMsg = {
        id: currentMessages.length + 1,
        userId: currentUser.id,
        userName: currentUser.name,
        userAvatar: currentUser.avatar,
        message: newMessage,
        timestamp: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        isCurrentUser: true,
      };

      // Update messages for the selected group only
      setChatMessagesByGroup({
        ...chatMessagesByGroup,
        [selectedGroup.id]: [...currentMessages, newMsg],
      });
      setNewMessage("");
    }
  };

  // Handle create post
  const handleCreatePost = () => {
    console.log("Creating post:", newPost);
    if (newPost.trim()) {
      const post = {
        id: posts.length + 1,
        groupId: selectedGroup.id,
        author: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar,
        },
        content: newPost,
        images: [],
        timestamp: "Vừa xong",
        likes: 0,
        comments: 0,
        shares: 0,
        isLiked: false,
      };
      setPosts([post, ...posts]);
      setNewPost("");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex overflow-hidden">
      {/* Left Sidebar - Group List (Discord Style) */}
      <div
        className={`${
          showGroupList ? "w-20" : "w-0"
        } bg-gray-900 flex flex-col items-center py-3 space-y-2 overflow-y-auto transition-all duration-300 flex-shrink-0`}
      >
        {/* Home Button */}
        <div className="w-12 h-12 bg-indigo-600 rounded-2xl hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer group relative">
          <FaUsers className="text-white text-xl" />
          <div className="absolute left-16 bg-gray-800 text-white px-3 py-2 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
            Tất cả nhóm
          </div>
        </div>

        {/* Separator */}
        <div className="w-8 h-0.5 bg-gray-700 rounded-full"></div>

        {/* Group Icons */}
        {mockEventGroups.map((group) => (
          <div
            key={group.id}
            onClick={() => {
              setSelectedGroup(group);
              setShowChat(false);
            }}
            className={`relative w-12 h-12 ${
              group.color
            } rounded-2xl hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer group ${
              selectedGroup.id === group.id ? "rounded-xl" : ""
            }`}
          >
            <span className="text-2xl">{group.icon}</span>

            {/* Unread Badge */}
            {group.unreadCount > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                {group.unreadCount}
              </div>
            )}

            {/* Online Indicator */}
            {group.isOnline && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-gray-900 rounded-full"></div>
            )}

            {/* Tooltip */}
            <div className="absolute left-16 bg-gray-800 text-white px-3 py-2 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
              {group.name}
            </div>

            {/* Active Indicator */}
            {selectedGroup.id === group.id && (
              <div className="absolute -left-3 w-1 h-8 bg-white rounded-r-full"></div>
            )}
          </div>
        ))}

        {/* Add Group Button */}
        <div className="w-12 h-12 bg-gray-700 hover:bg-green-600 rounded-2xl hover:rounded-xl transition-all duration-200 flex items-center justify-center cursor-pointer group relative">
          <FaPlus className="text-green-400 group-hover:text-white text-xl" />
          <div className="absolute left-16 bg-gray-800 text-white px-3 py-2 rounded-md text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none z-50">
            Thêm nhóm
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden min-w-0">
        {/* Posts Feed */}
        <div className="flex-1 transition-all duration-300 ease-in-out flex flex-col min-w-0 overflow-hidden">
          {/* Header */}
          <div className="bg-white shadow-sm border-b border-gray-200 flex-shrink-0 z-10">
            <div className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 ${selectedGroup.color} rounded-lg flex items-center justify-center`}
                  >
                    <span className="text-2xl">{selectedGroup.icon}</span>
                  </div>
                  <div>
                    <h1 className="text-xl font-bold text-gray-900">
                      {selectedGroup.name}
                    </h1>
                    <p className="text-sm text-gray-500">
                      Nhóm sự kiện tình nguyện
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition duration-200">
                    <FaBell className="text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition duration-200">
                    <FaSearch className="text-gray-600" />
                  </button>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition duration-200">
                    <FaUsers className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => setShowChat(!showChat)}
                    className={`px-4 py-2 rounded-lg font-medium transition duration-200 ${
                      showChat
                        ? "bg-indigo-600 text-white"
                        : "bg-indigo-100 text-indigo-600 hover:bg-indigo-200"
                    }`}
                  >
                    <FaHashtag className="inline mr-1" />
                    Chat
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Create Post */}
          <div className="bg-white border-b border-gray-200 p-6 flex-shrink-0">
            <div className="flex space-x-3">
              <Image
                src={currentUser.avatar}
                alt={currentUser.name}
                width={40}
                height={40}
                className="rounded-full h-10 w-10"
                unoptimized
              />
              <div className="flex-1 text-black">
                <textarea
                  value={newPost}
                  onChange={(e) => setNewPost(e.target.value)}
                  placeholder={`Chia sẻ điều gì đó với ${selectedGroup.name}...`}
                  className="w-full px-4 py-3 bg-gray-100 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  rows={3}
                />
                <div className="flex items-center justify-between mt-3">
                  <div className="flex space-x-2">
                    <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-200 flex items-center space-x-2">
                      <FaImage className="text-green-600" />
                      <span className="text-sm text-gray-700">Ảnh</span>
                    </button>
                    <button className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition duration-200 flex items-center space-x-2">
                      <FaSmile className="text-yellow-600" />
                      <span className="text-sm text-gray-700">Cảm xúc</span>
                    </button>
                  </div>
                  <button
                    onClick={handleCreatePost}
                    disabled={!newPost.trim()}
                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Đăng
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Posts List */}
          <div className="flex-1 p-6 space-y-6 overflow-y-auto">
            {filteredPosts.length === 0 ? (
              <div className="text-center py-12 bg-white rounded-lg">
                <FaUsers className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">
                  Chưa có bài viết nào
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  Hãy là người đầu tiên chia sẻ trong nhóm này!
                </p>
              </div>
            ) : (
              filteredPosts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white rounded-lg shadow-sm border border-gray-200"
                >
                  {/* Post Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Image
                        src={post.author.avatar}
                        alt={post.author.name}
                        width={40}
                        height={40}
                        className="rounded-full"
                        unoptimized
                      />
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {post.author.name}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {post.timestamp}
                        </p>
                      </div>
                    </div>
                    <button className="p-2 hover:bg-gray-100 rounded-lg transition duration-200">
                      <FaEllipsisV className="text-gray-400" />
                    </button>
                  </div>

                  {/* Post Content */}
                  <div className="px-4 pb-3">
                    <p className="text-gray-800 whitespace-pre-line">
                      {post.content}
                    </p>
                  </div>

                  {/* Post Images */}
                  {post.images && post.images.length > 0 && (
                    <div
                      className={`grid gap-1 ${
                        post.images.length === 1
                          ? "grid-cols-1"
                          : post.images.length === 2
                          ? "grid-cols-2"
                          : "grid-cols-2"
                      }`}
                    >
                      {post.images.map((image, index) => (
                        <div
                          key={index}
                          className={`relative ${
                            post.images.length === 3 && index === 0
                              ? "col-span-2"
                              : ""
                          }`}
                          style={{
                            height:
                              post.images.length === 1 ? "400px" : "250px",
                          }}
                        >
                          <Image
                            src={image}
                            alt={`Post image ${index + 1}`}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Post Stats */}
                  <div className="px-4 py-3 flex items-center justify-between border-t border-gray-200">
                    <div className="flex items-center space-x-4 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <FaHeart className="text-red-500" />
                        <span>{post.likes}</span>
                      </span>
                      <span>{post.comments} bình luận</span>
                      <span>{post.shares} chia sẻ</span>
                    </div>
                  </div>

                  {/* Post Actions */}
                  <div className="px-4 py-2 flex items-center justify-around border-t border-gray-200">
                    <button
                      onClick={() => handleLikePost(post.id)}
                      className={`flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg hover:bg-gray-100 transition duration-200 ${
                        post.isLiked ? "text-red-600" : "text-gray-600"
                      }`}
                    >
                      {post.isLiked ? <FaHeart /> : <FaRegHeart />}
                      <span className="font-medium">Thích</span>
                    </button>
                    <button
                      onClick={() => handleToggleComments(post.id)}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg hover:bg-gray-100 transition duration-200 text-gray-600"
                    >
                      <FaComment />
                      <span className="font-medium">Bình luận</span>
                    </button>
                    <button
                      onClick={() => handleSharePost(post.id)}
                      className="flex-1 flex items-center justify-center space-x-2 py-2 rounded-lg hover:bg-gray-100 transition duration-200 text-gray-600"
                    >
                      <FaShare />
                      <span className="font-medium">Chia sẻ</span>
                    </button>
                  </div>

                  {/* Comments Section */}
                  {showComments[post.id] && (
                    <div className="px-4 pb-4 border-t border-gray-200">
                      <div className="mt-4 flex space-x-2">
                        <Image
                          src={currentUser.avatar}
                          alt={currentUser.name}
                          width={32}
                          height={32}
                          className="rounded-full"
                          unoptimized
                        />
                        <div className="flex-1 flex space-x-2">
                          <input
                            type="text"
                            value={newComment[post.id] || ""}
                            onChange={(e) =>
                              setNewComment({
                                ...newComment,
                                [post.id]: e.target.value,
                              })
                            }
                            onKeyPress={(e) => {
                              if (e.key === "Enter") {
                                handleAddComment(post.id);
                              }
                            }}
                            placeholder="Viết bình luận..."
                            className="flex-1 px-4 py-2 bg-gray-100 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <button
                            onClick={() => handleAddComment(post.id)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition duration-200"
                          >
                            <FaPaperPlane />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right Sidebar - Chat (Discord Style) */}
        <div
          className={`bg-white border-l border-gray-200 flex flex-col transition-all duration-300 ease-in-out flex-shrink-0 ${
            showChat ? "w-80 lg:w-96 opacity-100" : "w-0 opacity-0"
          }`}
          style={{
            minWidth: showChat ? "320px" : "0",
            maxWidth: showChat ? "384px" : "0",
            willChange: "width, opacity",
            transform: "translateZ(0)", // Force GPU acceleration
          }}
        >
          <div
            className={`w-80 lg:w-96 h-full flex flex-col ${
              showChat ? "block" : "hidden"
            }`}
          >
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
              <div className="flex items-center space-x-2">
                <div
                  className={`w-6 h-6 ${selectedGroup.color} rounded flex items-center justify-center text-sm`}
                >
                  {selectedGroup.icon}
                </div>
                <h2 className="font-semibold text-gray-900">
                  {selectedGroup.name}
                </h2>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 hover:bg-gray-100 rounded-lg transition duration-200">
                  <FaBell className="text-gray-500" />
                </button>
                <button
                  onClick={() => setShowChat(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition duration-200"
                >
                  <FaTimes className="text-gray-500" />
                </button>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {currentChatMessages.length === 0 ? (
                <div className="text-center py-12">
                  <FaHashtag className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    Chưa có tin nhắn nào
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Hãy là người đầu tiên nhắn tin trong nhóm này!
                  </p>
                </div>
              ) : (
                <>
                  {currentChatMessages.map((msg) => (
                    <div key={msg.id} className="flex space-x-3">
                      <Image
                        src={msg.userAvatar}
                        alt={msg.userName}
                        width={36}
                        height={36}
                        className="rounded-full flex-shrink-0"
                        unoptimized
                      />
                      <div className="flex-1">
                        <div className="flex items-baseline space-x-2">
                          <span
                            className={`font-semibold text-sm ${
                              msg.isCurrentUser
                                ? "text-indigo-600"
                                : "text-gray-900"
                            }`}
                          >
                            {msg.userName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {msg.timestamp}
                          </span>
                        </div>
                        <p className="text-sm text-gray-800 mt-1">
                          {msg.message}
                        </p>
                      </div>
                    </div>
                  ))}
                  {/* Scroll anchor */}
                  <div ref={chatMessagesEndRef} />
                </>
              )}
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-200 flex-shrink-0">
              <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-2">
                <button className="p-2 hover:bg-gray-200 rounded transition duration-200">
                  <FaPlus className="text-gray-500" />
                </button>
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      handleSendMessage();
                    }
                  }}
                  placeholder={`Nhắn tin đến ${selectedGroup.name}`}
                  className="flex-1 bg-transparent focus:outline-none text-sm"
                />
                <button className="p-2 hover:bg-gray-200 rounded transition duration-200">
                  <FaGift className="text-gray-500" />
                </button>
                <button className="p-2 hover:bg-gray-200 rounded transition duration-200">
                  <FaSmile className="text-gray-500" />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="p-2 bg-indigo-600 hover:bg-indigo-700 rounded transition duration-200 disabled:bg-gray-300 disabled:cursor-not-allowed"
                >
                  <FaPaperPlane className="text-white text-sm" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
