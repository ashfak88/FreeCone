import { User, useStore } from "@/lib/store";
import { useRouter } from "next/navigation";

export default function TalentCard({ talent }: { talent: User }) {
  const { user } = useStore();
  const router = useRouter();

  const handleAuthRedirect = (e: React.MouseEvent, path: string) => {
    e.preventDefault();
    if (!user) {
      router.push(`/login?error=${encodeURIComponent("Please login to access that page")}`);
    } else {
      router.push(path);
    }
  };

  const rating = talent.rating || 0;
  const reviews = talent.totalReviews || 0;
  const skills = talent.skills || [];
  const imageUrl = talent.imageUrl || talent.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(talent.name)}&background=0ea5e9&color=fff`;
  const bio = talent.bio || talent.description || "Looking for opportunities.";
  const rate = talent.rate || 0;
  const location = talent.location || "Location not specified";

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col gap-5 hover:shadow-xl hover:shadow-primary/5 transition-all group">
      <div className="flex gap-5">
        {/* Avatar with relative ring */}
        <div className="h-20 w-20 rounded-full overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 ring-4 ring-primary/5 group-hover:ring-primary/10 transition-all">
          <img src={imageUrl} alt={talent.name} className="h-full w-full object-cover" />
        </div>

        {/* Info Area */}
        <div className="flex-1">
          <div className="flex justify-between items-start">
            <div>
              <h4 className="text-slate-900 dark:text-white font-extrabold text-xl leading-tight group-hover:text-primary transition-colors">
                {talent.name}
              </h4>
              <p className="text-primary font-bold text-sm mt-1 uppercase tracking-wider">
                {talent.title || talent.role || 'Talent'}
              </p>
            </div>
            <div className="flex items-center bg-primary/10 dark:bg-primary/20 px-3 py-1.5 rounded-xl border border-primary/10">
              <span className="material-symbols-outlined text-primary text-sm mr-1.5 fill-icon">star</span>
              <span className="text-primary font-black text-sm">{rating.toFixed(1)}</span>
            </div>
          </div>

          {/* Location & Reviews Subtitle */}
          <div className="flex items-center gap-3 mt-2 text-slate-400 dark:text-slate-500 font-medium text-xs">
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              {location}
            </div>
            <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
            <div>{reviews} reviews</div>
          </div>
        </div>
      </div>

      {/* Description truncation */}
      <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed line-clamp-2 italic">
        "{bio}"
      </p>

      {/* Skills Pill Tags */}
      <div className="flex flex-wrap gap-2">
        {skills.length > 0 ? (
          skills.slice(0, 4).map((skill: string) => (
            <span key={skill} className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 text-[11px] font-bold rounded-lg border border-slate-100 dark:border-slate-800">
              {skill}
            </span>
          ))
        ) : (
          <span className="px-3 py-1.5 bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[11px] font-bold rounded-lg italic">
            Skills pending profile update
          </span>
        )}
        {skills.length > 4 && (
          <span className="px-3 py-1.5 text-primary text-[11px] font-bold bg-primary/5 rounded-lg">
            +{skills.length - 4} more
          </span>
        )}
      </div>

      {/* Footer / CTA Section */}
      <div className="flex items-center justify-between pt-5 border-t border-slate-50 dark:border-slate-800 mt-auto">
        <div>
          <p className="text-slate-400 dark:text-slate-500 text-[9px] uppercase font-black tracking-[0.2em] mb-0.5">Starting at</p>
          <div className="flex items-baseline">
            <span className="text-slate-900 dark:text-white font-black text-2xl">${rate}</span>
            <span className="text-slate-400 text-xs font-bold ml-1">/hr</span>
          </div>
        </div>
        <div className="flex gap-3">
          <a
            href={`/talent/${talent._id || talent.id}`}
            onClick={(e) => handleAuthRedirect(e, `/talent/${talent._id || talent.id}`)}
            className="px-6 py-3 text-slate-700 dark:text-slate-300 font-bold text-sm border-2 border-slate-100 dark:border-slate-800 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-all text-center cursor-pointer flex items-center"
          >
            Profile
          </a>
          <a
            href={`/send-offer?id=${talent._id || talent.id}`}
            onClick={(e) => handleAuthRedirect(e, `/send-offer?id=${talent._id || talent.id}`)}
            className="px-8 py-3 bg-primary text-white font-extrabold text-sm rounded-2xl hover:shadow-xl hover:shadow-primary/30 transition-all active:scale-95 text-center cursor-pointer flex items-center"
          >
            Hire
          </a>
        </div>
      </div>
    </div>
  );
}
