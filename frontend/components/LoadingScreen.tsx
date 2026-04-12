"use client";
import { motion, useAnimation } from "framer-motion";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Hero from "@/components/Hero";

export default function LoadingScreen({ destination = "/" }: { destination?: string }) {
  const router = useRouter();
  const [progress, setProgress] = useState(0);
  const textRef = useRef<HTMLDivElement>(null);
  const controls = useAnimation();
  const logoControls = useAnimation();
  const barControls = useAnimation();
  const bgControls = useAnimation();
  const navControls = useAnimation();
  const word = "FreeCone";

  // Fill the progress bar
  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 2;
      });
    }, 20);
    return () => clearInterval(timer);
  }, []);

  // When progress reaches 100%, fly the text and navigate
  useEffect(() => {
    if (progress < 100) return;

    const runSequence = async () => {
      if (!textRef.current) return;

      const rect = textRef.current.getBoundingClientRect();

      // Calculate exact navbar position dynamically for any screen size
      // Navbar uses: max-w-7xl (1280px max width) with mx-auto
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const maxWidth = 1280;
      const marginX = Math.max(0, (viewportWidth - maxWidth) / 2);

      // Navbar ping: px-4 (16px), sm:px-6 (24px, >640), lg:px-8 (32px, >1024)
      let paddingX = 16;
      if (viewportWidth >= 1024) paddingX = 32;
      else if (viewportWidth >= 640) paddingX = 24;

      // Icon (text-3xl) is approx 30px wide, plus gap-2 (8px) = 38px
      const iconOffset = 38;
      // Target text (text-xl "FreeCone") is approx 95px wide. Half is 47.5px.
      const halfTargetWidth = 47.5;

      // Exact center X of the Navbar's "FreeCone" text
      const navLogoX = marginX + paddingX + iconOffset + halfTargetWidth;
      // Navbar is h-16 (64px). Exact center Y is 32px.
      const navLogoY = 32;

      const currentCenterX = rect.left + rect.width / 2;
      const currentCenterY = rect.top + rect.height / 2;

      const targetX = navLogoX - currentCenterX;
      const targetY = navLogoY - currentCenterY;

      // Scale from text-5xl to text-xl is exactly 20px/48px = ~0.416
      const targetScale = 0.416;

      // Icon target position
      const iconTargetX = marginX + paddingX + 15 - (viewportWidth / 2);
      const iconTargetY = navLogoY - (viewportHeight / 2);

      // Icon rotation
      const iconRotation = 360 * 3; // 3 full rotations

      // 1. Fade out progress bar
      await barControls.start({ opacity: 0, transition: { duration: 0.15 } });

      // Set initial position for logo - horizontally off-screen to the left, but vertically aligned with target
      logoControls.set({ x: -viewportWidth, y: iconTargetY, opacity: 0, rotate: 0 });

      // 2. Fly the text, fade the white background out, and fade the simulated Navbar IN
      // The background fades to 0 revealing the #f6f7f8 grey backdrop and the fake Navbar!
      await Promise.all([
        controls.start({
          x: targetX,
          y: targetY,
          scale: targetScale,
          transition: {
            duration: 1.3,
            ease: [0.4, 0.0, 0.2, 1],
          },
        }),
        logoControls.start({
          x: iconTargetX,
          y: iconTargetY,
          rotate: iconRotation,
          opacity: 1,
          transition: {
            duration: 1.3,
            ease: "easeOut",
          },
        }),
        bgControls.start({ opacity: 0, transition: { duration: 1.3, ease: "easeOut" } }),
        navControls.start({ opacity: 1, transition: { duration: 1.3, ease: "easeOut" } })
      ]);

      // 3. The exact millisecond the text lands, we trigger navigation!
      // The real dashboard will snap into place seamlessly.
      router.push(destination);
    };

    const t = setTimeout(runSequence, 150);
    return () => clearTimeout(t);
  }, [progress, controls, barControls, bgControls, router, destination]);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{ pointerEvents: "none" }}
    >
      {/* Solid white background that melts away to reveal the grey body underneath */}
      <motion.div animate={bgControls} className="absolute inset-0 bg-white" />

      {/* Simulated Home Page (Navbar + Hero) that fades in exactly as the white background fades out */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={navControls}
        className="absolute inset-0 w-full overflow-hidden"
      >
        <nav className="w-full bg-[#f6f7f8]/80 backdrop-blur-md border-b border-primary/20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              {/* Logo area */}
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-3xl opacity-0">hub</span>
                {/* Invisible text where the flying text will land */}
                <span className="text-xl font-extrabold tracking-tight opacity-0">FreeCone</span>
              </div>

              {/* Fake Nav Links just for the visual illusion */}
              <div className="hidden md:flex items-center space-x-8 opacity-50">
                <span className="text-sm font-semibold text-slate-700">Browse Talent</span>
                <span className="text-sm font-semibold text-slate-700">Find Work</span>
                <span className="text-sm font-semibold text-slate-700">Enterprise</span>
                <div className="h-4 w-px bg-primary/20"></div>
                <div className="flex items-center gap-3">
                  <div className="h-8 w-16 bg-slate-200 rounded-lg"></div>
                  <div className="h-8 w-20 bg-slate-300 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </nav>

        {/* Render the actual Hero component to complete the illusion */}
        <Hero />
      </motion.div>

      {/* The main content wrapper (text and progress bar) */}
      <div className="flex flex-col items-center z-10 pt-16">
        {/* The FreeCone text — flies to navbar on complete */}
        <motion.div
          ref={textRef}
          animate={controls}
          className="flex justify-center mb-3"
          style={{ transformOrigin: "center center" }}
        >
          {word.split("").map((char, i) => (
            <motion.span
              key={i}
              initial={{ y: 24, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.07, duration: 0.4 }}
              className="text-5xl font-extrabold tracking-tight leading-none text-slate-900"
              style={{ fontFamily: "var(--font-sans)" }}
            >
              {char}
            </motion.span>
          ))}
        </motion.div>

        {/* The Rolling Icon (Tyre) */}
        <motion.div
          initial={{ x: -1000, y: -32, rotate: 0, opacity: 0 }}
          animate={logoControls}
          className="fixed left-1/2 top-1/2 z-[10000]"
          style={{ marginLeft: -15, marginTop: -15 }} // Half of text-3xl (30px)
        >
          <span className="material-symbols-outlined text-primary text-3xl font-bold">hub</span>
        </motion.div>

        {/* Progress bar — same width as text */}
        <motion.div
          animate={barControls}
          className="relative h-[2px] w-64 bg-[#6A6B4C]/15 rounded-full overflow-hidden"
        >
          <motion.div
            className="absolute top-0 left-0 h-full bg-[#6A6B4C] rounded-full"
            style={{ width: `${progress}%` }}
          />
        </motion.div>
      </div>
    </div>
  );
}
