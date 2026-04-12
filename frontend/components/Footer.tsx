export default function Footer() {
  return (
    <footer className="bg-white dark:bg-background-dark border-t border-primary/10 pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12 mb-12">
          <div className="col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2.5 mb-6 group cursor-pointer">
              <span className="material-symbols-outlined text-primary text-4xl group-hover:rotate-12 transition-transform duration-300">hub</span>
              <span className="text-2xl font-black tracking-tighter flex items-center">
                {"FreeCone".split("").map((letter, i) => (
                  <span
                    key={i}
                    className={`animate-jump ${(i === 0 || i === 4) ? 'text-primary' : ''}`}
                    style={{ animationDelay: `${i * 0.1}s` }}
                  >
                    {letter}
                  </span>
                ))}
              </span>
            </div>
            <p className="text-slate-500 max-w-sm mb-6 leading-relaxed">
              Connecting elite talent with world-class opportunities. The most secure and reliable marketplace for professional talent.
            </p>
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary cursor-pointer hover:bg-primary hover:text-white transition-all">
                <span className="material-symbols-outlined text-sm">public</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary cursor-pointer hover:bg-primary hover:text-white transition-all">
                <span className="material-symbols-outlined text-sm">mail</span>
              </div>
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary cursor-pointer hover:bg-primary hover:text-white transition-all">
                <span className="material-symbols-outlined text-sm">chat_bubble</span>
              </div>
            </div>
          </div>
          <div>
            <h4 className="font-bold mb-6">For Clients</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a className="hover:text-primary transition-colors" href="#">How to Hire</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Talent Scout</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Enterprise Solutions</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Security & Trust</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">For Talent</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a className="hover:text-primary transition-colors" href="#">Find Projects</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Talent Benefits</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Elite Status</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Success Stories</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold mb-6">Company</h4>
            <ul className="space-y-4 text-sm text-slate-500">
              <li><a className="hover:text-primary transition-colors" href="#">About Us</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Our Process</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Contact Support</a></li>
              <li><a className="hover:text-primary transition-colors" href="#">Legal & Privacy</a></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-primary/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-400 font-medium">
          <p>© 2024 FreeCone Inc. All rights reserved.</p>
          <div className="flex gap-8">
            <a className="hover:text-primary" href="#">Terms of Service</a>
            <a className="hover:text-primary" href="#">Privacy Policy</a>
            <a className="hover:text-primary" href="#">Cookie Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}