import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
      <Header />
      <div
        className="bg-cover bg-center min-h-screen"
        style={{
          backgroundImage:
            "url('https://image.slidesdocs.com/responsive-images/background/blue-white-leaf-outdoor-sunny-rural-cartoon-beautiful-powerpoint-background_9a81889e57__960_540.jpg')",
        }}
      >
        {children}
      </div>
      <Footer />
    </div>
  );
}
