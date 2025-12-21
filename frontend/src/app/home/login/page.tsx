"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaEnvelope,
  FaLock,
  FaEye,
  FaEyeSlash,
  FaHeart,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";

// Validation helpers
const validateEmail = (email: string): string | null => {
  if (!email.trim()) return "Vui lòng nhập email";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return "Email không hợp lệ";
  return null;
};

const validatePassword = (password: string): string | null => {
  if (!password) return "Vui lòng nhập mật khẩu";
  if (password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
  return null;
};

interface FormErrors {
  email?: string | null;
  password?: string | null;
}

interface TouchedFields {
  email?: boolean;
  password?: boolean;
}

export default function LoginPage() {
  const route = useRouter();
  const { login, isLoading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedFields>({});
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    // Auto-trim for email
    const processedValue = name === "email" ? value.trim() : value;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : processedValue,
    }));

    // Real-time validation for touched fields
    if (touched[name as keyof TouchedFields]) {
      if (name === "email") {
        setFormErrors((prev) => ({
          ...prev,
          email: validateEmail(processedValue),
        }));
      } else if (name === "password") {
        setFormErrors((prev) => ({
          ...prev,
          password: validatePassword(value),
        }));
      }
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));

    if (name === "email") {
      setFormErrors((prev) => ({ ...prev, email: validateEmail(value) }));
    } else if (name === "password") {
      setFormErrors((prev) => ({ ...prev, password: validatePassword(value) }));
    }
  };

  const validateForm = (): boolean => {
    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);

    setFormErrors({ email: emailError, password: passwordError });
    setTouched({ email: true, password: true });

    return !emailError && !passwordError;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate before submit
    if (!validateForm()) {
      return;
    }

    try {
      await login(
        formData.email.trim(),
        formData.password,
        formData.rememberMe
      );
    } catch (err: any) {
      let errorMessage = "Đăng nhập không thành công. Vui lòng thử lại.";

      if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === "string") {
        errorMessage = err;
      }

      setError(errorMessage);
      console.error("Login error:", err);
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
            Chào mừng trở lại!
          </h2>
          <p className="text-lg text-white opacity-90 drop-shadow">
            Đăng nhập để tiếp tục hành trình tình nguyện
          </p>
        </div>

        {/* Form */}
        <div className="bg-white bg-opacity-95 backdrop-blur-sm rounded-2xl shadow-2xl p-8">
          {/* Error Message */}
          {error && (
            <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-red-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-red-800">{error}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setError(null)}
                  className="ml-auto -mx-1.5 -my-1.5 bg-red-50 text-red-500 rounded-lg focus:ring-2 focus:ring-red-400 p-1.5 hover:bg-red-100 inline-flex h-8 w-8 items-center justify-center"
                >
                  <span className="sr-only">Đóng</span>
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    />
                  </svg>
                </button>
              </div>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email */}
            <div>
              <label htmlFor="email" className="sr-only">
                Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope
                    className={`h-5 w-5 ${
                      formErrors.email && touched.email
                        ? "text-red-400"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none rounded-xl relative block w-full px-3 py-4 pl-12 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition duration-200 ${
                    formErrors.email && touched.email
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder="Địa chỉ email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
                />
              </div>
              {formErrors.email && touched.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FaExclamationCircle className="mr-1" /> {formErrors.email}
                </p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="sr-only">
                Mật khẩu
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock
                    className={`h-5 w-5 ${
                      formErrors.password && touched.password
                        ? "text-red-400"
                        : "text-gray-400"
                    }`}
                  />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className={`appearance-none rounded-xl relative block w-full px-3 py-4 pl-12 pr-12 border placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-2 focus:border-transparent transition duration-200 ${
                    formErrors.password && touched.password
                      ? "border-red-500 focus:ring-red-500"
                      : "border-gray-300 focus:ring-blue-500"
                  }`}
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={handleInputChange}
                  onBlur={handleBlur}
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
              {formErrors.password && touched.password && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <FaExclamationCircle className="mr-1" /> {formErrors.password}
                </p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  checked={formData.rememberMe}
                  onChange={handleInputChange}
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 block text-sm text-gray-700"
                >
                  Ghi nhớ đăng nhập
                </label>
              </div>

              <div className="text-sm">
                <a
                  href="#"
                  className="font-medium text-blue-600 hover:text-blue-500 transition duration-200"
                >
                  Quên mật khẩu?
                </a>
              </div>
            </div>

            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-4 px-4 border border-transparent text-lg font-medium rounded-xl text-white bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Đang xử lý...
                  </div>
                ) : (
                  "Đăng nhập"
                )}
              </button>
            </div>

            {/* Registration Link */}
            <div className="text-center">
              <p className="text-sm text-gray-600">
                Chưa có tài khoản?{" "}
                <Link
                  href="/home/register"
                  className="font-medium text-blue-600 hover:text-blue-500 transition duration-200"
                >
                  Đăng ký ngay
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
                    Hoặc đăng nhập với
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

        {/* Additional Info */}
        <div className="text-center">
          <p className="text-sm text-white opacity-75">
            Bằng cách đăng nhập, bạn đồng ý với{" "}
            <a
              href="#"
              className="text-blue-200 hover:text-blue-100 font-medium"
            >
              Điều khoản sử dụng
            </a>{" "}
            và{" "}
            <a
              href="#"
              className="text-blue-200 hover:text-blue-100 font-medium"
            >
              Chính sách bảo mật
            </a>{" "}
            của chúng tôi.
          </p>
        </div>
      </div>
    </div>
  );
}
