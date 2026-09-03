import { useState, useEffect } from "react";
import { useAuth } from "../context/authContext";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import Loader from "../components/common/Loader";

const API_ORIGIN = "http://localhost:5000";

function Profile() {
  const { user, updateUserProfile } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
    }
  }, [user]);

useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:") && typeof URL.revokeObjectURL === "function") {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  
  const getProfileImageUrl = () => {
    if (previewUrl) return previewUrl;
    if (user?.profile_picture) {
      if (user.profile_picture.startsWith("http")) {
        return user.profile_picture;
      }
return `${API_ORIGIN}${user.profile_picture}`;
    }
    return null;
  };

  const displayImageSrc = getProfileImageUrl();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", name.trim());
      if (selectedFile) {
        formData.append("profile_picture", selectedFile);
      }
      if (password) {
        if (password.length < 6) {
          setError("New password must be at least 6 characters long.");
          setIsSubmitting(false);
          return;
        }
        formData.append("password", password);
      }

      const res = await updateUserProfile(formData);
      if (res.success) {
        setSuccess("Profile updated successfully!");
        setPassword("");
        setSelectedFile(null);
        if (res.data?.profile_picture) {
setPreviewUrl(`${API_ORIGIN}${res.data.profile_picture}`);
        }
      } else {
        setError(res.message || "Failed to update profile.");
      }
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred while updating profile.");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
<div className="w-full bg-[#F5F6FA] p-6 sm:p-10 flex justify-center items-start">  
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
        
        <div className="bg-gradient-to-r from-[#7C77C6]/15 via-[#7C77C6]/10 to-transparent p-8 sm:p-8 flex flex-col sm:flex-row items-center gap-6 border-b border-gray-100">
          <div className="relative">
            {displayImageSrc ? (
              <img
                src={displayImageSrc}
                alt="Profile"
                className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-[#7C77C6] text-white flex items-center justify-center font-bold text-3xl shadow-md border-4 border-white">
                {name ? name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
          </div>
          <div className="text-center sm:text-left">
            <h1 className="text-2xl font-bold text-[#7C77C6]">{name || "User Profile"}</h1>
            <p className="text-sm text-purple-500 mt-0.5">{email}</p>
            
          </div>
        </div>

        <div className="p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm rounded-r-lg">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-6 p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 text-sm rounded-r-lg">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} data-testid="profile-form" className="space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className="block text-sm font-medium text-[#635fa2]  mb-2">Full Name</label>
                <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#7C77C6] focus-within:border-transparent">
                  <Input
                    id="fullName"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                    className="w-full border-none focus:outline-none px-3 py-2 text-[#635fa2] "
                  />
                </div>
              </div>
              <div>
                <label htmlFor="emailAddress" className="block text-sm font-medium text-[#635fa2]  mb-2">Email Address</label>
                <div className="border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                  <Input
                    id="emailAddress"
                    type="email"
                    value={email}
                    disabled
                    className="w-full border-none bg-gray-50 text-[#7C77C6] cursor-not-allowed px-3 py-2"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="profilePicture" className="block text-sm font-medium text-[#635fa2]  mb-2">Profile Picture</label>
              <input
                id="profilePicture"
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  setSelectedFile(file);
                  if (file) {
                    setPreviewUrl(URL.createObjectURL(file));
                  }
                }}
                disabled={isSubmitting}
                className="block w-full text-sm text-[#7C77C6] file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-[#7C77C6]/10 file:text-[#7C77C6] hover:file:bg-[#7C77C6]/20 cursor-pointer border border-gray-300 rounded-xl p-2 bg-white"
              />
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-[#635fa2] mb-2">New Password</label>
              <div className="border border-gray-300 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#7C77C6] focus-within:border-transparent">
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Leave blank to keep current password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isSubmitting}
                  className="w-full border-none focus:outline-none px-3 py-2"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              {isSubmitting ? (
                <Loader />
              ) : (
                <Button 
                  type="submit" 
                  className="px-6 py-2.5 bg-[#7C77C6] hover:bg-[#6c67b5] text-white font-medium rounded-xl shadow-sm transition-all duration-200"
                >
                  Save Changes
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Profile;