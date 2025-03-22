import NavBar from "@/components/Navbar";
import Image from "next/image";
import Footer from "@/components/Footer";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="h-screen w-screen bg-accent flex flex-col items-center justify-between">
      <NavBar />
      <div className="w-full flex-1 flex items-center justify-between">
        <div className="hidden md:flex md:w-1/2 h-full p-2 items-center justify-center">
          <div className="relative w-full h-full rounded-lg overflow-hidden">
            <Image
              src="/images/signin-placeholder.jpg"
              alt="FastCut"
              fill
              style={{ objectFit: "cover" }}
              className="rounded-lg shadow-lg"
              priority
            />
          </div>
        </div>
        <div className="w-full md:w-1/2 h-full flex items-center justify-center p-4">
          {children}
        </div>
      </div>
      <Footer />
    </main>
  );
};

