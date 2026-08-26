import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/authContext";
import Input from "../components/common/Input";
import PasswordField from "../components/common/PasswordField";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";
import { FaStickyNote } from "react-icons/fa";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password) {
      setError("Please fill in all fields.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await login(email, password);
      if (res.success) {
        navigate("/dashboard");
      } else {
        setError(res.message || "Failed to sign in.");
      }
    } 
     catch (err) {
    setError(
      err.response?.data?.message || 
      err.message || 
      "An error occurred during sign in."
    );
  
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 lg:grid-cols-12 bg-[#F5F6FA]">
      
      <div className="hidden lg:flex lg:col-span-3 flex-col justify-between bg-gradient-to-br from-[#7C77C6] to-[#6c67b5] p-12 text-white relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-black/10 blur-2xl pointer-events-none" />

        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/10 backdrop-blur-md rounded-xl">
            <FaStickyNote className="text-3xl text-white" />
          </div>
          <span className="text-3xl font-bold tracking-wider">NotesApp</span>
        </div>

        <div className="my-auto max-w-sm">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            Welcome Back!
          </h1>
          <p className="text-white/80 text-base leading-relaxed text-xl">
            Access your personal workspace, pick up right where you left off, and keep all your notes safely synchronized.
          </p>
        </div>

        <div className="text-sm text-white/70">
          © {new Date().getFullYear()} All rights reserved.
        </div>
      </div>

      <div className="lg:col-span-9 flex items-center justify-center p-12 sm:p-20">
        <div className="w-full max-w-3xl bg-purple-300/10 backdrop-blur-3xl rounded-3xl shadow-[0_8px_32px_0_rgba(124,119,198,0.25)] border-purple-200/50) border border-purple-300 p-12 sm:p-16">
          
          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-4xl sm:text-5xl font-extrabold text-[#3F3A85]">Sign In to Your Account</h2>
            <p className="text-base sm:text-lg text-[#5A55A3] mt-4">Please enter your details to continue.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-base rounded-r-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <label htmlFor="email" className="text-lg block text-base font-semibold text-[#3F3A85] mb-2">Email Address</label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                className="text-lg w-full bg-transparent px-4 py-3 text-base text-gray-800 border-none focus:outline-none focus:ring-0"
              />
            </div>

            <div>
              <PasswordField
                id="password"
                label="Password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                className="text-lg w-full bg-transparent px-4 py-3 pr-12 text-base text-gray-800 border-none outline-none focus:outline-none focus:ring-0 shadow-none"
              />
            </div>

            <div className="pt-3">
              {isSubmitting ? (
                <div className="flex justify-center py-2"><Loader /></div>
              ) : (
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="md:text-xl text-lg w-full py-4 bg-[#7C77C6] hover:bg-[#6c67b5] text-white font-semibold rounded-xl shadow-xl shadow-purple-300 transition-all duration-200"
                >
                  Sign In
                </Button>
              )}
            </div>

            <p className="text-lg text-center text-base font-medium text-[#5A55A3] mt-8">
              Don't have an account?{" "}
              <Link to="/signup" className="text-lg font-bold text-[#3F3A85] hover:underline">
                Sign up
              </Link>
            </p>
          </form>

        </div>
      </div>

    </div>
  );
}

export default Login;