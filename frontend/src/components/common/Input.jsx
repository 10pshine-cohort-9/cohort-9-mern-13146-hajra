function Input({ id, className = "", containerClassName = "", ...props }) {
  return (
    <div className={`border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#7C77C6] focus-within:border-transparent bg-white ${containerClassName}`}>
      <input
        id={id}
        {...props}
        className={`w-full border-none focus:outline-none px-3 py-2 text-gray-800 placeholder-gray-400 bg-transparent ${className}`}
      />
    </div>
  );
}

export default Input;