import React from "react";
import { useRouter } from "next/navigation";
import { formatDistanceToNow } from "date-fns";

interface ProposalDetailsModalProps {
  proposalNotification: any;
  proposalDetail: any;
  onClose: () => void;
  onManageProposals: () => void;
}

export default function ProposalDetailsModal({ proposalNotification, proposalDetail, onClose, onManageProposals }: ProposalDetailsModalProps) {
  const router = useRouter();

  if (!proposalNotification) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">assignment_ind</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Proposal Details</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                ID: {String(proposalNotification.relatedId || proposalNotification._id).slice(-8).toUpperCase()}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-full hover:bg-slate-200 dark:hover:bg-white/10 flex items-center justify-center transition-colors text-slate-400 hover:text-slate-600"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h4 className="text-lg font-bold text-slate-900 dark:text-white">{proposalNotification.title}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Received {formatDistanceToNow(new Date(proposalNotification.createdAt || proposalNotification.time || Date.now()), { addSuffix: true })}</p>
            </div>
            {proposalDetail && (
              <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${proposalDetail.status === 'pending' ? 'bg-amber-100 text-amber-600' :
                proposalDetail.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' :
                  'bg-red-100 text-red-600'
                }`}>
                {proposalDetail.status}
              </div>
            )}
          </div>

          <div className="bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5">
            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-bold">
              {proposalNotification.message}
            </p>
            {proposalDetail && proposalDetail.talent && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center gap-3">
                <div className="size-10 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden flex-shrink-0 border border-slate-100 dark:border-white/5">
                  {proposalDetail.talent.imageUrl ? (
                    <img src={proposalDetail.talent.imageUrl} alt={proposalDetail.talent.name} className="size-full object-cover" />
                  ) : (
                    <div className="size-full flex items-center justify-center text-slate-400">
                      <span className="material-symbols-outlined">person</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sender Profile</p>
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{proposalDetail.talent.name}</p>
                  <button
                    onClick={() => {
                      const talentId = proposalDetail.talent._id || proposalDetail.talent.id;
                      router.push(`/talent/${talentId}`);
                    }}
                    className="mt-2 px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-[10px] font-black uppercase tracking-widest border border-primary/20 transition-all flex items-center gap-1 active:scale-95"
                  >
                    <span className="material-symbols-outlined text-[14px]">visibility</span>
                    View Profile
                  </button>
                </div>
              </div>
            )}
            {proposalDetail && (
              <div className="mt-4 pt-4 border-t border-slate-200 dark:border-white/10">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Pitch / Cover Letter</p>
                <div
                  className="text-sm text-slate-600 dark:text-slate-400 italic prose dark:prose-invert max-w-none font-medium bg-white/40 dark:bg-slate-900/40 p-4 rounded-xl border border-primary/5"
                  dangerouslySetInnerHTML={{ __html: proposalDetail.coverLetter }}
                />
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 text-slate-400 bg-blue-50/30 dark:bg-blue-500/5 p-3 rounded-xl border border-blue-100/50 dark:border-blue-500/10">
            <span className="material-symbols-outlined text-sm text-blue-500">info</span>
            <p className="text-[11px] font-medium leading-tight">You can manage all your applications and interview requests on the main Proposals page.</p>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-slate-100 dark:border-white/5 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 px-4 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-white/10 transition-all font-display"
          >
            Close
          </button>
          <button
            onClick={onManageProposals}
            className="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-bold text-sm hover:bg-[#5a5c41] transition-all shadow-lg shadow-primary/20 font-display"
          >
            Manage Proposals
          </button>
        </div>
      </div>
    </div>
  );
}
