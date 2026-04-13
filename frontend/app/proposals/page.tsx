"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useStore } from "@/lib/store";
import DashboardHeader from "@/components/DashboardHeader";

export default function ProposalsPage() {
  const router = useRouter();
  const { 
    user, 
    myProposals, 
    fetchMyProposals, 
    receivedProposals, 
    fetchReceivedProposals, 
    updateProposalStatus,
    isLoadingMyData 
  } = useStore();

  useEffect(() => {
    fetchMyProposals();
    fetchReceivedProposals();
  }, [fetchMyProposals, fetchReceivedProposals]);

  const allProposals = useMemo(() => {
    const combined = [
      ...myProposals.map(p => ({ ...p, direction: 'sent' })),
      ...receivedProposals.map(p => ({ ...p, direction: 'received' }))
    ];
    return combined.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [myProposals, receivedProposals]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-600 border-amber-200";
      case "viewed":
        return "bg-blue-100 text-blue-600 border-blue-200";
      case "accepted":
        return "bg-emerald-100 text-emerald-600 border-emerald-200";
      case "rejected":
        return "bg-red-100 text-red-600 border-red-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const handleStatusUpdate = async (id: string, status: 'accepted' | 'rejected') => {
    if (window.confirm(`Are you sure you want to ${status} this proposal?`)) {
      await updateProposalStatus(id, status);
    }
  };

  return (
    <div>
      <DashboardHeader
        user={user}
        title="Proposals Management"
        subtitle="Track all your project applications and received proposals in one place"
      />

      <main className="max-w-[1240px] mx-auto p-6 md:p-8 space-y-6">
        
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="font-bold text-slate-900 text-lg">
              All Proposal Activity
            </h3>
          </div>

          {isLoadingMyData ? (
            <div className="p-20 flex flex-col items-center justify-center text-center">
              <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4"></div>
              <p className="text-slate-500 font-medium">Loading proposals...</p>
            </div>
          ) : allProposals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50">
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Type</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Project / Talent</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Details</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Status</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100">Date</th>
                    <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-slate-400 border-b border-slate-100 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allProposals.map((proposal: any) => (
                    <tr key={proposal._id} className="hover:bg-slate-50 transition-colors group">
                      <td className="px-6 py-5">
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-tighter ${
                          proposal.direction === 'received' 
                            ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                            : 'bg-slate-50 text-slate-600 border border-slate-100'
                        }`}>
                          {proposal.direction}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        {proposal.direction === 'received' ? (
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary border border-primary/20 shrink-0">
                              {proposal.talent?.imageUrl ? (
                                <img src={proposal.talent.imageUrl} alt="" className="w-full h-full rounded-full object-cover" />
                              ) : (
                                proposal.talent?.name?.charAt(0) || "T"
                              )}
                            </div>
                            <div>
                              <p className="font-bold text-slate-900 text-sm line-clamp-1">{proposal.talent?.name || "Anonymous"}</p>
                              <p className="text-[10px] text-slate-500 line-clamp-1">{proposal.job?.title}</p>
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p 
                              className="font-bold text-slate-900 text-sm hover:text-primary transition-colors cursor-pointer line-clamp-1" 
                              onClick={() => router.push(`/jobs/${proposal.job?._id || proposal.job}`)}
                            >
                              {proposal.job?.title || "Project Title"}
                            </p>
                            <p className="text-[10px] text-slate-500 mt-0.5 line-clamp-1">Personal Application</p>
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-5">
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1 max-w-[200px]">
                          {proposal.proposedRate ? `$${proposal.proposedRate}` : ''} • {proposal.coverLetter?.replace(/<[^>]*>/g, ' ')}
                        </p>
                      </td>
                      <td className="px-6 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(proposal.status)}`}>
                          {proposal.status}
                        </span>
                      </td>
                      <td className="px-6 py-5">
                        <span className="text-xs text-slate-500">
                          {new Date(proposal.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </span>
                      </td>
                      <td className="px-6 py-5 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {proposal.direction === 'received' && (proposal.status === 'pending' || proposal.status === 'viewed') ? (
                            <div className="flex items-center gap-2">
                              {proposal.resume && (
                                <a 
                                  href={proposal.resume} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:bg-primary/5 p-1.5 rounded-lg transition-colors border border-primary/20 flex items-center justify-center"
                                  title="View Resume"
                                >
                                  <span className="material-symbols-outlined text-sm">description</span>
                                </a>
                              )}
                              <button 
                                onClick={() => handleStatusUpdate(proposal._id, 'accepted')}
                                className="bg-emerald-500 hover:bg-emerald-600 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors shadow-sm"
                              >
                                Accept
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(proposal._id, 'rejected')}
                                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors shadow-sm"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2">
                              {proposal.resume && (
                                <a 
                                  href={proposal.resume} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-primary hover:bg-primary/5 p-1.5 rounded-lg transition-colors border border-primary/20 flex items-center justify-center"
                                  title="View Resume"
                                >
                                  <span className="material-symbols-outlined text-sm">description</span>
                                </a>
                              )}
                              <button 
                                onClick={() => router.push(`/jobs/${proposal.job?._id || proposal.job}`)}
                                className="text-primary font-bold text-xs hover:bg-primary/5 px-3 py-1.5 rounded-lg transition-colors border border-primary/20"
                              >
                                Details
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-20 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-slate-300 text-4xl">inventory_2</span>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-2">No Proposals Yet</h4>
              <p className="text-slate-500 max-w-sm mx-auto mb-8">
                You haven't sent or received any proposals yet. Check back here after applying for jobs or posting a project.
              </p>
              <Link
                href="/find-work"
                className="px-8 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
              >
                Find Work
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
