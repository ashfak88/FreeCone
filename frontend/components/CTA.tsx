export default function CTA() {
  return (
    <section className="py-16 px-4">
      <div className="max-w-6xl mx-auto bg-primary rounded-[2rem] p-8 md:p-16 relative overflow-hidden text-center text-white shadow-2xl shadow-primary/20">
        <div className="relative z-10">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Ready to build the future?</h2>
          <p className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10 leading-relaxed">Join the world's most exclusive network of high-caliber talent and visionary entrepreneurs today.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-primary px-10 py-4 rounded-xl font-extrabold text-lg hover:bg-slate-50 transition-all">Get Started Now</button>
            <button className="bg-primary/20 border border-white/30 text-white px-10 py-4 rounded-xl font-extrabold text-lg hover:bg-white/10 transition-all">Talk to Sales</button>
          </div>
        </div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-black/10 rounded-full -ml-48 -mb-48 blur-3xl"></div>
      </div>
    </section>
  );
}