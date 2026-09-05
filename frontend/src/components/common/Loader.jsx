function Loader() {
  return (
    <output className="flex justify-center items-center py-2">
      <div className="w-6 h-6 border-2 border-[#7C77C6] border-t-transparent rounded-full animate-spin"></div>
      <span className="sr-only">Loading...</span>
    </output>
  );
}

export default Loader;