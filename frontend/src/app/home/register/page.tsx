"use client";
import { useState } from "react";
import Link from "next/link";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaHeart,
  FaHome,
  FaPhoneSquareAlt,
  FaAddressCard,
  FaImage,
} from "react-icons/fa";
import { useRouter } from 'next/navigation';  // nếu đang dùng app/ (Next.js 13+)


export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    phoneNumber: "",
    cccd: "",
    imageUrl: "",
    agreeTerms: false,
  });
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle registration logic here
      const {
        fullName,
        email,
        password,
        confirmPassword,
        address,
        phoneNumber,
        cccd,
        imageUrl,
        agreeTerms,
      } = formData;

      if (
        !fullName ||
        !email ||
        !password ||
        !confirmPassword ||
        !address ||
        !phoneNumber ||
        !cccd ||
        !agreeTerms
      ) {
        alert("Vui lòng điền đầy đủ thông tin!");
        return;
      }

      // // kiểm tra email hợp lệ
      // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      // if (!emailRegex.test(email)) {
      //   alert("Địa chỉ email không hợp lệ!");
      //   return;
      // }

      // // kiểm tra mật khẩu
      // if (password.length < 6) {
      //   alert("Mật khẩu phải có ít nhất 6 ký tự!");
      //   return;
      // }

      // // kiểm tra khớp mật khẩu
      // if (password !== confirmPassword) {
      //   alert("Mật khẩu xác nhận không khớp!");
      //   return;
      // }

      // // kiểm tra số điện thoại (10 số)
      // const phoneRegex = /^0\d{9}$/;
      // if (!phoneRegex.test(phoneNumber)) {
      //   alert("Số điện thoại không hợp lệ!");
      //   return;
      // }

      // // kiểm tra CCCD (12 số)
      // const cccdRegex = /^\d{12}$/;
      // if (!cccdRegex.test(cccd)) {
      //   alert("Số CCCD không hợp lệ!");
      //   return;
      // }

      // // kiểm tra đã upload ảnh
      // if (!imageUrl) {
      //   alert("Vui lòng chọn ảnh đại diện!");
      //   return;
      // }

      // ✅ nếu tất cả hợp lệ
      console.log("Registration data:", formData);
      alert("Đăng ký thành công!");
      router.push("/home/login");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 mt-10"
      style={{
        backgroundImage:
          "url('https://image.slidesdocs.com/responsive-images/background/blue-white-leaf-outdoor-sunny-rural-cartoon-beautiful-powerpoint-background_9a81889e57__960_540.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <FaHeart className="h-10 w-10 text-white" />
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-2 drop-shadow-lg">
            Tham gia cùng chúng tôi
          </h2>
          <p className="text-lg text-white opacity-90 drop-shadow">
            Tạo tài khoản để bắt đầu hành trình tình nguyện
          </p>
        </div>

        {/* Form */}
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="sr-only">
                Họ và tên
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaUser className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  className="appearance-none rounded-xl relative block w-full px-3 py-4 pl-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Họ và tên"
                  value={formData.fullName}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none rounded-xl relative block w-full px-3 py-4 pl-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Địa chỉ email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="sr-only">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none rounded-xl relative block w-full px-3 py-4 pl-12 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="sr-only">
                Xác nhận mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  className="appearance-none rounded-xl relative block w-full px-3 py-4 pl-12 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Xác nhận mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? (
                    <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  ) : (
                    <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="address" className="sr-only">
                Địa chỉ
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaHome className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="address"
                  name="address"
                  type="text"
                  required
                  className="appearance-none rounded-xl relative block w-full px-3 py-4 pl-12 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Địa chỉ"
                  value={formData.address}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="phoneNumber" className="sr-only">
                Số điện thoại
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaPhoneSquareAlt className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phoneNumber"
                  name="phoneNumber"
                  type="text"
                  required
                  className="appearance-none rounded-xl relative block w-full px-3 py-4 pl-12 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Số điện thoại"
                  value={formData.phoneNumber}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="cccd" className="sr-only">
                CCCD
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaAddressCard className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="cccd"
                  name="cccd"
                  type="text"
                  required
                  className="appearance-none rounded-xl relative block w-full px-3 py-4 pl-12 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="CCCD"
                  value={formData.cccd}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            <div>
              <label htmlFor="imageUrl" className="sr-only">
                Ảnh đại diện
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaImage className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="imageUrl"
                  name="imageUrl"
                  type="file"
                  required
                  className="appearance-none rounded-xl relative block w-full px-3 py-4 pl-12 pr-12 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                  placeholder="Ảnh đại diện"
                  value={formData.imageUrl}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-center">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                checked={formData.agreeTerms}
                onChange={handleInputChange}
                required
              />
              <label
                htmlFor="agreeTerms"
                className="ml-2 block text-sm text-gray-700"
              >
                Tôi đồng ý với{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Điều khoản sử dụng
                </a>{" "}
                và{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-500 font-medium"
                >
                  Chính sách bảo mật
                </a>
              </label>
            </div>

            {/* Submit Button */}
            <div> 
              <button
                type="submit"
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 transform hover:scale-105 shadow-lg"
              >
                Tạo tài khoản
              </button>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Đã có tài khoản?{" "}
                <Link
                  href="/home/login"
                  className="font-medium text-blue-600 hover:text-blue-500 transition duration-200"
                >
                  Đăng nhập ngay
                </Link>
              </p>
            </div>

            {/* Social Divider */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">
                    Hoặc đăng ký với
                  </span>
                </div>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition duration-200"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="ml-2">Google</span>
              </button>

              <button
                type="button"
                className="w-full inline-flex justify-center py-3 px-4 border border-gray-300 rounded-xl bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 transition duration-200"
              >
                <svg className="w-5 h-5" fill="#1877F2" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span className="ml-2">Facebook</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
