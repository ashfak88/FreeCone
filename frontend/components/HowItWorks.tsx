export default function HowItWorks() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-bold tracking-tight mb-4">Unmatched Security and Trust</h2>
          <p className="text-lg text-slate-500 leading-relaxed">We provide a seamless ecosystem designed for peace of mind, ensuring every project is delivered to perfection.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="relative flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mb-6 relative z-10 shadow-lg shadow-primary/20">
              1
            </div>
            <h3 className="text-xl font-bold mb-3">Post a Detailed Brief</h3>
            <p className="text-slate-500">Describe your project and set your budget. Our AI-driven matching finds the top 1% of talent matching your specific needs.</p>
            <div className="hidden lg:block absolute top-8 left-1/2 w-full h-px border-t-2 border-dashed border-primary/20 -z-0"></div>
          </div>
          <div className="relative flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mb-6 relative z-10 shadow-lg shadow-primary/20">
              2
            </div>
            <h3 className="text-xl font-bold mb-3">Escrow-Protected Milestones</h3>
            <p className="text-slate-500">Funds are held in a secure escrow. Payments are only released once you've reviewed and approved each project milestone.</p>
            <div className="hidden lg:block absolute top-8 left-1/2 w-full h-px border-t-2 border-dashed border-primary/20 -z-0"></div>
          </div>
          <div className="relative flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold mb-6 relative z-10 shadow-lg shadow-primary/20">
              3
            </div>
            <h3 className="text-xl font-bold mb-3">Success & Review</h3>
            <p className="text-slate-500">Receive high-quality deliverables, release the final payment, and rate your experience to maintain our elite community standards.</p>
          </div>
        </div>
      </div>
    </section>
  );
}