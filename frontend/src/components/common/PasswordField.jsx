import { useState } from "react";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Input from "./Input";

function PasswordField({ label = "Password", id, ...props }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-base font-semibold text-[#3F3A85] mb-2"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <Input
          id={id}
          type={showPassword ? "text" : "password"}
          className="w-full bg-transparent px-4 py-3 pr-12 text-base text-gray-800 border-none outline-none focus:outline-none focus:ring-0 shadow-none"
          {...props}
        />
       <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="text-lg absolute right-4 top-1/2 -translate-y-1/2 text-[#5A55A3] hover:text-[#3F3A85] focus:outline-none border-none bg-transparent cursor-pointer flex items-center justify-center p-0 m-0 z-10"
          tabIndex={-1}
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <FaEyeSlash className="text-lg" /> : <FaEye className="text-lg" />}
        </button>
      </div>
    </div>
  );
}

export default PasswordField;