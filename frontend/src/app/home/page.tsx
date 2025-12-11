import Image from "next/image";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 pt-20 pb-5 text-[#595d7d]">
        <div className=" bg-opacity-60 p-8 rounded-2xl max-w-5xl mx-auto shadow-2xl">
          {/* Main Title */}
          <h1 className=" text-4xl md:text-5xl font-bold text-center mb-8 leading-tight">
            Tình Nguyện – Lan tỏa yêu thương, tạo nên thay đổi
          </h1>

          {/* Subtitle */}
          <p className=" text-xl md:text-2xl text-center mb-10 opacity-90">
            Kết nối trái tim - Chia sẻ yêu thương - Tạo giá trị cho cộng đồng
          </p>

          {/* Main Content */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Left Column */}
            <div className="space-y-6">
              <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm">
                <h3 className=" text-lg font-semibold mb-3 flex items-center">
                  <span className="w-2 h-2 bg-yellow-400 rounded-full mr-3"></span>
                  Tầm nhìn của chúng tôi
                </h3>
                <p className="text-sm leading-relaxed">
                  Mỗi việc làm nhỏ đều có thể tạo nên sự thay đổi lớn lao. Tại
                  VolunteerHub, chúng tôi tin rằng mỗi người đều có khả năng tạo
                  ra tác động tích cực cho xã hội.
                </p>
              </div>

              <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm">
                <h3 className="text-lg font-semibold mb-3 flex items-center">
                  <span className="w-2 h-2 bg-green-400 rounded-full mr-3"></span>
                  Dành cho mọi người
                </h3>
                <p className="text-sm leading-relaxed">
                  Dù bạn là học sinh, sinh viên, nhân viên văn phòng hay người
                  đã nghỉ hưu - chỉ cần có tấm lòng và mong muốn đóng góp, bạn
                  đã là một phần quan trọng.
                </p>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm">
                <h3 className=" text-lg font-semibold mb-3 flex items-center">
                  <span className="w-2 h-2 bg-blue-400 rounded-full mr-3"></span>
                  Những gì bạn có thể làm
                </h3>
                <ul className=" text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="text-blue-300 mr-2">•</span>
                    Tham gia các dự án bảo vệ môi trường
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-300 mr-2">•</span>
                    Hỗ trợ giáo dục và chăm sóc trẻ em
                  </li>
                  <li className="flex items-start">
                    <span className="text-blue-300 mr-2">•</span>
                    Giúp đỡ người yếu thế trong cộng đồng
                  </li>
                </ul>
              </div>

              <div className="bg-white bg-opacity-10 p-6 rounded-lg backdrop-blur-sm">
                <h3 className=" text-lg font-semibold mb-3 flex items-center">
                  <span className="w-2 h-2 bg-purple-400 rounded-full mr-3"></span>
                  Lợi ích bạn nhận được
                </h3>
                <ul className=" text-sm space-y-2">
                  <li className="flex items-start">
                    <span className="text-purple-300 mr-2">•</span>
                    Phát triển kỹ năng làm việc nhóm
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-300 mr-2">•</span>
                    Gặp gỡ những người cùng chí hướng
                  </li>
                  <li className="flex items-start">
                    <span className="text-purple-300 mr-2">•</span>
                    Tìm thấy ý nghĩa trong cuộc sống
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <p className="text-lg mb-6 italic">
              "Mỗi trái tim tình nguyện là một ngọn đèn sáng - và khi cùng nhau,
              chúng ta có thể thắp sáng cả thế giới."
            </p>
            <a href="/home/login" className="inline-block">
              <button className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-full text-lg transition duration-300 transform hover:scale-105 shadow-lg">
                Tham gia ngay hôm nay
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* Sponsors and Partners Section */}
      <div className="relative px-4 overflow-hidden">
        {/* Background with gradient overlay */}
        {/* <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://image.slidesdocs.com/responsive-images/background/blue-white-leaf-outdoor-sunny-rural-cartoon-beautiful-powerpoint-background_9a81889e57__960_540.jpg')",
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-400/30 via-green-300/20 to-white/40"></div>
        </div> */}

        {/* Content */}
        <div className="relative max-w-4xl mx-auto">
          {/* <div className="text-center mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-[#595d7d] mb-2 drop-shadow-sm">
              Đơn Vị Đồng Hành
            </h2>
            <div className="w-16 h-0.5 bg-gradient-to-r from-blue-400 to-green-400 mx-auto"></div>
          </div> */}

          {/* Cards Container */}
          <div className="grid md:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {/* Sponsor Card */}
            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex flex-col items-center">
                <div className="mb-2">
                  <span className="inline-block px-3 py-0.5 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                    NHÀ TÀI TRỢ
                  </span>
                </div>

                {/* University Logo */}
                <div className="w-14 h-14 mb-2 relative">
                  <div className="w-full h-full bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-md overflow-hidden">
                    <Image
                      src="/dhcn.png"
                      alt="Trường Đại Học Công Nghệ"
                      width={56}
                      height={56}
                      className="object-cover"
                    />
                  </div>
                </div>

                <h3 className="text-base font-bold text-gray-800 text-center mb-1 leading-tight">
                  Trường Đại Học Công Nghệ
                </h3>
                <p className="text-gray-600 text-center text-xs">
                  Đồng hành cùng hoạt động tình nguyện
                </p>
              </div>
            </div>

            {/* Partner Card */}
            <div className="bg-white bg-opacity-90 backdrop-blur-sm rounded-xl shadow-lg p-4 hover:shadow-xl transition-all duration-300 transform hover:scale-105">
              <div className="flex flex-col items-center">
                <div className="mb-2">
                  <span className="inline-block px-3 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                    ĐỒNG HÀNH CÙNG
                  </span>
                </div>

                {/* Faculty Logo */}
                <div className="w-14 h-14 mb-2 relative">
                  <div className="w-full h-full bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-md overflow-hidden">
                    <Image
                      src="/khoa.png"
                      alt="Khoa Công Nghệ Thông Tin"
                      width={56}
                      height={56}
                      className="object-cover"
                    />
                  </div>
                </div>

                <h3 className="text-base font-bold text-gray-800 text-center mb-1 leading-tight">
                  Khoa Công Nghệ Thông Tin
                </h3>
                <p className="text-gray-600 text-center text-xs">
                  Hỗ trợ phát triển nền tảng công nghệ
                </p>
              </div>
            </div>
          </div>

          {/* Decorative text */}
          <div className="mt-6 text-center">
            <p className="text-black text-sm italic drop-shadow-sm opacity-80">
              "Cùng nhau kiến tạo tương lai tốt đẹp hơn"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
