import { Outlet, useNavigate } from "react-router-dom";
import Header from "../components/header";

export default function Layout() {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col w-full">
      {/* Header (fixed height) */}
      <Header />

      {/* Main Content (fills available space) */}
      <main className="flex-1 w-full overflow-hidden">
        <div className="h-full w-full">
          <Outlet />
        </div>
      </main>

      {/* Footer */}
      <div className="border-t border-[#092e4650] bg-white text-[#092e46] px-4 py-1 flex items-center justify-center">
        <p className="text-sm text-[#092e46]">
          © {new Date().getFullYear()} Instacrm. All Rights Reserved.
        </p>
      </div>
    </div>
  );
}
