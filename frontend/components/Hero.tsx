export default function Hero() {
  return (
    <header className="relative overflow-hidden py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
              <span className="material-symbols-outlined text-sm">verified</span>
              Vetted Elite Marketplace
            </div>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight leading-tight">
              Connect with <span className="text-primary">Elite Global</span> Talent
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl leading-relaxed">
              The high-end marketplace where world-class freelancers and visionary clients build the future together with guaranteed escrow security.
            </p>
            <div className="flex flex-wrap gap-4">
              <button className="bg-primary text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-lg hover:shadow-primary/30 transition-all flex items-center gap-2">
                Hire Talent <span className="material-symbols-outlined">arrow_forward</span>
              </button>
              <button className="inline-flex items-center gap-2 bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold tracking-wide uppercase">
                Find Work
              </button>
            </div>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                <div className="w-10 h-10 rounded-full border-2 border-background-light bg-slate-200" title="Professional headshot"></div>
                <div className="w-10 h-10 rounded-full border-2 border-background-light bg-slate-300" title="Professional headshot"></div>
                <div className="w-10 h-10 rounded-full border-2 border-background-light bg-slate-400" title="Professional headshot"></div>
              </div>
              <p className="text-sm font-medium text-slate-500">Trusted by 2,000+ Fortune 500 companies</p>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 border border-primary/20 p-4 relative z-10 overflow-hidden">
              <img 
                alt="Professional collaboration" 
                className="w-full h-full object-cover rounded-xl shadow-2xl" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAm3hgvfbvCtgVCuJzBW_WobvEm4OMQQmFSR_vYRY2cW7kSh8VI3fJ4fdojIGKpQ9TN9X4cxz2xZqJGVnFtaUw1Gay6IbW5zIC1U-HkNaa9nEe2P2QFK4yFzoIgHL925UraqOrseWK9gSc0Myjn5sP2Nn-GDBK5HoaHaGBwXYH0kWprjqX0snCYkd-U7JjOehDGeCjv0w0ehmpL6yzA1oBqvpwDRwyXjeex1XgBkbQ_MjkOiXk5DZhwFAW3zOdGr9CAhMNbMMMKYbTr"
              />
            </div>
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-primary/30 rounded-full blur-3xl"></div>
          </div>
        </div>
      </div>
    </header>
  );
}