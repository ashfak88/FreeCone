export default function Categories() {
  return (
    <section className="py-20 bg-white dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight mb-2">Featured Categories</h2>
            <p className="text-sm sm:text-base text-slate-500">Work with top 1% experts across various disciplines</p>
          </div>
          <a className="text-primary text-sm sm:text-base font-bold flex items-center gap-1 hover:underline" href="#">
            View all <span className="material-symbols-outlined text-sm">open_in_new</span>
          </a>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Dev */}
          <div className="group p-6 rounded-2xl bg-background-light dark:bg-background-dark border border-primary/5 hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">code</span>
            </div>
            <h3 className="text-lg font-bold mb-1">Software Development</h3>
            <p className="text-sm text-slate-500">Expert engineers for complex architecture and full-stack solutions.</p>
          </div>
          {/* Design */}
          <div className="group p-6 rounded-2xl bg-background-light dark:bg-background-dark border border-primary/5 hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">palette</span>
            </div>
            <h3 className="text-lg font-bold mb-1">Brand Design</h3>
            <p className="text-sm text-slate-500">Creative directors who shape global identities and user experiences.</p>
          </div>
          {/* Marketing */}
          <div className="group p-6 rounded-2xl bg-background-light dark:bg-background-dark border border-primary/5 hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
            <h3 className="text-lg font-bold mb-1">Digital Marketing</h3>
            <p className="text-sm text-slate-500">Growth specialists focused on scaling conversion and ROI.</p>
          </div>
          {/* Finance */}
          <div className="group p-6 rounded-2xl bg-background-light dark:bg-background-dark border border-primary/5 hover:border-primary/30 transition-all hover:shadow-xl hover:shadow-primary/5">
            <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">bar_chart</span>
            </div>
            <h3 className="text-lg font-bold mb-1">Financial Strategy</h3>
            <p className="text-sm text-slate-500">CFO-level insights and data analysis for enterprise decisions.</p>
          </div>
        </div>
      </div>
    </section>
  );
}