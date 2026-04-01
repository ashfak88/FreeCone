"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import DashboardHeader from "@/components/DashboardHeader";
import ImageCropperModal from "@/components/ImageCropperModal";

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    title: "",
    bio: "",
    location: "",
    rate: 0
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<null | "success" | "error">(null);
  const [serverError, setServerError] = useState("");
  const skillInputRef = useRef<HTMLInputElement>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showCropper, setShowCropper] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        title: user.title || "",
        bio: user.bio || "",
        location: user.location || "",
        rate: user.rate || 0
      });
      setSkills(user.skills || []);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id || e.target.name]: id === "rate" ? Number(value) : value
    }));
  };

  const handleAddSkill = () => {
    const trimmed = skillInput.trim();
    if (!trimmed) return;
    if (skills.map((s) => s.toLowerCase()).includes(trimmed.toLowerCase())) {
      setSkillInput("");
      return;
    }
    setSkills((prev) => [...prev, trimmed]);
    setSkillInput("");
    skillInputRef.current?.focus();
  };

  const handleRemoveSkill = (index: number) => {
    setSkills((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSkillKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddSkill();
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        throw new Error("You are not logged in. Please sign in again.");
      }

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ ...formData, skills })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update profile");
      }

      updateUser({
        ...data,
        id: data._id,
        skills,
        isProfileComplete: true
      });

      setSaveStatus("success");
      setServerError("");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      console.error("Save error:", err);
      setServerError(err.message || "An unexpected error occurred.");
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemovePhoto = async () => {
    if (!confirm("Are you sure you want to remove your profile photo?")) return;

    setIsSaving(true);
    setSaveStatus(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Not logged in");

      const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
      const response = await fetch(`${API_URL}/upload/profile-photo`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Removal failed");

      if (user) {
        updateUser({
          ...user,
          imageUrl: "",
          avatar: ""
        });
      }

      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      console.error("Remove photo error:", err);
      setServerError(err.message || "Failed to remove photo");
      setSaveStatus("error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDiscard = () => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        title: user.title || "",
        bio: user.bio || "",
        location: user.location || "",
        rate: user.rate || 0
      });
      setSkills(user.skills || []);
      setSkillInput("");
      setSaveStatus(null);
    }
  };

  if (!user) return null;

  return (
    <div className="flex-1 overflow-y-auto">
      <DashboardHeader
        user={user}
        title="Profile Management"
        subtitle="Manage your professional identity and account preferences."
        showSearch={false}
      >
        <div className="flex items-center gap-3">
          <button 
            type="button"
            onClick={() => router.push("/notifications")}
            className="text-slate-500 hover:text-slate-800 transition-colors relative"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
          
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className={`hidden sm:block ${isSaving ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/90"} bg-primary text-white px-6 py-2 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2`}
          >
            {isSaving ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                Saving...
              </>
            ) : (
              "Save Changes"
            )}
          </button>
        </div>
      </DashboardHeader>

      <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
        {saveStatus === "success" && (
          <div className="bg-green-500 text-white px-4 py-3 rounded-xl shadow-lg flex items-center gap-2">
            <span className="material-symbols-outlined">check_circle</span>
            <span className="font-bold">Profile updated successfully!</span>
          </div>
        )}

        {saveStatus === "error" && (
          <div className="bg-red-500 text-white px-4 py-3 rounded-xl shadow-lg flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined">error</span>
              <span className="font-bold">Failed to update profile.</span>
            </div>
            {serverError && <p className="text-xs opacity-90 ml-8">{serverError}</p>}
          </div>
        )}

        {/* Profile Photo & Professional Info */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">account_circle</span>
            <h3 className="font-bold text-lg">Professional &amp; Account Info</h3>
          </div>
          <div className="p-6 space-y-8">
            {/* Profile Photo Upload */}
            <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white dark:border-slate-800 shadow-md bg-slate-100 ring-1 ring-slate-200 dark:ring-slate-700">
                  <img
                    src={user.avatar || user.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=0ea5e9&color=fff`}
                    alt="Profile Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                {isSaving && (
                  <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
                    <span className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  </div>
                )}
              </div>
              <div className="space-y-3 text-center sm:text-left">
                <h4 className="font-bold text-slate-900 dark:text-slate-100">Profile Picture</h4>
                <p className="text-xs text-slate-500 max-w-xs">We support JPG, PNG or WebP. Max size 2MB.</p>
                <div className="flex items-center gap-3 justify-center sm:justify-start">
                  <input
                    type="file"
                    id="photo-upload"
                    className="hidden"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;

                      // Read file and open cropper
                      const reader = new FileReader();
                      reader.onload = () => {
                        setSelectedImage(reader.result as string);
                        setShowCropper(true);
                        // Reset input so the same file can be selected again
                        e.target.value = "";
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                  <label
                    htmlFor="photo-upload"
                    className="px-4 py-2 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-lg cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    Change Photo
                  </label>

                  {(user?.imageUrl || user?.avatar) && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      disabled={isSaving}
                      className="px-4 py-2 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-xs font-bold rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 transition-all disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                      Remove
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Full Name</label>
                <input
                  id="name"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  type="text"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                <input
                  id="email"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Professional Title</label>
                <input
                  id="title"
                  placeholder="e.g. Senior Full Stack Developer"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  type="text"
                  value={formData.title}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Location</label>
                <input
                  id="location"
                  placeholder="e.g. New York, USA"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  type="text"
                  value={formData.location}
                  onChange={handleInputChange}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Professional Bio</label>
                <textarea
                  id="bio"
                  className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  rows={4}
                  placeholder="Talk about your experience..."
                  value={formData.bio}
                  onChange={handleInputChange}
                ></textarea>
              </div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Skills Section */}
          <div className="md:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">psychology</span>
              <h3 className="font-bold text-lg">Skills &amp; Expertise</h3>
              <span className="ml-auto text-xs text-slate-400 font-medium bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg">
                {skills.length} skill{skills.length !== 1 ? "s" : ""}
              </span>
            </div>
            <div className="p-6 space-y-5">
              {/* Skill chips */}
              <div className="flex flex-wrap gap-2 min-h-[48px]">
                {skills.length > 0 ? (
                  skills.map((skill, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-xl text-sm font-bold"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(index)}
                        className="w-4 h-4 rounded-full flex items-center justify-center hover:bg-primary/20 transition-colors text-primary/60 hover:text-primary leading-none"
                        title="Remove skill"
                      >
                        ×
                      </button>
                    </span>
                  ))
                ) : (
                  <p className="text-slate-400 italic text-sm">No skills added yet. Add your first skill below.</p>
                )}
              </div>

              {/* Add skill input */}
              <div className="flex gap-2">
                <input
                  ref={skillInputRef}
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleSkillKeyDown}
                  placeholder="e.g. React, Figma, Python..."
                  className="flex-1 p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all text-sm"
                />
                <button
                  type="button"
                  onClick={handleAddSkill}
                  disabled={!skillInput.trim()}
                  className="px-4 py-3 bg-primary text-white rounded-xl font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5 shadow-sm"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  Add
                </button>
              </div>
              <p className="text-xs text-slate-400">
                Press{" "}
                <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 font-mono text-xs">
                  Enter
                </kbd>{" "}
                or click <strong>Add</strong> to add a skill. Click <strong>×</strong> on a chip to remove it.
              </p>
            </div>
          </div>

          {/* Hourly Rate */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">monetization_on</span>
              <h3 className="font-bold text-lg">Hourly Rate</h3>
            </div>
            <div className="p-6 space-y-4">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-black">$</span>
                <input
                  id="rate"
                  className="w-full pl-10 p-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all font-black text-xl"
                  type="number"
                  value={formData.rate}
                  onChange={handleInputChange}
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-bold">/ hr</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                Clients will see this rate on your profile. Our platform fee is included.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Image Cropper Modal */}
      {showCropper && selectedImage && (
        <ImageCropperModal
          image={selectedImage}
          onCancel={() => {
            setShowCropper(false);
            setSelectedImage(null);
          }}
          onCropComplete={async (croppedBlob) => {
            setShowCropper(false);
            setSelectedImage(null);
            
            setIsSaving(true);
            setSaveStatus(null);
            try {
              const token = localStorage.getItem("accessToken");
              const formData = new FormData();
              // Create a file from the blob
              const file = new File([croppedBlob], "profile-photo.jpg", { type: "image/jpeg" });
              formData.append("image", file);

              const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001/api";
              const response = await fetch(`${API_URL}/upload/profile-photo`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`
                },
                body: formData
              });

              const data = await response.json();
              if (!response.ok) throw new Error(data.message || "Upload failed");

              if (user) {
                updateUser({
                  ...user,
                  imageUrl: data.imageUrl,
                  avatar: data.imageUrl
                });
              }

              setSaveStatus("success");
              setTimeout(() => setSaveStatus(null), 3000);
            } catch (err: any) {
              console.error("Upload error:", err);
              setServerError(err.message || "Failed to upload photo");
              setSaveStatus("error");
            } finally {
              setIsSaving(false);
            }
          }}
        />
      )}

      <div className="h-10"></div>
    </div>
  );
}
