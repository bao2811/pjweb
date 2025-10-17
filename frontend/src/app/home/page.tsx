import Image from "next/image";

export default function HomePage() {
  return (
    <div>
      {/* Hero Section */}
      <div className="flex flex-col items-center justify-center min-h-screen px-4 py-20 text-[#595d7d]">
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
    </div>
  );
}
