"use client";

import React, { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import DashboardHeader from "@/components/DashboardHeader";
import ImageCropperModal from "@/components/ImageCropperModal";
import Swal from "sweetalert2";
import { API_URL, handleResponse } from "@/lib/api";
import PaymentHistory from "@/components/PaymentHistory";
import { openResume } from "@/lib/utils";

export default function ProfilePage() {
  const router = useRouter();
  const { user, updateUser } = useStore();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    title: "",
    bio: "",
    location: "",
    rate: 0,
    upiId: "",
    cardHolderName: "",
    cardLast4: "",
    cardExpiry: "",
    showAsFreelancer: false
  });
  const [skills, setSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<null | "success" | "error">(null);
  const [serverError, setServerError] = useState("");
  const [isResumeLoading, setIsResumeLoading] = useState(false);
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
        rate: user.rate || 0,
        upiId: user.paymentAccount?.upiId || "",
        cardHolderName: user.paymentAccount?.cardDetails?.holderName || "",
        cardLast4: user.paymentAccount?.cardDetails?.last4 || "",
        cardExpiry: user.paymentAccount?.cardDetails?.expiry || "",
        showAsFreelancer: user.showAsFreelancer || false
      });
      setSkills(user.skills || []);
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    // VALIDATION: If turning ON freelancer visibility, check for required fields
    if (id === "showAsFreelancer" && checked) {
      const missingFields = [];
      if (!formData.title?.trim()) missingFields.push("Professional Title");
      if (!formData.bio?.trim()) missingFields.push("Professional Bio");
      if (!formData.location?.trim()) missingFields.push("Location");
      if (formData.rate <= 0) missingFields.push("Hourly Rate (must be > 0)");
      if (skills.length === 0) missingFields.push("At least one Skill");

      if (missingFields.length > 0) {
        Swal.fire({
          title: "Profile Incomplete",
          html: `To show as a freelancer, please fill in the following details first:<br/><br/><div class="text-left bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-sm border border-slate-200 dark:border-slate-700">${missingFields.map(f => `• ${f}`).join("<br/>")}</div>`,
          icon: "warning",
          confirmButtonColor: "#0ea5e9",
          background: document.documentElement.classList.contains("dark") ? "#0f172a" : "#fff",
          color: document.documentElement.classList.contains("dark") ? "#fff" : "#000",
        });
        return; // Prevent the toggle from turning on
      }
    }
    
    setFormData((prev) => ({
      ...prev,
      [id || e.target.name]: type === "checkbox" ? checked : (id === "rate" ? Number(value) : value)
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

      const response = await fetch(`${API_URL}/users/profile`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          skills,
          paymentAccount: {
            upiId: formData.upiId,
            cardDetails: {
              holderName: formData.cardHolderName,
              last4: formData.cardLast4,
              expiry: formData.cardExpiry
            }
          }
        })
      });
      const data = await handleResponse(response);
      if (!data) return;

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
    const result = await Swal.fire({
      title: 'Remove Photo?',
      text: "Are you sure you want to remove your profile photo?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, remove it',
      background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
    });

    if (!result.isConfirmed) return;

    setIsSaving(true);
    setSaveStatus(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Not logged in");

      const response = await fetch(`${API_URL}/upload/profile-photo`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await handleResponse(response);
      if (!data) return;

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
        rate: user.rate || 0,
        upiId: user.paymentAccount?.upiId || "",
        cardHolderName: user.paymentAccount?.cardDetails?.holderName || "",
        cardLast4: user.paymentAccount?.cardDetails?.last4 || "",
        cardExpiry: user.paymentAccount?.cardDetails?.expiry || ""
      });
      setSkills(user.skills || []);
      setSkillInput("");
      setSaveStatus(null);
    }
  };

  const handleResumeUpload = async (file: File) => {
    setIsResumeLoading(true);
    setSaveStatus(null);
    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("resume", file);

      const response = await fetch(`${API_URL}/upload/resume`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: formData
      });
      const data = await handleResponse(response);
      if (!data) return;

      if (user) {
        updateUser({
          ...user,
          resume: data.resumeUrl
        });
      }

      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      console.error("Resume upload error:", err);
      setServerError(err.message || "Failed to upload resume");
      setSaveStatus("error");
    } finally {
      setIsResumeLoading(false);
    }
  };

  const handleResumeDelete = async () => {
    const result = await Swal.fire({
      title: 'Remove Resume?',
      text: "Are you sure you want to remove your resume?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, remove it',
      background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
    });

    if (!result.isConfirmed) return;

    setIsResumeLoading(true);
    setSaveStatus(null);
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) throw new Error("Not logged in");

      const response = await fetch(`${API_URL}/upload/resume`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      const data = await handleResponse(response);
      if (!data) return;

      if (user) {
        updateUser({
          ...user,
          resume: ""
        });
      }

      setSaveStatus("success");
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (err: any) {
      console.error("Remove resume error:", err);
      setServerError(err.message || "Failed to remove resume");
      setSaveStatus("error");
    } finally {
      setIsResumeLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div>
      <DashboardHeader
        user={user}
        title="Profile Management"
        subtitle="Manage your professional identity and account preferences."
        showSearch={false}
      >
        <div className="flex items-center gap-3">


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

      <div className="p-4 md:p-8 max-w-[1240px] mx-auto space-y-8">
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
            
            {/* Visibility Settings - NEW */}
            <div className="flex items-center justify-between p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10 border-dashed">
              <div className="flex items-center gap-4">
                <div className="size-10 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined text-xl">visibility</span>
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">Freelancer Visibility</h4>
                  <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Show my profile on the "Find Talent" page</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  id="showAsFreelancer"
                  checked={formData.showAsFreelancer}
                  onChange={handleInputChange} 
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary transition-colors"></div>
              </label>
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
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Hourly Rate ($)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                  <input
                    id="rate"
                    placeholder="e.g. 50"
                    className="w-full p-3 pl-7 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    type="number"
                    min="0"
                    value={formData.rate || ""}
                    onChange={handleInputChange}
                  />
                </div>
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

            {/* Payment Account Details */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-6">
                <span className="material-symbols-outlined text-primary font-bold">payments</span>
                <h4 className="font-black text-slate-900 dark:text-slate-100 uppercase tracking-widest text-[10px]">Payment & Payout Methods</h4>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-2">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">UPI ID (e.g. user@okaxis)</label>
                  <input
                    id="upiId"
                    placeholder="Enter your UPI ID for quick payouts"
                    className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    type="text"
                    value={formData.upiId}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
                  <div className="md:col-span-1 space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Card Holder Name</label>
                    <input
                      id="cardHolderName"
                      placeholder="Name on card"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      type="text"
                      value={formData.cardHolderName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Card Number (Last 4)</label>
                    <input
                      id="cardLast4"
                      placeholder="e.g. 4242"
                      maxLength={4}
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      type="text"
                      value={formData.cardLast4}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">Expiry Date</label>
                    <input
                      id="cardExpiry"
                      placeholder="MM/YY"
                      className="w-full p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      type="text"
                      value={formData.cardExpiry}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
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
        </div>

        {/* Resume Management Section */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
          <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">description</span>
            <h3 className="font-bold text-lg">Resume / CV</h3>
          </div>
          <div className="p-6">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="size-20 rounded-2xl bg-primary/5 dark:bg-primary/20 flex items-center justify-center border border-primary/10">
                <span className="material-symbols-outlined text-4xl text-primary font-bold">
                  {user.resume ? "article" : "upload_file"}
                </span>
              </div>

              <div className="flex-1 text-center md:text-left space-y-2">
                <h4 className="font-black text-slate-900 dark:text-slate-100">
                  {user.resume ? "Professional Resume Uploaded" : "No Resume Uploaded"}
                </h4>
                <p className="text-sm text-slate-500 max-w-md italic">
                  {user.resume
                    ? "Your professional resume is currently saved and visible to clients when you apply for projects."
                    : "Upload your professional resume or CV to stand out from other freelancers. We support PDF, DOC, and DOCX."}
                </p>
                {user.resume && (
                  <div className="pt-2">
                    <button
                      onClick={() => openResume(user.resume)}
                      className="text-primary text-xs font-black uppercase tracking-widest hover:underline flex items-center justify-center md:justify-start gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">open_in_new</span>
                      View Current Resume
                    </button>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="file"
                  id="resume-upload"
                  className="hidden"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleResumeUpload(file);
                    e.target.value = "";
                  }}
                />
                <label
                  htmlFor="resume-upload"
                  className={`px-6 py-3 ${isResumeLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-primary/95 cursor-pointer"} bg-primary text-white text-sm font-black rounded-xl transition-all shadow-md flex items-center gap-2`}
                >
                  {isResumeLoading ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  ) : (
                    <span className="material-symbols-outlined text-lg">upload</span>
                  )}
                  {user.resume ? "Replace Resume" : "Upload Resume"}
                </label>

                {user.resume && (
                  <button
                    type="button"
                    onClick={handleResumeDelete}
                    disabled={isResumeLoading}
                    className="px-6 py-3 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 text-sm font-black rounded-xl hover:bg-red-100 dark:hover:bg-red-900/20 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">delete</span>
                    Remove
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>
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

              const response = await fetch(`${API_URL}/upload/profile-photo`, {
                method: "POST",
                headers: {
                  Authorization: `Bearer ${token}`
                },
                body: formData
              });
              const data = await handleResponse(response);
              if (!data) return;

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
