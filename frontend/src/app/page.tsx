"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaBars,
  FaTimes,
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
} from "react-icons/fa";

interface Event {
  id: number;
  title: string;
  goal: string;
  date: string;
  location: string;
  participants: number;
  image: string;
}

interface PastEvent {
  id: number;
  title: string;
  volunteers: number;
  impact: string;
  result: string;
  image: string;
}

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  avatar: string;
}

interface Partner {
  id: number;
  name: string;
  description: string;
  logo: string;
}

interface NewsItem {
  id: number;
  title: string;
  category: string;
  date: string;
  excerpt: string;
  image: string;
}

export default function Home() {
  const [email, setEmail] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock Data
  const upcomingEvents: Event[] = [
    {
      id: 1,
      title: "Mùa Hè Xanh 2025",
      goal: "Hỗ trợ giáo dục cho trẻ em vùng cao",
      date: "15/06/2025 - 30/06/2025",
      location: "Sapa, Lào Cai",
      participants: 150,
      image:
        "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80",
    },
    {
      id: 2,
      title: "Ngày Chủ Nhật Xanh",
      goal: "Làm sạch bãi biển và bảo vệ môi trường",
      date: "22/05/2025",
      location: "Bãi biển Vũng Tàu",
      participants: 200,
      image:
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
    },
    {
      id: 3,
      title: "Hiến Máu Nhân Đạo",
      goal: "Cứu người bằng những giọt máu hồng",
      date: "10/05/2025",
      location: "Nhà Văn Hóa Thanh Niên TP.HCM",
      participants: 300,
      image:
        "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&q=80",
    },
  ];

  const pastEvents: PastEvent[] = [
    {
      id: 1,
      title: "Tết Ấm Cho Em 2024",
      volunteers: 180,
      impact: "Mang Tết đến với 500 em nhỏ",
      result: "500 phần quà + học bổng",
      image:
        "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&q=80",
    },
    {
      id: 2,
      title: "Trồng Cây Xanh 2024",
      volunteers: 120,
      impact: "3,000 cây xanh được trồng",
      result: "Cải thiện môi trường đô thị",
      image:
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=600&q=80",
    },
    {
      id: 3,
      title: "Đông Ấm 2024",
      volunteers: 95,
      impact: "200 suất quà cho người vô gia cư",
      result: "Áo ấm + thực phẩm",
      image:
        "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&q=80",
    },
  ];

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Nguyễn Minh Tuấn",
      role: "Tình nguyện viên 3 năm",
      content:
        "Tham gia các hoạt động tình nguyện đã giúp tôi phát triển bản thân và tạo được nhiều kết nối ý nghĩa. Nền tảng này thật sự minh bạch và chuyên nghiệp.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    },
    {
      id: 2,
      name: "Trần Thị Mai",
      role: "Đại diện đối tác - Công ty ABC",
      content:
        "Chúng tôi rất hài lòng khi đồng hành cùng nền tảng. Mọi hoạt động đều được báo cáo minh bạch, tác động thực sự đến cộng đồng.",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    },
    {
      id: 3,
      name: "Lê Hoàng Nam",
      role: "Sinh viên tình nguyện",
      content:
        "Qua mỗi dự án, tôi học được nhiều kỹ năng mềm và cảm nhận được giá trị của việc cho đi. Cảm ơn nền tảng đã tạo cơ hội!",
      avatar:
        "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    },
  ];

  const partners: Partner[] = [
    {
      id: 1,
      name: "Đại học Công nghệ",
      description: "Đối tác giáo dục chính",
      logo: "/dhcn.png",
    },
    {
      id: 2,
      name: "Khoa CNTT",
      description: "Hỗ trợ công nghệ",
      logo: "/khoa.png",
    },
    {
      id: 3,
      name: "Công ty Tech Solutions",
      description: "Nhà tài trợ vàng",
      logo: "🏢",
    },
    {
      id: 4,
      name: "Green Foundation",
      description: "Tổ chức môi trường",
      logo: "🌱",
    },
  ];

  const newsItems: NewsItem[] = [
    {
      id: 1,
      title: "Tuyển 50 Tình Nguyện Viên Mùa Hè Xanh 2025",
      category: "Tuyển TNV",
      date: "10/04/2025",
      excerpt:
        "Chương trình mùa hè xanh đang tìm kiếm những bạn trẻ nhiệt huyết cùng chúng tôi lan tỏa yêu thương...",
      image:
        "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80",
    },
    {
      id: 2,
      title: "Kết Quả Chiến Dịch Hiến Máu Tháng 3",
      category: "Kết quả",
      date: "05/04/2025",
      excerpt:
        "320 đơn vị máu đã được hiến tặng, cứu sống hàng trăm bệnh nhân đang cần...",
      image:
        "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&q=80",
    },
    {
      id: 3,
      title: "Lịch Hoạt Động Tháng 5/2025",
      category: "Lịch hoạt động",
      date: "01/04/2025",
      excerpt:
        "Cập nhật lịch trình các sự kiện trong tháng 5, đăng ký ngay để không bỏ lỡ...",
      image:
        "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&q=80",
    },
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Cảm ơn bạn đã đăng ký! Email: ${email}`);
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3ABEF9] via-[#1E90FF] to-[#22C55E] font-['Inter',_sans-serif]">
      {/* NAVIGATION */}
      <nav className="sticky top-0 bg-[#1E90FF] shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              {/* Logo - Bạn có thể thay đổi src này */}
              <div className="relative w-10 h-10 flex-shrink-0">
                <Image
                  src="data:image/jpeg;base64,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"
                  alt="Logo"
                  width={40}
                  height={40}
                  className="h-10 rounded-full border-2 border-white"
                />
              </div>
              <h1 className="text-2xl font-bold text-white">Tình Nguyện Trẻ</h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6">
              <a
                href="#"
                className="text-white hover:text-yellow-300 font-medium transition-colors"
              >
                Trang chủ
              </a>
              <a
                href="#events"
                className="text-white hover:text-yellow-300 font-medium transition-colors"
              >
                Sự kiện
              </a>
              <a
                href="#volunteers"
                className="text-white hover:text-yellow-300 font-medium transition-colors"
              >
                Tình nguyện viên
              </a>
              <a
                href="#partners"
                className="text-white hover:text-yellow-300 font-medium transition-colors"
              >
                Đối tác
              </a>
              <a
                href="#news"
                className="text-white hover:text-yellow-300 font-medium transition-colors"
              >
                Tin tức
              </a>
              <a
                href="#contact"
                className="text-white hover:text-yellow-300 font-medium transition-colors"
              >
                Liên hệ
              </a>
              <div className="flex items-center gap-3 ml-4">
                <a
                  href="/home/login"
                  className="text-white hover:text-yellow-300 font-medium"
                >
                  Đăng nhập
                </a>
                <a
                  href="/register"
                  className="bg-white text-[#1E90FF] px-5 py-2 rounded-lg font-medium hover:bg-yellow-300 hover:text-[#1E90FF] transition-colors"
                >
                  Tạo tài khoản
                </a>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-white/20">
              <div className="flex flex-col space-y-3">
                <a
                  href="#"
                  className="text-white hover:text-yellow-300 font-medium"
                >
                  Trang chủ
                </a>
                <a
                  href="#events"
                  className="text-white hover:text-yellow-300 font-medium"
                >
                  Sự kiện
                </a>
                <a
                  href="#volunteers"
                  className="text-white hover:text-yellow-300 font-medium"
                >
                  Tình nguyện viên
                </a>
                <a
                  href="#partners"
                  className="text-white hover:text-yellow-300 font-medium"
                >
                  Đối tác
                </a>
                <a
                  href="#news"
                  className="text-white hover:text-yellow-300 font-medium"
                >
                  Tin tức
                </a>
                <a
                  href="#contact"
                  className="text-white hover:text-yellow-300 font-medium"
                >
                  Liên hệ
                </a>
                <div className="pt-3 border-t border-white/20 flex flex-col gap-2">
                  <a
                    href="/home/login"
                    className="text-white hover:text-yellow-300 font-medium"
                  >
                    Đăng nhập
                  </a>
                  <a
                    href="/register"
                    className="bg-white text-[#1E90FF] px-5 py-2 rounded-lg font-medium text-center hover:bg-yellow-300"
                  >
                    Tạo tài khoản
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* 1. HERO SECTION */}
      <section className="py-12 md:py-16 bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-4">
                Cộng đồng Tình Nguyện Trẻ –{" "}
                <span className="bg-gradient-to-r from-[#1E90FF] to-[#22C55E] bg-clip-text text-transparent">
                  Chung Sức Tạo Nên Sự Thay Đổi
                </span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 mb-6 leading-relaxed">
                Nền tảng kết nối hàng ngàn tình nguyện viên, sự kiện và đối tác
                để tạo nên những đóng góp thiết thực cho cộng đồng.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-gradient-to-r from-[#1E90FF] to-[#22C55E] text-white px-8 py-3 rounded-lg text-lg font-semibold hover:opacity-90 transition-opacity shadow-lg">
                  Tham gia Ngay
                </button>
                <button className="border-2 border-[#1E90FF] text-[#1E90FF] px-8 py-3 rounded-lg text-lg font-semibold hover:bg-[#1E90FF] hover:text-white transition-all">
                  Đăng nhập / Tạo tài khoản
                </button>
              </div>
            </div>
            <div className="relative h-[400px] lg:h-[500px] rounded-2xl overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&q=80"
                alt="Hoạt động tình nguyện"
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
        </div>
      </section>

      {/* 2. SỨ MỆNH - GIÁ TRỊ CỐT LÕI */}
      <section className="py-12 md:py-16 bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Sứ Mệnh & Giá Trị Cốt Lõi
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="bg-gradient-to-br from-[#1E90FF]/10 to-[#22C55E]/10 p-6 rounded-xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Sứ mệnh
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Kết nối cộng đồng trẻ với những hoạt động thiện nguyện có giá
                  trị thật, tạo ra những thay đổi tích cực và bền vững cho xã
                  hội.
                </p>
              </div>
              <div className="bg-gradient-to-br from-[#22C55E]/10 to-[#1E90FF]/10 p-6 rounded-xl">
                <h3 className="text-2xl font-bold text-gray-900 mb-3">
                  Tầm nhìn
                </h3>
                <p className="text-lg text-gray-700 leading-relaxed">
                  Trở thành nền tảng tình nguyện uy tín và minh bạch nhất trong
                  khu vực, nơi mọi người có thể tin tưởng và đóng góp.
                </p>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Giá trị cốt lõi
              </h3>
              <ul className="space-y-3">
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">
                      Minh bạch
                    </h4>
                    <p className="text-gray-600">
                      Công khai mọi hoạt động và kết quả
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">Kết nối</h4>
                    <p className="text-gray-600">Xây dựng cộng đồng mạnh mẽ</p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">
                      Phát triển
                    </h4>
                    <p className="text-gray-600">
                      Tạo cơ hội học hỏi và trưởng thành
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-2xl">✓</span>
                  <div>
                    <h4 className="font-bold text-lg text-gray-900">
                      Ảnh hưởng tích cực
                    </h4>
                    <p className="text-gray-600">
                      Tạo ra thay đổi thực sự cho cộng đồng
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. THỐNG KÊ ẤN TƯỢNG */}
      <section className="py-12 md:py-16 bg-gradient-to-r from-[#1E90FF] to-[#22C55E]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">
            Những Con Số Tạo Nên Sự Khác Biệt
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-6">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                +5,200
              </div>
              <div className="text-lg text-white/90">Giờ tình nguyện</div>
            </div>
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-6">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                +1,200
              </div>
              <div className="text-lg text-white/90">Tình nguyện viên</div>
            </div>
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-6">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                32
              </div>
              <div className="text-lg text-white/90">Dự án xã hội</div>
            </div>
            <div className="text-center bg-white/20 backdrop-blur-sm rounded-xl p-6">
              <div className="text-4xl md:text-5xl font-bold text-white mb-2">
                8
              </div>
              <div className="text-lg text-white/90">Đối tác đồng hành</div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SỰ KIỆN SẮP DIỄN RA */}
      <section
        id="events"
        className="py-12 md:py-16 bg-white/90 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Sự Kiện Sắp Tới
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {event.title}
                  </h3>
                  <p className="text-gray-600 mb-3">{event.goal}</p>
                  <div className="space-y-2 text-sm text-gray-500 mb-4">
                    <p>📅 {event.date}</p>
                    <p>📍 {event.location}</p>
                    <p>👥 {event.participants} người tham gia</p>
                  </div>
                  <button className="w-full bg-gradient-to-r from-[#1E90FF] to-[#22C55E] text-white py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity">
                    Đăng ký tham gia
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SỰ KIỆN ĐÃ DIỄN RA */}
      <section className="py-12 md:py-16 bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Những Hoạt Động Đáng Nhớ
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {pastEvents.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                <div className="relative h-56">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {event.title}
                  </h3>
                  <div className="space-y-2 text-gray-700">
                    <p>
                      👥{" "}
                      <span className="font-semibold">{event.volunteers}</span>{" "}
                      TNV tham gia
                    </p>
                    <p>💚 {event.impact}</p>
                    <p>✅ {event.result}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. CÂU CHUYỆN TRUYỀN CẢM HỨNG */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-[#1E90FF]/10 to-[#22C55E]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Câu Chuyện Từ Những Bàn Tay Thiện Nguyện
          </h2>
          <div className="bg-white rounded-2xl shadow-xl p-8 md:p-12">
            <div className="flex items-start gap-6 mb-6">
              <div className="relative w-20 h-20 flex-shrink-0 rounded-full overflow-hidden">
                <Image
                  src="/dinh.png"
                  alt="Người kể chuyện"
                  fill
                  className="object-cover"
                />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">
                  Hành trình của Ngọc Dinh
                </h3>
                <p className="text-gray-600">Tình nguyện viên xuất sắc 2024</p>
              </div>
            </div>
            <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed">
              <p className="mb-4">
                "Năm năm trước, tôi chỉ là một sinh viên năm nhất với nhiều lo
                lắng về tương lai. Lần đầu tiên tham gia một hoạt động tình
                nguyện dạy học cho trẻ em ở vùng cao, tôi nhận ra rằng hạnh phúc
                đến từ những điều giản đơn nhất.
              </p>
              <p className="mb-4">
                Ánh mắt háo hức của các em khi được học chữ, nụ cười trong trẻo
                khi nhận được những cuốn sách cũ chúng tôi mang lên... Tất cả đã
                thay đổi cách tôi nhìn nhận cuộc sống. Từ đó đến nay, tôi đã
                tham gia 15 dự án khác nhau, và mỗi dự án đều mang lại cho tôi
                những bài học quý giá.
              </p>
              <p>
                Hôm nay, tôi không chỉ là một tình nguyện viên mà còn là người
                điều phối các dự án, giúp kết nối những trái tim thiện nguyện
                với những hoàn cảnh cần được giúp đỡ. Tôi tin rằng, mỗi người
                chúng ta đều có thể tạo ra sự khác biệt, chỉ cần bắt đầu hành
                động."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. CÁCH THỨC THAM GIA */}
      <section
        id="volunteers"
        className="py-12 md:py-16 bg-white/90 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Bạn Muốn Tham Gia Như Thế Nào?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-gradient-to-br from-[#1E90FF]/10 to-white p-6 rounded-xl shadow-lg text-center hover:shadow-2xl transition-shadow">
              <div className="text-5xl mb-4">🙋</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Đăng ký tình nguyện viên
              </h3>
              <p className="text-gray-600 mb-4">
                Tham gia cộng đồng và nhận thông báo về các sự kiện
              </p>
              <button className="bg-[#1E90FF] text-white px-6 py-2 rounded-lg hover:bg-[#1873CC] transition-colors font-semibold">
                Đăng ký ngay
              </button>
            </div>
            <div className="bg-gradient-to-br from-[#22C55E]/10 to-white p-6 rounded-xl shadow-lg text-center hover:shadow-2xl transition-shadow">
              <div className="text-5xl mb-4">📅</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Tham gia sự kiện
              </h3>
              <p className="text-gray-600 mb-4">
                Chọn sự kiện phù hợp và đăng ký tham gia
              </p>
              <button className="bg-[#22C55E] text-white px-6 py-2 rounded-lg hover:bg-[#1ea34a] transition-colors font-semibold">
                Xem sự kiện
              </button>
            </div>
            <div className="bg-gradient-to-br from-[#1E90FF]/10 to-white p-6 rounded-xl shadow-lg text-center hover:shadow-2xl transition-shadow">
              <div className="text-5xl mb-4">🤝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Trở thành đối tác
              </h3>
              <p className="text-gray-600 mb-4">
                Hợp tác cùng chúng tôi để tạo tác động lớn hơn
              </p>
              <button className="bg-[#1E90FF] text-white px-6 py-2 rounded-lg hover:bg-[#1873CC] transition-colors font-semibold">
                Liên hệ hợp tác
              </button>
            </div>
            <div className="bg-gradient-to-br from-[#22C55E]/10 to-white p-6 rounded-xl shadow-lg text-center hover:shadow-2xl transition-shadow">
              <div className="text-5xl mb-4">🔔</div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Đăng ký nhận thông báo
              </h3>
              <p className="text-gray-600 mb-4">
                Cập nhật tin tức và sự kiện mới nhất
              </p>
              <button className="bg-[#22C55E] text-white px-6 py-2 rounded-lg hover:bg-[#1ea34a] transition-colors font-semibold">
                Đăng ký email
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 8. ĐỐI TÁC - NHÀ TÀI TRỢ */}
      <section
        id="partners"
        className="py-12 md:py-16 bg-white/90 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Đối Tác Đồng Hành
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {partners.map((partner) => (
              <div
                key={partner.id}
                className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-2xl transition-shadow border border-gray-100"
              >
                {partner.logo.startsWith("/") ? (
                  <div className="relative h-24 mb-4 flex items-center justify-center">
                    <Image
                      src={partner.logo}
                      alt={partner.name}
                      width={120}
                      height={96}
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div className="text-6xl mb-4">{partner.logo}</div>
                )}
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  {partner.name}
                </h3>
                <p className="text-gray-600">{partner.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. MỜI HỢP TÁC / TÀI TRỢ */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-[#1E90FF]/10 to-[#22C55E]/10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Hợp Tác Cùng Chúng Tôi
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Lợi ích CSR
              </h3>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-[#22C55E] text-xl">✓</span>
                  <span>Nâng cao hình ảnh thương hiệu</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#22C55E] text-xl">✓</span>
                  <span>Đóng góp trực tiếp cho cộng đồng</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#22C55E] text-xl">✓</span>
                  <span>Báo cáo minh bạch về tác động</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-[#22C55E] text-xl">✓</span>
                  <span>Kết nối với đội ngũ trẻ tài năng</span>
                </li>
              </ul>
            </div>
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Form liên hệ nhanh
              </h3>
              <form className="space-y-4">
                <input
                  type="text"
                  placeholder="Tên tổ chức / doanh nghiệp"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
                />
                <input
                  type="email"
                  placeholder="Email liên hệ"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
                />
                <input
                  type="tel"
                  placeholder="Số điện thoại"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
                />
                <textarea
                  placeholder="Nội dung hợp tác"
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1E90FF]"
                ></textarea>
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#1E90FF] to-[#22C55E] text-white py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Gửi yêu cầu hợp tác
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 10. ĐÁNH GIÁ - TESTIMONIALS */}
      <section className="py-12 md:py-16 bg-white/90 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Cảm Nhận Từ Tình Nguyện Viên & Đối Tác
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white rounded-xl shadow-lg p-6"
              >
                <p className="text-gray-700 leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div className="flex items-center gap-4">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden">
                    <Image
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-sm text-gray-600">
                      {testimonial.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 11. TIN TỨC & THÔNG BÁO */}
      <section
        id="news"
        className="py-12 md:py-16 bg-white/90 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Tin Mới Nhất
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {newsItems.map((news) => (
              <article
                key={news.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-shadow"
              >
                <div className="relative h-48">
                  <Image
                    src={news.image}
                    alt={news.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-4 left-4">
                    <span className="bg-[#1E90FF] text-white px-3 py-1 rounded-full text-sm font-semibold">
                      {news.category}
                    </span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-sm text-gray-500 mb-2">{news.date}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {news.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{news.excerpt}</p>
                  <button className="text-[#1E90FF] font-semibold hover:text-[#1873CC] transition-colors">
                    Đọc thêm →
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 12. BẢN ĐỒ HOẠT ĐỘNG */}
      <section className="py-12 md:py-16 bg-gradient-to-br from-[#1E90FF]/10 to-[#22C55E]/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Bản Đồ Hoạt Động
          </h2>
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="aspect-video bg-gradient-to-br from-[#1E90FF]/20 to-[#22C55E]/20 rounded-xl flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🗺️</div>
                <p className="text-xl text-gray-700 font-semibold">
                  Bản đồ tương tác
                </p>
                <p className="text-gray-600 mt-2">
                  Hiển thị khu vực triển khai dự án, sự kiện sắp diễn ra và điểm
                  tập kết
                </p>
                <div className="mt-6 grid grid-cols-3 gap-4 max-w-2xl mx-auto">
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-[#1E90FF]">15+</div>
                    <div className="text-sm text-gray-600">Khu vực</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-[#22C55E]">8</div>
                    <div className="text-sm text-gray-600">Sự kiện sắp tới</div>
                  </div>
                  <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-[#1E90FF]">12</div>
                    <div className="text-sm text-gray-600">Điểm tập kết</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 13. TRUNG TÂM TRỢ GIÚP - FAQ */}
      <section className="py-12 md:py-16 bg-white/90 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 text-center">
            Hỏi & Đáp
          </h2>
          <div className="space-y-4">
            {[
              {
                q: "Làm thế nào để đăng ký tình nguyện viên?",
                a: "Bạn chỉ cần tạo tài khoản trên nền tảng, điền thông tin cá nhân và chọn lĩnh vực quan tâm. Sau đó, bạn sẽ nhận được thông báo về các sự kiện phù hợp.",
              },
              {
                q: "Tôi có cần kỹ năng đặc biệt không?",
                a: "Không nhất thiết! Chúng tôi có nhiều hoạt động phù hợp với mọi đối tượng. Một số dự án cần kỹ năng chuyên môn, nhưng đa số chỉ cần sự nhiệt tình và trách nhiệm.",
              },
              {
                q: "Có được cấp chứng nhận sau khi tham gia không?",
                a: "Có! Sau mỗi sự kiện, bạn sẽ nhận được chứng nhận tham gia và giấy xác nhận giờ tình nguyện, có thể sử dụng cho hồ sơ học tập hoặc xin việc.",
              },
              {
                q: "Chi phí tham gia như thế nào?",
                a: "Hầu hết các hoạt động đều miễn phí. Một số dự án dài ngày có thể yêu cầu đóng góp chi phí ăn ở, nhưng sẽ được thông báo rõ ràng trước.",
              },
              {
                q: "Làm sao để theo dõi kết quả sau sự kiện?",
                a: "Mọi kết quả đều được cập nhật công khai trên website và gửi báo cáo qua email đến tất cả tình nguyện viên tham gia.",
              },
            ].map((faq, index) => (
              <details
                key={index}
                className="bg-white rounded-lg shadow-md group"
              >
                <summary className="px-6 py-4 cursor-pointer font-semibold text-lg text-gray-900 hover:text-[#1E90FF] transition-colors list-none flex justify-between items-center">
                  {faq.q}
                  <span className="text-[#1E90FF] group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>
                <div className="px-6 pb-4 text-gray-700 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* 14. FOOTER */}
      <footer id="contact" className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            {/* Logo & About */}
            <div>
              <h3 className="text-2xl font-bold bg-gradient-to-r from-[#3ABEF9] to-[#22C55E] bg-clip-text text-transparent mb-4">
                Tình Nguyện Trẻ
              </h3>
              <p className="text-gray-400 leading-relaxed mb-4">
                Nền tảng kết nối tình nguyện viên với những hoạt động thiện
                nguyện có ý nghĩa thực sự.
              </p>
            </div>

            {/* Navigation */}
            <div>
              <h4 className="font-bold mb-4 text-lg">Liên kết</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Trang chủ
                  </a>
                </li>
                <li>
                  <a
                    href="#events"
                    className="hover:text-white transition-colors"
                  >
                    Sự kiện
                  </a>
                </li>
                <li>
                  <a
                    href="#volunteers"
                    className="hover:text-white transition-colors"
                  >
                    Tình nguyện viên
                  </a>
                </li>
                <li>
                  <a
                    href="#partners"
                    className="hover:text-white transition-colors"
                  >
                    Đối tác
                  </a>
                </li>
                <li>
                  <a
                    href="#news"
                    className="hover:text-white transition-colors"
                  >
                    Tin tức
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="font-bold mb-4 text-lg">Liên hệ</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center gap-2">
                  <FaPhone className="text-[#22C55E]" />
                  <span>035 490 4422</span>
                </li>
                <li className="flex items-center gap-2">
                  <FaEnvelope className="text-[#22C55E]" />
                  <span>23020012@vnu.edu.vn</span>
                </li>
                <li className="flex items-start gap-2">
                  <FaMapMarkerAlt className="text-[#22C55E] mt-1" />
                  <span>
                    Đại học Công nghệ
                    <br />
                    144 Xuân Thủy, Cầu Giấy, Hà Nội
                  </span>
                </li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h4 className="font-bold mb-4 text-lg">Nhận tin mới</h4>
              <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email của bạn"
                  className="w-full px-4 py-2 rounded-lg bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-[#22C55E] text-white"
                  required
                />
                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#1E90FF] to-[#22C55E] text-white py-2 rounded-lg font-semibold hover:opacity-90 transition-opacity"
                >
                  Đăng ký
                </button>
              </form>
              <div className="flex gap-3 mt-4">
                <a
                  href="https://www.facebook.com/hqb2811/"
                  target="_blank"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#1E90FF] transition-colors"
                >
                  <FaFacebook />
                </a>
                <a
                  href="https://www.instagram.com/bao_28_11_05/"
                  target="_blank"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#1E90FF] transition-colors"
                >
                  <FaInstagram />
                </a>
                <a
                  href=""
                  target="_blank"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#1E90FF] transition-colors"
                >
                  <FaTiktok />
                </a>
                <a
                  href="#"
                  target="_blank"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#1E90FF] transition-colors"
                >
                  <FaYoutube />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-gray-400 text-center md:text-left">
              © 2025 Tình Nguyện Trẻ. All rights reserved.
            </p>
            <div className="flex gap-6 text-gray-400">
              <a
                href="/home/login"
                className="hover:text-white transition-colors"
              >
                Đăng nhập
              </a>
              <span>|</span>
              <a
                href="/register"
                className="hover:text-white transition-colors"
              >
                Tạo tài khoản
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
