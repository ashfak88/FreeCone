"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation"
import { useStore, Offer, User } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import DashboardHeader from "@/components/DashboardHeader";
import RatingModal from "@/components/RatingModal";
import Swal from "sweetalert2";

export default function ProjectDetailsPage() {
  const { id } = useParams()
  const router = useRouter()
  const { user, fetchOfferById, addProjectUpdate, completeProject, updateGithubRepo, rejectProjectCompletion } = useStore();
  const [project, setProject] = useState<Offer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [updateText, setUpdateText] = useState("")
  const [githubUrl, setGithubUrl] = useState("")
  const [isEditingRepo, setIsEditingRepo] = useState(false)
  const [showAllUpdates, setShowAllUpdates] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isRatingModalOpen, setIsRatingModalOpen] = useState(false);
  const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
  const [rejectionText, setRejectionText] = useState("");

  useEffect(() => {
    const loadProject = async () => {
      setIsLoading(true);
      const data = await fetchOfferById(id as string)
      setProject(data);
      if (data?.githubRepo) setGithubUrl(data.githubRepo)
      
      // Auto-open rating modal if project is completed but not reviewed (for client only)
      if (data?.projectStatus === 'completed' && !data?.isReviewed && user?.role === 'client') {
        setIsRatingModalOpen(true);
      }
      setIsLoading(false);
    };
    if (id) loadProject()
  }, [id, fetchOfferById, user?.role])

  const handleAddUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!updateText.trim()) return

    setIsSubmitting(true);
    await addProjectUpdate(id as string, updateText, "general");
    const updated = await fetchOfferById(id as string);
    setProject(updated);
    setUpdateText("");
    setIsSubmitting(false);
  }

  const handleComplete = async () => {
    setIsSubmitting(true);
    const confirmMsg = isFreelancer
      ? "Are you sure you want to request project completion? The client will need to review and approve your work."
      : "Are you sure you want to approve this project completion? Funds will be released (if applicable).";

    const result = await Swal.fire({
      title: 'Project Completion',
      text: confirmMsg,
      icon: 'question',
      showCancelButton: true,
      confirmButtonColor: '#6a6b4c',
      cancelButtonColor: '#94a3b8',
      confirmButtonText: 'Yes, proceed',
      background: document.documentElement.classList.contains('dark') ? '#0f172a' : '#fff',
      color: document.documentElement.classList.contains('dark') ? '#fff' : '#000',
    });

    if (!result.isConfirmed) {
      setIsSubmitting(false);
      return;
    }
    await completeProject(id as string);
    const updated = await fetchOfferById(id as string);
    setProject(updated);
    
    // If client just approved completion, show the rating modal immediately
    if (!isFreelancer && updated?.projectStatus === 'completed' && !updated?.isReviewed) {
      setIsRatingModalOpen(true);
    }
    
    setIsSubmitting(false);
  };

  const handleReject = async () => {
    if (!rejectionText.trim()) return;
    setIsSubmitting(true);
    await rejectProjectCompletion(id as string, rejectionText);
    const updated = await fetchOfferById(id as string);
    setProject(updated);
    setIsSubmitting(false);
    setIsRejectionModalOpen(false);
    setRejectionText("");
  };

  const handleSaveRepo = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await updateGithubRepo(id as string, githubUrl);
    const updated = await fetchOfferById(id as string);
    setProject(updated);
    setIsEditingRepo(false);
    setIsSubmitting(false);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!project || !user) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-screen p-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Project Not Found</h2>
        <button onClick={() => router.back()} className="text-primary font-bold">Go Back</button>
      </div>
    );
  }

  const myId = (user._id || user.id)?.toString();
  const clientId = (project.client?._id || project.client)?.toString();
  const freelancerId = (project.freelancer?._id || project.freelancer)?.toString();

  const isFreelancer = myId === freelancerId;
  const partner = isFreelancer ? project.client : project.freelancer;
  const partnerId = isFreelancer ? clientId : freelancerId;
  const partnerLabel = isFreelancer ? "Client" : "Freelancer";

  const statusColors: any = {
    active: "bg-blue-500",
    review: "bg-amber-500",
    completed: "bg-green-500",
    disputed: "bg-red-500",
    not_started: "bg-slate-400",
  };

  return (
    <div className="flex-1 overflow-y-auto pb-20">
      <DashboardHeader
        user={user}
        title={project.jobTitle}
        subtitle="Track progress, view updates, and manage your project."
        showBack={true}
      >
        <div className="flex items-center gap-3">
          {isFreelancer && project.projectStatus === "active" && (
            <button
              onClick={handleComplete}
              disabled={isSubmitting}
              className="px-4 py-2 bg-primary text-white rounded-xl font-bold text-sm shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all"
            >
              Request Completion
            </button>
          )}
          {isFreelancer && project.projectStatus === "review" && (
            <div className="px-4 py-2 bg-amber-500/10 text-amber-500 rounded-xl font-bold text-sm border border-amber-500/20 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm animate-spin">sync</span>
              Pending Client Review
            </div>
          )}
          {!isFreelancer && project.projectStatus === "review" && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleComplete}
                disabled={isSubmitting}
                className="px-4 py-2 bg-emerald-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-105 active:scale-95 transition-all"
              >
                Approve Completion
              </button>
              <button
                onClick={() => !isSubmitting && setIsRejectionModalOpen(true)}
                disabled={isSubmitting}
                className="px-4 py-2 bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl font-bold text-sm hover:bg-red-500/20 transition-all disabled:opacity-50"
              >
                {isSubmitting ? "Processing..." : "Reject Request"}
              </button>
            </div>
          )}
        </div>
      </DashboardHeader>

      <div className="max-w-6xl mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Column: Project Info & Timeline */}
        <div className="lg:col-span-2 space-y-8">

          {/* Status Overview Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm relative overflow-hidden"
          >
            {project.projectStatus === "active" && project.rejectionReason && (
              <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl flex gap-3">
                <span className="material-symbols-outlined text-red-500">info</span>
                <div>
                  <p className="text-sm font-bold text-red-600 dark:text-red-400">Revision Required</p>
                  <p className="text-xs text-red-500/80 mt-0.5">{project.rejectionReason}</p>
                </div>
              </div>
            )}
            <div className={`absolute top-0 left-0 w-2 h-full ${statusColors[project.projectStatus || 'active']}`} />

            <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
              <div>
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Current Status</p>
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-black capitalize">{project.projectStatus?.replace('_', ' ') || "In Progress"}</h3>
                  <span className={`size-3 rounded-full animate-pulse ${statusColors[project.projectStatus || 'active']}`} />
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Contract Budget</p>
                <p className="text-2xl font-black text-primary">${project.budget.toLocaleString()}</p>
              </div>
            </div>

            <p className="text-slate-600 dark:text-slate-400 leading-relaxed mb-8">
              {project.description}
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Timeline</p>
                <p className="text-sm font-bold">Standard</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Payment</p>
                <p className="text-sm font-bold">{project.isPaid ? "Escrowed" : "Pending"}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Started</p>
                <p className="text-sm font-bold">{new Date(project.createdAt).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase mb-1">Type</p>
                <p className="text-sm font-bold">Fixed Rate</p>
              </div>
            </div>
          </motion.div>

          {/* Timeline / Project Updates */}
          <div className="space-y-6">
            <h4 className="text-lg font-black flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">timeline</span>
              Project Activity
            </h4>

            <div className="space-y-0 relative">
              {/* Timeline Line */}
              <div className="absolute left-6 top-2 bottom-2 w-0.5 bg-slate-200 dark:bg-slate-800" />

              <AnimatePresence mode="popLayout">
                {(project.updates || []).slice().reverse().slice(0, showAllUpdates ? undefined : 4).map((update, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="relative pl-16 pb-10"
                  >
                    <div className={`absolute left-4 top-1 size-5 rounded-full border-4 border-white dark:border-slate-900 z-10 shadow-sm ${update.type === 'status_change' ? 'bg-primary' : 'bg-slate-400'
                      }`} />

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 border border-slate-100 dark:border-slate-800 hover:border-primary/20 transition-all">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${update.type === 'status_change' ? 'bg-primary/10 text-primary' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                          }`}>
                          {update.type?.replace('_', ' ') || 'Update'}
                        </span>
                        <span className="text-[10px] text-slate-400 font-medium">
                          {new Date(update.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        {update.text}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {project.updates && project.updates.length > 4 && !showAllUpdates && (
                <div className="relative pl-16 pb-10">
                  <div className="absolute left-6 -top-2 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-800" />
                  <button
                    onClick={() => setShowAllUpdates(true)}
                    className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-all py-2"
                  >
                    <span className="material-symbols-outlined text-sm">expand_more</span>
                    Show all activity ({project.updates.length - 4} more)
                  </button>
                </div>
              )}

              {/* Add Update Field (Freelancer Only or both?) */}
              <div className="relative pl-16">
                <div className="absolute left-4 top-1 size-5 rounded-full bg-slate-200 dark:bg-slate-800 border-4 border-white dark:border-slate-900 z-10" />
                <form onSubmit={handleAddUpdate} className="bg-white dark:bg-slate-900 rounded-2xl p-4 border-2 border-dashed border-slate-200 dark:border-slate-800 focus-within:border-primary/40 transition-all">
                  <textarea
                    value={updateText}
                    onChange={(e) => setUpdateText(e.target.value)}
                    placeholder="Post a progress update or project note..."
                    className="w-full bg-transparent border-none outline-none text-sm resize-none h-20 placeholder:text-slate-400"
                  />
                  <div className="flex justify-end mt-2">
                    <button
                      disabled={isSubmitting || !updateText.trim()}
                      className="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold hover:opacity-90 disabled:opacity-50 transition-all"
                    >
                      {isSubmitting ? "Posting..." : "Post Update"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Participant Info & Actions */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">{partnerLabel}</p>

            <div className="flex items-center gap-4 mb-6">
              <div className="size-16 rounded-2xl overflow-hidden border-2 border-primary/20">
                <img
                  src={partner?.imageUrl || partner?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner?.name || 'User')}&background=6A6B4C&color=fff`}
                  alt={partner?.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div>
                <h5 className="text-lg font-black leading-tight">{partner?.name}</h5>
                <p className="text-xs text-slate-500 font-medium">{partner?.location || "Remote"}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="material-symbols-outlined text-amber-400 text-sm fill-1">star</span>
                  <span className="text-[10px] font-bold">4.9 (24 reviews)</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => router.push(`/talent/${partnerId}?activeProject=true`)}
                className="w-full py-3 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 rounded-xl text-xs font-black uppercase tracking-widest transition-all border border-slate-100 dark:border-slate-700"
              >
                View Profile
              </button>
              <button
                onClick={() => router.push(`/messages?conversation=${project._id}`)}
                className="w-full py-3 bg-primary/10 text-primary hover:bg-primary/20 rounded-xl text-xs font-black uppercase tracking-widest transition-all"
              >
                Send Message
              </button>
            </div>
          </div>

          {/* GitHub Repository Widget */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm overflow-hidden relative">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-slate-900 dark:text-white">code</span>
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Project Repository</p>
              </div>
              {isFreelancer && !isEditingRepo && (
                <button
                  onClick={() => setIsEditingRepo(true)}
                  className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline"
                >
                  {project.githubRepo ? "Edit" : "Add Link"}
                </button>
              )}
            </div>

            {isEditingRepo ? (
              <form onSubmit={handleSaveRepo} className="space-y-3">
                <input
                  type="url"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                  placeholder="https://github.com/username/repo"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                  required
                />
                <div className="flex gap-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-2 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50"
                  >
                    {isSubmitting ? "Saving..." : "Save Repository"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingRepo(false)}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : project.githubRepo ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                  <div className="size-8 rounded-lg bg-white dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                    <img src="https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png" alt="GitHub" className="size-5 dark:invert" />
                  </div>
                  <div className="truncate flex-1">
                    <p className="text-[10px] font-bold text-slate-400 truncate">{project.githubRepo.replace('https://', '')}</p>
                  </div>
                </div>
                <a
                  href={project.githubRepo}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:opacity-90 transition-all shadow-lg shadow-slate-900/10"
                >
                  View Repository
                  <span className="material-symbols-outlined text-sm">open_in_new</span>
                </a>
              </div>
            ) : (
              <div className="py-4 text-center">
                <span className="material-symbols-outlined text-3xl text-slate-200 dark:text-slate-800 mb-2">link_off</span>
                <p className="text-[11px] font-bold text-slate-400">No repository link shared yet.</p>
              </div>
            )}
          </div>


        </div>

        <RatingModal 
          isOpen={isRatingModalOpen}
          onClose={() => setIsRatingModalOpen(false)}
          offerId={project?._id || ""}
          freelancerName={project?.freelancer?.name || "the freelancer"}
        />

        {/* Rejection Modal */}
        <AnimatePresence>
          {isRejectionModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[32px] p-8 shadow-2xl relative"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="size-12 rounded-2xl bg-red-50 dark:bg-red-900/20 text-red-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-3xl">cancel</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-black">Reject Request</h3>
                    <p className="text-xs text-slate-500 tracking-tight">Please specify why you are rejecting completion.</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 px-1">Reason for Rejection</label>
                    <textarea 
                      value={rejectionText}
                      onChange={(e) => setRejectionText(e.target.value)}
                      placeholder="e.g. Missing source files, final design doesn't match requirements..."
                      className="w-full h-32 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl p-4 text-sm outline-none focus:border-red-500/40 transition-all resize-none"
                    />
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setIsRejectionModalOpen(false)}
                      className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-200 transition-all"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleReject}
                      disabled={isSubmitting || !rejectionText.trim()}
                      className="flex-1 py-3 bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg shadow-red-500/20 hover:scale-105 active:scale-95 disabled:opacity-50 transition-all"
                    >
                      {isSubmitting ? "Rejecting..." : "Submit Rejection"}
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
