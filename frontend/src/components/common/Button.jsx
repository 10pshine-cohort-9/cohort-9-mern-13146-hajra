function Button({ children, className = "", type = "button", ...props }) {  return (
    <button type={type}
      {...props}
      className={`w-full py-2.5 px-4 bg-[#7C77C6] hover:bg-[#6c67b5] text-white font-medium rounded-xl shadow-sm transition-all duration-200 flex justify-center items-center cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
    >
      {children}
    </button>
  );
}

export default Button;