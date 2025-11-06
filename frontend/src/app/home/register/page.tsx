"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
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
    agreeTerms: false,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const router = useRouter();

  // Xử lý input text/checkbox
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // Xử lý file input
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const {
      fullName,
      email,
      password,
      confirmPassword,
      address,
      phoneNumber,
      cccd,
      agreeTerms,
    } = formData;

    // Validation cơ bản
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
      alert("Vui lòng điền đầy đủ thông tin và đồng ý điều khoản!");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert("Địa chỉ email không hợp lệ!");
      return;
    }

    if (password.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự!");
      return;
    }

    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }

    const phoneRegex = /^0\d{9}$/;
    if (!phoneRegex.test(phoneNumber)) {
      alert("Số điện thoại không hợp lệ!");
      return;
    }

    const cccdRegex = /^\d{12}$/;
    if (!cccdRegex.test(cccd)) {
      alert("Số CCCD không hợp lệ!");
      return;
    }

    if (!imageFile) {
      alert("Vui lòng chọn ảnh đại diện!");
      return;
    }

    // Submit data
    try {
      setIsLoading(true);
      const API_URL = process.env.NEXT_PUBLIC_API_URL || "/api";

      // Convert image to base64
      const reader = new FileReader();
      reader.readAsDataURL(imageFile);
      
      reader.onload = async () => {
        const avatarBase64 = reader.result as string;

        const requestData = {
          name: fullName,              // Backend expects "name"
          email: email,
          password: password,
          phone: phoneNumber,          // Backend expects "phone"
          address: address,
          addressCard: cccd,           // Backend expects "addressCard"
          avatar: avatarBase64,        // Base64 string
        };

        try {
          const response = await axios.post(`${API_URL}/register`, requestData, {
            headers: { 
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
          });

          if (response.status === 201 || response.status === 200) {
            alert("Đăng ký thành công!");
            router.push("/home/login");
          }
        } catch (error: any) {
          console.error("Lỗi đăng ký: ", error);
          const errorMsg = error.response?.data?.message 
            || error.response?.data?.error 
            || "Đăng ký thất bại. Vui lòng thử lại.";
          alert(errorMsg);
        } finally {
          setIsLoading(false);
        }
      };

      reader.onerror = () => {
        alert("Không thể đọc file ảnh!");
        setIsLoading(false);
      };
    } catch (error: any) {
      console.error("Lỗi đăng ký: ", error);
      alert("Đăng ký thất bại. Vui lòng thử lại.");
      setIsLoading(false);
    }
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
            <InputWithIcon
              id="fullName"
              name="fullName"
              placeholder="Họ và tên"
              icon={<FaUser className="h-5 w-5 text-gray-400" />}
              value={formData.fullName}
              onChange={handleInputChange}
            />

            {/* Email */}
            <InputWithIcon
              id="email"
              name="email"
              type="email"
              placeholder="Địa chỉ email"
              icon={<FaEnvelope className="h-5 w-5 text-gray-400" />}
              value={formData.email}
              onChange={handleInputChange}
            />

            {/* Password */}
            <PasswordInput
              id="password"
              name="password"
              placeholder="Mật khẩu"
              show={showPassword}
              setShow={setShowPassword}
              value={formData.password}
              onChange={handleInputChange}
            />

            {/* Confirm Password */}
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              placeholder="Xác nhận mật khẩu"
              show={showConfirmPassword}
              setShow={setShowConfirmPassword}
              value={formData.confirmPassword}
              onChange={handleInputChange}
            />

            {/* Address */}
            <InputWithIcon
              id="address"
              name="address"
              placeholder="Địa chỉ"
              icon={<FaHome className="h-5 w-5 text-gray-400" />}
              value={formData.address}
              onChange={handleInputChange}
            />

            {/* Phone */}
            <InputWithIcon
              id="phoneNumber"
              name="phoneNumber"
              placeholder="Số điện thoại"
              icon={<FaPhoneSquareAlt className="h-5 w-5 text-gray-400" />}
              value={formData.phoneNumber}
              onChange={handleInputChange}
            />

            {/* CCCD */}
            <InputWithIcon
              id="cccd"
              name="cccd"
              placeholder="CCCD"
              icon={<FaAddressCard className="h-5 w-5 text-gray-400" />}
              value={formData.cccd}
              onChange={handleInputChange}
            />

            {/* Image */}
            <div>
              <label htmlFor="image" className="sr-only">
                Ảnh đại diện
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaImage className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="image"
                  name="image"
                  type="file"
                  accept="image/*"
                  required
                  onChange={handleFileChange}
                  className="appearance-none rounded-xl relative block w-full px-3 py-4 pl-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
                />
              </div>
            </div>

            {/* Terms */}
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
                <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">
                  Điều khoản sử dụng
                </a>{" "}
                và{" "}
                <a href="#" className="text-blue-600 hover:text-blue-500 font-medium">
                  Chính sách bảo mật
                </a>
              </label>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 transform hover:scale-105 shadow-lg"
            >
              {isLoading ? "Đang xử lý..." : "Tạo tài khoản"}
            </button>

            {/* Login link */}
            <div className="text-center mt-2">
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
          </form>
        </div>
      </div>
    </div>
  );
}

// Component helper: Input có icon
function InputWithIcon({
  id,
  name,
  type = "text",
  placeholder,
  icon,
  value,
  onChange,
}: any) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">{placeholder}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          {icon}
        </div>
        <input
          id={id}
          name={name}
          type={type}
          required
          className="appearance-none rounded-xl relative block w-full px-3 py-4 pl-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
      </div>
    </div>
  );
}

// Component helper: Password input có toggle show/hide
function PasswordInput({
  id,
  name,
  placeholder,
  show,
  setShow,
  value,
  onChange,
}: any) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">{placeholder}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaLock className="h-5 w-5 text-gray-400" />
        </div>
        <input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          required
          className="appearance-none rounded-xl relative block w-full px-3 py-4 pl-12 pr-12 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200"
          placeholder={placeholder}
          value={value}
          onChange={onChange}
        />
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={() => setShow(!show)}
        >
          {show ? (
            <FaEyeSlash className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          ) : (
            <FaEye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
          )}
        </button>
      </div>
    </div>
  );
}
