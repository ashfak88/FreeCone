import React from "react";
import { useStore } from "@/lib/store";

interface OfferDetailsModalProps {
  offer: any;
  onClose: () => void;
}

export default function OfferDetailsModal({ offer, onClose }: OfferDetailsModalProps) {
  const { user, updateOfferStatus } = useStore();

  if (!offer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
              <span className="material-symbols-outlined">description</span>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 dark:text-white">Offer Details</h3>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
                Ref: {String(offer._id).slice(-8).toUpperCase()}
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
          {/* Job Title & Budget */}
          <div className="flex justify-between items-start gap-4">
            <div className="space-y-1">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project Title</p>
              <h4 className="text-xl font-bold text-slate-900 dark:text-white">{offer.jobTitle}</h4>
            </div>
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-xl text-center">
              <p className="text-[10px] font-bold uppercase tracking-wider opacity-70">Budget</p>
              <p className="text-lg font-black">${offer.budget}</p>
            </div>
          </div>

          {/* Parties */}
          <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 dark:border-white/5">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">From</p>
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-white/5">
                  {offer.client?.imageUrl ? (
                    <img src={offer.client.imageUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-slate-400">person</span>
                  )}
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{offer.client?.name || "Unknown"}</p>
              </div>
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">To</p>
              <div className="flex items-center gap-2">
                <div className="size-8 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center overflow-hidden border border-slate-100 dark:border-white/5">
                  {offer.freelancer?.imageUrl ? (
                    <img src={offer.freelancer.imageUrl} alt="" className="size-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-slate-400">person</span>
                  )}
                </div>
                <p className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate">{offer.freelancer?.name || "Unknown"}</p>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Description</p>
            <div
              className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed font-bold border border-slate-100 dark:border-white/5 p-4 rounded-xl prose dark:prose-invert max-w-none bg-slate-50/30 dark:bg-white/5"
              dangerouslySetInnerHTML={{ __html: offer.description }}
            />
          </div>

          {/* Status & Date */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-slate-400">
              <span className="material-symbols-outlined text-sm">calendar_month</span>
              <p className="text-xs font-medium">Sent on {new Date(offer.createdAt).toLocaleDateString()}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${offer.status === 'pending' ? 'bg-amber-100 text-amber-600' :
              offer.status === 'accepted' ? 'bg-emerald-100 text-emerald-600' :
                'bg-red-100 text-red-600'
              }`}>
              {offer.status}
            </div>
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
          {offer.status === 'pending' && user?.id === (typeof offer.freelancer === 'string' ? offer.freelancer : (offer.freelancer?._id || offer.freelancer?.id)) && (
            <div className="flex flex-1 gap-3">
              <button
                onClick={() => {
                  updateOfferStatus(offer._id, 'rejected');
                  onClose();
                }}
                className="flex-1 py-3 px-4 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl font-bold text-sm transition-all border border-red-100 font-display"
              >
                Reject
              </button>
              <button
                onClick={() => {
                  updateOfferStatus(offer._id, 'accepted');
                  onClose();
                }}
                className="flex-1 py-3 px-4 bg-primary text-white rounded-xl font-bold text-sm hover:bg-[#5a5c41] transition-all shadow-lg shadow-primary/20 font-display"
              >
                Accept
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
