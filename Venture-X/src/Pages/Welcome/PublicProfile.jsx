import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const PublicProfile = () => {
  const navigate = useNavigate();
  const [bio, setBio] = useState("Avid investor");
  const [linkedinUrl, setLinkedinUrl] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const maxBioLength = 140;

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setProfileImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const isFormValid = bio.trim().length > 0;

  return (
    <div className="max-w-4xl mx-auto p-6 pb-28 font-sans">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-semibold mb-2">Create a public profile</h1>
        <p className="text-gray-600 mb-12">
          This is what founders or other investors can see
        </p>
      </div>

      {/* Profile Section */}
      <div className="max-w-2xl mx-auto">
        {/* Profile Avatar */}
        <div className="flex justify-center mb-8 bg-gray-100 py-4">
          <div className="relative">
            <div className="w-32 h-32 rounded-full bg-gray-600 flex items-center justify-center text-white text-4xl font-semibold overflow-hidden">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <svg
                  className="w-16 h-16 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            {/* Hidden file input for profile picture upload */}
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer rounded-full"
              onChange={handleImageUpload}
            />
          </div>
        </div>

        {/* Bio Section */}
        <div className="mb-6">
          <label className="block text-sm text-gray-600 mb-2">Your bio</label>
          <div className="relative">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value.slice(0, maxBioLength))}
              className="w-full px-4 py-3 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows={4}
              placeholder="Tell others about yourself..."
              maxLength={maxBioLength}
            />
            <div className="absolute bottom-3 right-3 text-xs text-gray-400">
              {bio.length}/{maxBioLength}
            </div>
          </div>
        </div>

        {/* LinkedIn URL Section */}
        <div className="mb-8">
          <div className="relative">
            <input
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              className="w-full px-4 py-3 pl-10 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="LinkedIn or personal website"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
              <svg
                className="w-5 h-5 text-gray-400"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                <path d="M5 5a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2v-2a1 1 0 10-2 0v2H5V7h2a1 1 0 000-2H5z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Fixed Footer */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <button
            type="button"
            className="text-gray-700 underline underline-offset-2 curosr-pointer"
            onClick={() => navigate("/welcome/investment_plans")}
          >
            Back
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="px-4 py-2 border rounded hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate("/welcome/finish")}
            >
              Skip
            </button>
            <button
              type="button"
              disabled={!isFormValid}
              className={`px-5 py-2 rounded text-white cursor-pointer ${
                isFormValid
                  ? "bg-black hover:bg-gray-900"
                  : "bg-gray-400 cursor-not-allowed"
              }`}
              onClick={() => isFormValid && navigate("/welcome/finish")}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PublicProfile;
