import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuthSubmit } from "../hooks/useAuthSubmit";
import { useAuth } from "../context/authContext";
import Input from "../components/common/Input";
import PasswordField from "../components/common/PasswordField";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";
import { FaStickyNote } from "react-icons/fa";

function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { signup } = useAuth();

const { error, setError, isSubmitting, submit } = useAuthSubmit({
  getDefaultErrorMessage: () => "Registration failed.",
  getCatchErrorMessage: (err) =>
    err.response?.data?.message || "Registration failed. Please try again.",
});

const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");

  if (!name || !email || !password) {
    setError("All fields are required.");
    return;
  }

  if (password.length < 6) {
    setError("Password must be at least 6 characters long.");
    return;
  }

  await submit(() => signup(name, email, password));
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
          <h2 className="text-4xl font-extrabold tracking-tight mb-4 leading-tight text-white">
            Your digital notebook<br />
            Anywhere you go
          </h2>
          <p className="text-white/80 text-base leading-relaxed text-xl">
            Jot down thoughts instantly and keep all your notes safely stored in one minimalist, elegant workspace.
          </p>
        </div>

        <div className="text-sm text-white/70">
          © {new Date().getFullYear()} All rights reserved.
        </div>
      </div>

      <div className="lg:col-span-9 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-3xl bg-purple-300/10 backdrop-blur-3xl rounded-3xl shadow-[0_8px_32px_0_rgba(124,119,198,0.25)] border-purple-200/50 border border-purple-300 p-12 sm:p-16">
          <div className="text-center mb-10">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-[#3F3A85]">Create an Account</h1>
            <p className="text-base sm:text-lg text-[#5A55A3] mt-4">Sign up to get started with NotesApp</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-base rounded-r-lg">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6 ">
            <div>
              <label htmlFor="name" className="text-lg block text-base font-semibold text-[#3F3A85] mb-2">
                Full Name
              </label>
              <Input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={isSubmitting}
                placeholder="Enter your name"
                className="text-lg w-full bg-transparent px-4 py-3 text-base text-gray-800 border-none focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="email" className="text-lg block text-base font-semibold text-[#3F3A85] mb-2">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                placeholder="Enter your email"
                className="text-lg w-full bg-transparent px-4 py-3 text-base text-gray-800 border-none focus:outline-none"
              />
            </div>

            <div>
              <PasswordField
                id="password"
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
                placeholder="Create a password"
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
                  className="md:text-xl text-lg w-full py-4 bg-[#7C77C6] hover:bg-[#6c67b5] text-white font-semibold  rounded-xl shadow-xl shadow-purple-300 transition-all duration-200"
                >
                  Sign Up
                </Button>
              )}
            </div>
          </form>

          <p className="text-lg mt-8 text-center text-base font-medium text-[#5A55A3]">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-[#3F3A85] hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>

    </div>
  );
}

export default Signup;