import Image from "next/image";

export default function Footer() {
  return (
    <footer className="flex flex-col items-center justify-center w-full h-20 bg-blue-400 text-white font-bold text-3xl">
      <div>Nhiệt huyết tình nguyện viên © 2025</div>
      <div className="flex gap-4">
        contact:
        <a href="mailto:contact@volunteer.com" aria-label="Email">
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
            className="mt-2"
          />
        </a>
        <a
          href="https://www.facebook.com/hqb2811/"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Facebook"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width={16}
            height={16}
            viewBox="0 0 24 24"
            fill="#1877F2"
            className="mt-2"
          >
            <path d="M22.675 0h-21.35C.597 0 0 .598 0 1.333v21.333C0 23.403.597 24 1.325 24h11.495v-9.294H9.691v-3.622h3.129V8.413c0-3.1 1.894-4.788 4.659-4.788 1.325 0 2.463.098 2.794.142v3.24l-1.918.001c-1.504 0-1.796.716-1.796 1.765v2.316h3.587l-.467 3.622h-3.12V24h6.116c.728 0 1.325-.597 1.325-1.334V1.333C24 .598 23.403 0 22.675 0z" />
          </svg>
        </a>
      </div>
    </footer>
  );
}
