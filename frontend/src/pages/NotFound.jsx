import { Link } from "react-router-dom";

function NotFound() {
  return (
    <div className="min-h-[calc(100vh-5rem)] bg-gradient-to-br from-[#7C77C6]/20 via-[#EFEEF6] to-[#7C77C6]/30 p-6 sm:p-12 flex justify-center items-center">
      
      <div className="w-full max-w-2xl bg-white/40 backdrop-blur-xl backdrop-saturate-150 rounded-3xl shadow-[0_8px_32px_0_rgba(124,119,198,0.18)] border border-white/60 p-10 sm:p-16 text-center relative overflow-hidden">
        
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/80 to-transparent" />

        <div className="inline-block mb-6 px-5 py-2 bg-white/50 backdrop-blur-md text-[#7C77C6] text-base font-semibold rounded-full shadow-sm border border-white/40">
          404 Error
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-800 mb-4 drop-shadow-sm">
          Page Not Found
        </h1>

        <p className="text-gray-600 text-base sm:text-lg mb-10 leading-relaxed max-w-lg mx-auto font-medium">
          Oops! The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>

        <div className="flex justify-center">
          <Link
            to="/dashboard"
            className="inline-block px-8 py-3.5 bg-[#7C77C6] hover:bg-[#6c67b5] text-white text-base font-medium rounded-xl shadow-lg shadow-[#7C77C6]/25 transition-all duration-200 text-center"
          >
            Back to Dashboard
          </Link>
        </div>

      </div>
    </div>
  );
}

export default NotFound;