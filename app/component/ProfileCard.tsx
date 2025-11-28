"use client";

import React, { useState } from "react";
import { Eye, EyeOff, Save, X, User as UserIcon, Camera, Mail, BadgeAlert, Key } from "lucide-react";

interface ProfileCardProps {
  user: {
    firstName?: string;
    lastName?: string;
    email?: string;
    role?: string;
  } | null;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  formData: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  };
  setFormData: React.Dispatch<React.SetStateAction<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    confirmPassword: string;
  }>>;
  errors: Record<string, string>;
  saving: boolean;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleCancel: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  role: "admin" | "user" | "agent";
}

export default function ProfileCard({
  user,
  isEditing,
  setIsEditing,
  formData,
  setFormData,
  errors,
  saving,
  handleChange,
  handleCancel,
  handleSubmit,
  role
}: ProfileCardProps) {
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      alert('Image size should be less than 2MB');
      return;
    }

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (e) => {
      setProfileImage(e.target?.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const getGradientClasses = () => {
    switch (role) {
      case "admin":
        return "from-blue-600 to-indigo-700";
      case "agent":
        return "from-green-600 to-teal-700";
      case "user":
        return "from-purple-600 to-pink-700";
      default:
        return "from-blue-600 to-indigo-700";
    }
  };

  const getTextColor = () => {
    switch (role) {
      case "admin":
        return "text-blue-200";
      case "agent":
        return "text-green-200";
      case "user":
        return "text-purple-200";
      default:
        return "text-blue-200";
    }
  };

  const getIconColor = () => {
    switch (role) {
      case "admin":
        return "text-blue-600";
      case "agent":
        return "text-green-600";
      case "user":
        return "text-purple-600";
      default:
        return "text-blue-600";
    }
  };

  const getButtonGradient = () => {
    switch (role) {
      case "admin":
        return "from-blue-600 to-indigo-700";
      case "agent":
        return "from-green-600 to-teal-700";
      case "user":
        return "from-purple-600 to-pink-700";
      default:
        return "from-blue-600 to-indigo-700";
    }
  };

  const getDetailCardBg = () => {
    switch (role) {
      case "admin":
        return "bg-blue-50";
      case "agent":
        return "bg-green-50";
      case "user":
        return "bg-purple-50";
      default:
        return "bg-blue-50";
    }
  };

  const getGlassBg = () => {
    switch (role) {
      case "admin":
        return "bg-white bg-opacity-30 backdrop-blur-sm";
      case "agent":
        return "bg-white bg-opacity-30 backdrop-blur-sm";
      case "user":
        return "bg-white bg-opacity-30 backdrop-blur-sm";
      default:
        return "bg-white bg-opacity-30 backdrop-blur-sm";
    }
  };

  return (
    <div className={`rounded-3xl shadow-2xl overflow-hidden border border-white border-opacity-20 ${getGlassBg()}`}>
      <div className={`bg-gradient-to-r ${getGradientClasses()} p-8 text-center relative`}>
        <div className="absolute top-4 right-4 w-24 h-24 bg-white bg-opacity-20 rounded-full blur-xl"></div>
        <div className="absolute bottom-4 left-4 w-32 h-32 bg-white bg-opacity-10 rounded-full blur-xl"></div>
        
        <div className="relative z-10">
          <div className="relative mx-auto mb-6">
            <div className="bg-white bg-opacity-20 backdrop-blur-sm p-1 rounded-full w-32 h-32 flex items-center justify-center shadow-xl border border-white border-opacity-30">
              {profileImage ? (
                <img 
                  src={profileImage} 
                  alt="Profile" 
                  className="w-32 h-32 rounded-full object-cover border-4 border-white border-opacity-30"
                />
              ) : (
                <UserIcon className={`w-16 h-16 ${getIconColor()}`} />
              )}
            </div>
            
            {isEditing && (
              <label 
                className="absolute bottom-2 right-2 bg-white bg-opacity-30 backdrop-blur-sm rounded-full p-3 shadow-lg cursor-pointer hover:bg-opacity-40 transition-all border border-white border-opacity-30"
                aria-label="Change profile picture"
              >
                <Camera className={`w-5 h-5 ${getIconColor()}`} />
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageUpload}
                  disabled={isUploading}
                />
              </label>
            )}
          </div>
          
          <h2 className="text-3xl font-bold text-white mb-2">
            {user?.firstName} {user?.lastName}
          </h2>
          <div className="inline-flex items-center gap-2 px-4 py-1 bg-white bg-opacity-20 rounded-full">
            <BadgeAlert className="w-4 h-4" />
            <p className={`${getTextColor()} capitalize font-medium`}>{user?.role}</p>
          </div>
        </div>
      </div>

      <div className="p-8">
        {isEditing ? (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className={`p-6 rounded-2xl ${getDetailCardBg()} border border-white border-opacity-30 shadow-inner`}>
                <label className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  First Name
                </label>
                <input
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className={`w-full mt-1 p-3 border rounded-xl bg-white bg-opacity-50 backdrop-blur-sm ${
                    errors.firstName ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-300 focus:border-transparent`}
                />
                {errors.firstName && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <span className="w-4 h-4">⚠️</span> {errors.firstName}
                  </p>
                )}
              </div>

              <div className={`p-6 rounded-2xl ${getDetailCardBg()} border border-white border-opacity-30 shadow-inner`}>
                <label className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <UserIcon className="w-5 h-5" />
                  Last Name
                </label>
                <input
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className={`w-full mt-1 p-3 border rounded-xl bg-white bg-opacity-50 backdrop-blur-sm ${
                    errors.lastName ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-300 focus:border-transparent`}
                />
                {errors.lastName && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <span className="w-4 h-4">⚠️</span> {errors.lastName}
                  </p>
                )}
              </div>

              <div className={`p-6 rounded-2xl ${getDetailCardBg()} border border-white border-opacity-30 shadow-inner md:col-span-2`}>
                <label className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Mail className="w-5 h-5" />
                  Email Address
                </label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full mt-1 p-3 border rounded-xl bg-white bg-opacity-50 backdrop-blur-sm ${
                    errors.email ? "border-red-500" : "border-gray-300"
                  } focus:ring-2 focus:ring-blue-300 focus:border-transparent`}
                />
                {errors.email && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <span className="w-4 h-4">⚠️</span> {errors.email}
                  </p>
                )}
              </div>

              <div className={`p-6 rounded-2xl ${getDetailCardBg()} border border-white border-opacity-30 shadow-inner`}>
                <label className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full mt-1 p-3 pr-12 border rounded-xl bg-white bg-opacity-50 backdrop-blur-sm ${
                      errors.password ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-300 focus:border-transparent`}
                    placeholder="Leave blank to keep current"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <span className="w-4 h-4">⚠️</span> {errors.password}
                  </p>
                )}
              </div>

              <div className={`p-6 rounded-2xl ${getDetailCardBg()} border border-white border-opacity-30 shadow-inner`}>
                <label className="font-semibold text-gray-700 mb-2 flex items-center gap-2">
                  <Key className="w-5 h-5" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full mt-1 p-3 pr-12 border rounded-xl bg-white bg-opacity-50 backdrop-blur-sm ${
                      errors.confirmPassword ? "border-red-500" : "border-gray-300"
                    } focus:ring-2 focus:ring-blue-300 focus:border-transparent`}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <EyeOff /> : <Eye />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-red-600 text-sm mt-1 flex items-center gap-1">
                    <span className="w-4 h-4">⚠️</span> {errors.confirmPassword}
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-end mt-8 space-x-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-white bg-opacity-50 backdrop-blur-sm border border-gray-300 rounded-xl hover:bg-opacity-70 transition-all shadow-md"
              >
                <X className="inline mr-2 w-5 h-5" /> Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className={`px-6 py-3 bg-gradient-to-r ${getButtonGradient()} text-white rounded-xl shadow-lg hover:opacity-90 transition-all flex items-center gap-2`}
              >
                <Save className="w-5 h-5" />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className={`p-6 rounded-2xl ${getDetailCardBg()} border border-white border-opacity-30 shadow-inner`}>
              <p className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <UserIcon className="w-5 h-5" />
                First Name
              </p>
              <p className="text-lg">{user?.firstName || "Not provided"}</p>
            </div>

            <div className={`p-6 rounded-2xl ${getDetailCardBg()} border border-white border-opacity-30 shadow-inner`}>
              <p className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <UserIcon className="w-5 h-5" />
                Last Name
              </p>
              <p className="text-lg">{user?.lastName || "Not provided"}</p>
            </div>

            <div className={`p-6 rounded-2xl ${getDetailCardBg()} border border-white border-opacity-30 shadow-inner md:col-span-2`}>
              <p className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <Mail className="w-5 h-5" />
                Email Address
              </p>
              <p className="text-lg">{user?.email || "Not provided"}</p>
            </div>

            <div className={`p-6 rounded-2xl ${getDetailCardBg()} border border-white border-opacity-30 shadow-inner md:col-span-2`}>
              <p className="font-semibold text-gray-700 flex items-center gap-2 mb-2">
                <BadgeAlert className="w-5 h-5" />
                Role
              </p>
              <p className="text-lg capitalize">{user?.role || "Not provided"}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}