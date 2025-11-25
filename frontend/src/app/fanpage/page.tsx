"use client";

import React, { useState } from "react";
import {
  FaFacebook,
  FaInstagram,
  FaTiktok,
  FaArrowRight,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import Image from "next/image";

// Interfaces
interface Event {
  id: number;
  title: string;
  date: string;
  location: string;
  volunteers: number;
  description: string;
  image: string;
}

interface Testimonial {
  id: number;
  name: string;
  role: string;
  content: string;
  avatar: string;
}

interface Feature {
  title: string;
  description: string;
}

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  image: string;
}

export default function FanpagePage() {
  const [email, setEmail] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Mock Data
  const featuredEvents: Event[] = [
    {
      id: 1,
      title: 'Chiến dịch "Mùa Hè Xanh 2025"',
      date: "12/06/2025",
      location: "Quận 9 – TP. Hồ Chí Minh",
      volunteers: 245,
      description:
        "Một mùa hè ý nghĩa cùng cộng đồng, với các hoạt động dạy học, xây dựng và hỗ trợ trẻ em vùng khó khăn.",
      image:
        "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=800&q=80",
    },
    {
      id: 2,
      title: "Ngày Chủ Nhật Xanh – Vì Môi Trường",
      date: "23/04/2025",
      location: "Công viên Gia Định",
      volunteers: 180,
      description:
        "Cùng nhau nhặt rác, trồng cây, làm sạch không gian sống cho thành phố xanh hơn.",
      image:
        "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
    },
    {
      id: 3,
      title: 'Hiến Máu "Giọt Hồng Yêu Thương"',
      date: "15/03/2025",
      location: "Nhà Văn Hóa Thanh Niên",
      volunteers: 320,
      description:
        "Một giọt máu cho đi – một cuộc đời ở lại. Chung tay cứu sống những người đang cần bạn.",
      image:
        "https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=800&q=80",
    },
  ];

  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: "Nguyễn Minh Khoa",
      role: "Tình nguyện viên 3 năm",
      content:
        "Mình đã tham gia nhiều chương trình và cảm thấy mọi thứ được tổ chức rất chuyên nghiệp. Nền tảng giúp mình tìm sự kiện phù hợp rất nhanh chóng.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    },
    {
      id: 2,
      name: "Trần Thùy Linh",
      role: "Nhân viên văn phòng",
      content:
        "Nhờ nền tảng này, mình biết thêm nhiều hoạt động ý nghĩa và gặp được những người bạn cùng chí hướng.",
      avatar:
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    },
  ];

  const features: Feature[] = [
    {
      title: "Đăng ký sự kiện dễ dàng",
      description:
        "Chỉ vài thao tác, bạn đã có thể tham gia hoạt động ngay lập tức.",
    },
    {
      title: "Quản lý hồ sơ cá nhân",
      description: "Theo dõi lịch sử tham gia và thành tích của bạn.",
    },
    {
      title: "Check-in QR thông minh",
      description: "Giảm thời gian chờ đợi, quản lý minh bạch.",
    },
    {
      title: "Theo dõi kết quả sau sự kiện",
      description: "Báo cáo rõ ràng và công khai.",
    },
  ];

  const featureImages = [
    "https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&q=80", // Event registration on mobile
    "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=800&q=80", // Profile management
    "https://images.unsplash.com/photo-1603808033587-d2a56e3e0c0d?w=800&q=80", // QR code scanning
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80", // Analytics dashboard
  ];

  const blogPosts: BlogPost[] = [
    {
      id: 1,
      title: "10 Lý Do Bạn Nên Tham Gia Tình Nguyện",
      excerpt:
        "Khám phá những lợi ích tuyệt vời khi trở thành một tình nguyện viên...",
      date: "10/11/2025",
      image:
        "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80",
    },
    {
      id: 2,
      title: "Câu Chuyện Từ Mùa Hè Xanh 2024",
      excerpt:
        "Những khoảnh khắc đáng nhớ và bài học quý giá từ chiến dịch năm ngoái...",
      date: "05/11/2025",
      image:
        "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80",
    },
    {
      id: 3,
      title: "Làm Thế Nào Để Trở Thành Tình Nguyện Viên Xuất Sắc",
      excerpt:
        "Những kỹ năng và thái độ cần thiết để tạo ra tác động tích cực...",
      date: "01/11/2025",
      image:
        "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=800&q=80",
    },
  ];

  const stats = [
    { number: "2,500+", label: "Tình nguyện viên hoạt động" },
    { number: "120+", label: "Sự kiện đã tổ chức" },
    { number: "8,000+", label: "Giờ đóng góp" },
    { number: "15+", label: "Khu vực triển khai" },
  ];

  const partners = [
    "Trường Đại Học Công Nghệ",
    "Khoa Công Nghệ Thông Tin",
    "Các doanh nghiệp & tổ chức CSR",
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    alert(`Cảm ơn bạn đã đăng ký! Email: ${email}`);
    setEmail("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0066CC] via-[#00A86B] to-[#0066CC] font-['Inter',_'Poppins',_sans-serif]">
      {/* 1. HEADER - Blue Sky Background */}
      <header className="sticky top-0 bg-[#0066CC] border-b border-blue-500 shadow-lg z-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-white">VolunteerHub</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
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
                href="#community"
                className="text-white hover:text-yellow-300 font-medium transition-colors"
              >
                Cộng đồng
              </a>
              <a
                href="#gallery"
                className="text-white hover:text-yellow-300 font-medium transition-colors"
              >
                Thư viện
              </a>
              <a
                href="#blog"
                className="text-white hover:text-yellow-300 font-medium transition-colors"
              >
                Blog
              </a>
            </nav>

            {/* Auth Links */}
            <div className="hidden md:flex items-center space-x-4">
              <a
                href="/login"
                className="text-white hover:text-yellow-300 font-medium transition-colors"
              >
                Đăng nhập
              </a>
              <span className="text-white/50">|</span>
              <a
                href="/register"
                className="bg-white text-[#0066CC] px-6 py-2.5 rounded-md font-medium hover:bg-yellow-300 hover:text-[#0066CC] transition-colors"
              >
                Tạo tài khoản
              </a>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-white hover:text-yellow-300"
            >
              {mobileMenuOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-blue-400">
              <nav className="flex flex-col space-y-4">
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
                  href="#community"
                  className="text-white hover:text-yellow-300 font-medium"
                >
                  Cộng đồng
                </a>
                <a
                  href="#gallery"
                  className="text-gray-700 hover:text-[#1E90FF] font-medium"
                >
                  Thư viện
                </a>
                <a
                  href="#blog"
                  className="text-white hover:text-yellow-300 font-medium"
                >
                  Blog
                </a>
                <div className="flex flex-col space-y-3 pt-4 border-t border-blue-400">
                  <a
                    href="/login"
                    className="text-white hover:text-yellow-300 font-medium"
                  >
                    Đăng nhập
                  </a>
                  <a
                    href="/register"
                    className="bg-white text-[#1E90FF] px-6 py-3 rounded-md font-medium text-center hover:bg-yellow-300"
                  >
                    Tạo tài khoản
                  </a>
                </div>
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* 2. HERO SECTION - Clean, Left-Aligned */}
      <section className="py-16 md:py-24 lg:py-32 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Content */}
            <div className="text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
                Kết nối tình nguyện viên –<br />
                <span className="text-[#0066CC]">
                  Chung tay vì cộng đồng bền vững
                </span>
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 leading-relaxed mb-10">
                Nền tảng giúp bạn tham gia, quản lý và lan tỏa giá trị nhân văn
                bằng công nghệ hiện đại.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button className="bg-[#0066CC] text-white px-8 py-4 rounded-md text-lg font-semibold hover:bg-[#004D99] transition-colors inline-flex items-center justify-center gap-2">
                  Khám phá sự kiện
                  <FaArrowRight />
                </button>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-md text-lg font-semibold hover:border-[#0066CC] hover:text-[#0066CC] transition-colors">
                  Xem cách hoạt động
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="relative h-[400px] lg:h-[600px] rounded-lg overflow-hidden shadow-2xl">
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

      {/* 3. MISSION - Clean Text Layout */}
      <section className="py-16 md:py-24 bg-white/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-4xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-12">
              Sứ mệnh của chúng tôi
            </h2>

            <div className="space-y-12">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Giá trị nhân văn
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Chúng tôi tin rằng mỗi hành động nhỏ đều tạo nên sự thay đổi
                  lớn. Nền tảng kết nối những trái tim nhiệt huyết, giúp mọi
                  người dễ dàng tiếp cận và đóng góp cho cộng đồng.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Tính minh bạch
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Mọi thông tin về sự kiện, kết quả và hoạt động đều được công
                  khai rõ ràng. Chúng tôi cam kết xây dựng niềm tin thông qua sự
                  minh bạch tuyệt đối.
                </p>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Công nghệ hóa hoạt động tình nguyện
                </h3>
                <p className="text-lg text-gray-600 leading-relaxed">
                  Ứng dụng công nghệ hiện đại để quản lý, theo dõi và tối ưu hóa
                  trải nghiệm tình nguyện. Từ đăng ký đến báo cáo kết quả, mọi
                  thứ đều đơn giản và hiệu quả.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FEATURED EVENTS - Clean Cards */}
      <section id="events" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Sự kiện nổi bật
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl">
              Khám phá các hoạt động ý nghĩa đang diễn ra và sắp tới
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredEvents.map((event) => (
              <div
                key={event.id}
                className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="relative h-64 overflow-hidden">
                  <Image
                    src={event.image}
                    alt={event.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#1E90FF] transition-colors">
                    {event.title}
                  </h3>

                  <div className="space-y-2 mb-4 text-gray-600">
                    <p className="text-sm">
                      <span className="font-semibold">Thời gian:</span>{" "}
                      {event.date}
                    </p>
                    <p className="text-sm">
                      <span className="font-semibold">Địa điểm:</span>{" "}
                      {event.location}
                    </p>
                  </div>

                  <p className="text-gray-600 mb-6 leading-relaxed">
                    {event.description}
                  </p>

                  <button className="text-[#1E90FF] font-semibold hover:text-[#1873CC] inline-flex items-center gap-2">
                    Xem chi tiết
                    <FaArrowRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. STATISTICS - Minimal Design */}
      <section className="py-16 md:py-24 bg-[#F0F8FF]">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center lg:text-left">
                <div className="text-4xl md:text-5xl lg:text-6xl font-bold text-[#0066CC] mb-2">
                  {stat.number}
                </div>
                <div className="text-base md:text-lg text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. PARTNERS - Monochrome Logos */}
      <section className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Đối tác đồng hành
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl">
              Được tin tưởng bởi các tổ chức uy tín
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {partners.map((partner, index) => (
              <div
                key={index}
                className="flex items-center justify-center h-32 bg-gray-50 rounded-lg border border-gray-200 hover:border-[#0066CC] transition-colors"
              >
                <span className="text-lg font-semibold text-gray-600">
                  {partner}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 7. GALLERY - Grid Layout */}
      <section id="gallery" className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Khoảnh khắc ý nghĩa
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl">
              Hình ảnh từ các hoạt động tình nguyện
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[
              "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=400&q=80",
              "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=400&q=80",
              "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=400&q=80",
              "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&q=80",
              "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=400&q=80",
              "https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=400&q=80",
              "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400&q=80",
              "https://images.unsplash.com/photo-1464746133101-a2c3f88e0dd9?w=400&q=80",
            ].map((imageUrl, index) => (
              <div
                key={index}
                className="aspect-square relative rounded-lg overflow-hidden hover:scale-105 transition-transform cursor-pointer shadow-md"
              >
                <Image
                  src={imageUrl}
                  alt={`Hoạt động tình nguyện ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. TESTIMONIALS - Clean Layout */}
      <section
        id="community"
        className="py-16 md:py-24 bg-white/95 backdrop-blur-sm"
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Chia sẻ từ tình nguyện viên
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
            {testimonials.map((testimonial) => (
              <div
                key={testimonial.id}
                className="bg-white p-8 rounded-lg shadow-lg"
              >
                <p className="text-lg text-gray-700 leading-relaxed mb-6">
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
                    <div className="text-gray-600">{testimonial.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 9. FEATURES - Left-Right Layout */}
      <section className="py-16 md:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Tính năng hệ thống
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl">
              Giải pháp công nghệ cho hoạt động tình nguyện
            </p>
          </div>

          <div className="space-y-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`grid lg:grid-cols-2 gap-12 items-center ${
                  index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              >
                <div className={index % 2 === 1 ? "lg:order-2" : ""}>
                  <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                    {feature.title}
                  </h3>
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <div
                  className={`relative h-64 bg-gray-200 rounded-lg overflow-hidden shadow-lg ${
                    index % 2 === 1 ? "lg:order-1" : ""
                  }`}
                >
                  <Image
                    src={featureImages[index]}
                    alt={feature.title}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. BLOG - Modern Cards */}
      <section id="blog" className="py-16 md:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
              Tin tức & Blog
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl">
              Câu chuyện, kinh nghiệm và cảm hứng từ cộng đồng
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post) => (
              <article
                key={post.id}
                className="group bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-xl transition-all"
              >
                <div className="relative h-56 overflow-hidden">
                  <Image
                    src={post.image}
                    alt={post.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="text-sm text-gray-500 mb-2">{post.date}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#0066CC] transition-colors">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {post.excerpt}
                  </p>
                  <button className="text-[#0066CC] font-semibold hover:text-[#004D99] inline-flex items-center gap-2">
                    Đọc thêm
                    <FaArrowRight size={14} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* 11. FOOTER - Professional */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-xl font-bold mb-4">VolunteerHub</h3>
              <p className="text-gray-400 leading-relaxed mb-6">
                Nền tảng kết nối tình nguyện viên, quản lý hoạt động và lan tỏa
                giá trị nhân văn.
              </p>
            </div>

            <div>
              <h4 className="font-bold mb-4">Liên kết nhanh</h4>
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
                    href="#community"
                    className="hover:text-white transition-colors"
                  >
                    Cộng đồng
                  </a>
                </li>
                <li>
                  <a
                    href="#blog"
                    className="hover:text-white transition-colors"
                  >
                    Blog
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Liên hệ</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Email: contact@volunteerhub.vn</li>
                <li>Hotline: 1900 xxxx</li>
                <li>
                  Địa chỉ: Trường Đại Học Công Nghệ
                  <br />
                  Khu phố 6, Linh Trung, Thủ Đức, TP.HCM
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold mb-4">Mạng xã hội</h4>
              <div className="flex gap-4">
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#0066CC] transition-colors"
                >
                  <FaFacebook />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#0066CC] transition-colors"
                >
                  <FaInstagram />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-[#0066CC] transition-colors"
                >
                  <FaTiktok />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
            <p>© 2025 VolunteerHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
