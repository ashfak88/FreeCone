import { Freelancer } from "@/types/freelancer";

export default function FreelancerCard({ freelancer }: { freelancer: Freelancer }) {
  // Use fallbacks for users that might not have the new fields yet
  const rating = freelancer.rating || 0;
  const skills = freelancer.skills || [];
  const imageUrl = freelancer.imageUrl || `https://i.pravatar.cc/150?u=${freelancer._id || freelancer.id || 'default'}`;
  const description = freelancer.description || "Looking for opportunities.";
  const rate = freelancer.rate || 0;

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex flex-col gap-4">
      <div className="flex gap-4">
        {/* Avatar */}
        <div className="h-16 w-16 rounded-full overflow-hidden shrink-0 bg-slate-200">
          <img src={imageUrl} alt={freelancer.name} className="h-full w-full object-cover" />
        </div>
        
        {/* Info */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-slate-900 font-bold text-lg leading-tight">{freelancer.name}</h4>
              <p className="text-primary font-semibold text-sm mt-0.5 capitalize">{freelancer.role || 'User'}</p>
            </div>
            <div className="flex items-center bg-primary/10 px-2 py-1 rounded-md">
              <span className="material-symbols-outlined text-primary text-sm mr-1 fill-icon">star</span>
              <span className="text-primary font-bold text-sm">{rating.toFixed(1)}</span>
            </div>
          </div>
          <p className="text-slate-600 text-sm mt-2 leading-relaxed">{description}</p>
        </div>
      </div>

      {/* Skills Tags */}
      <div className="flex flex-wrap gap-2">
        {skills.length > 0 ? (
          skills.map((skill: string) => (
            <span key={skill} className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-full">
              {skill}
            </span>
          ))
        ) : (
          <span className="px-3 py-1 bg-slate-50 text-slate-400 text-xs font-bold rounded-full border border-slate-100">
            No specific skills listed
          </span>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div>
          <p className="text-slate-400 text-[10px] uppercase font-black tracking-widest">Rate</p>
          <p className="text-slate-900 font-bold text-lg">${rate}/hr</p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2 text-primary font-bold text-sm border border-primary/30 rounded-xl hover:bg-primary/5 transition-colors">
            View Profile
          </button>
          <button className="px-8 py-2 bg-primary text-white font-bold text-sm rounded-xl hover:bg-opacity-90 shadow-md shadow-primary/20 transition-all">
            Hire
          </button>
        </div>
      </div>
    </div>
  );
}