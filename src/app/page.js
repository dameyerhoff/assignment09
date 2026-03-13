"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useUser, useClerk } from "@clerk/nextjs";

export default function HomePage() {
  const router = useRouter();
  const { isSignedIn } = useUser();
  const { openSignIn } = useClerk();
  const audioRef = useRef(null);

  // PRE-LOAD THE AUDIO FOR ZERO LATENCY
  useEffect(() => {
    audioRef.current = new Audio("/sega.mp3");
    audioRef.current.load();
  }, []);

  const handlePressStart = () => {
    // 1. Play the "SE-GA!" sound instantly
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play().catch((err) => console.log("Audio failed:", err));
    }

    // 2. The Decision Logic: Feed vs. Login Box
    if (isSignedIn) {
      router.push("/profile");
    } else {
      // This triggers the actual Clerk modal popup
      openSignIn({ afterSignInUrl: "/profile" });
    }
  };

  // Your Magenta Mechanical Button Style (3D Depth + Hover states)
  const magentaBtnClass =
    "relative overflow-hidden bg-[#8b1d56] bg-[radial-gradient(circle_at_30%_30%,#b53b7a_0%,#8b1d56_60%,#5e133a_100%)] text-[#ffccff] px-8 py-3.5 rounded-full font-black uppercase italic tracking-tighter border-4 border-[#5e133a]/80 shadow-[0_6px_0_#000,inset_0_2px_4px_rgba(255,255,255,0.3)] active:shadow-[inset_0_2px_2px_rgba(0,0,0,0.8)] active:translate-y-1 active:scale-95 transition-all duration-75 before:absolute before:top-0 before:left-0 before:w-full before:h-1/2 before:bg-white/10 before:pointer-events-none text-xl inline-block cursor-pointer outline-none";

  return (
    <div
      className="min-h-screen bg-fixed bg-cover bg-center font-sans antialiased overflow-hidden flex flex-col items-center justify-start pt-8 pb-4"
      style={{
        backgroundImage:
          "linear-gradient(rgba(0,0,0,0.3), rgba(0,0,0,0.3)), url('/background.jpg')",
      }}
    >
      {/* 16-BIT SCANLINE OVERLAY */}
      <div className="fixed inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.1)_50%),linear-gradient(90deg,rgba(255,0,0,0.02),rgba(0,255,0,0.01),rgba(0,0,118,0.02))] bg-[length:100%_4px,3px_100%] z-50"></div>

      <main className="relative flex flex-col items-center justify-center scale-95">
        {/* CHARACTER: KNUCKLES (LEFT) - Heavy 2.5s Bounce */}
        <div className="absolute -left-36 top-1/2 -translate-y-1/2 z-20 animate-[bounce_2.5s_infinite_ease-in-out] opacity-95 hover:scale-110 transition-transform duration-300 drop-shadow-[0_12px_12px_rgba(0,0,0,0.5)] hidden md:block">
          <Image
            src="/knuckles.png"
            alt="Knuckles"
            width={110}
            height={110}
            className="object-contain"
            priority
          />
        </div>

        {/* CHARACTER: TAILS (RIGHT) - 1.8s Bounce & Balanced Gap */}
        <div className="absolute -right-[155px] top-1/2 -translate-y-1/2 z-20 animate-[bounce_1.8s_infinite_ease-in-out] opacity-95 hover:scale-110 transition-transform duration-300 drop-shadow-[0_12px_12px_rgba(0,0,0,0.5)] hidden md:block">
          <Image
            src="/tails.png"
            alt="Tails"
            width={140}
            height={140}
            className="object-contain"
            priority
          />
        </div>

        {/* THE MAIN SOCIAL BOX */}
        <div className="bg-[#0054B4]/90 backdrop-blur-md p-7 rounded-[2.2rem] border-[6px] border-blue-900 shadow-[12px_12px_0px_rgba(0,0,0,0.4)] text-center relative z-30 w-[380px]">
          <div className="mb-5">
            <h1 className="text-5xl font-black text-white italic uppercase tracking-tighter drop-shadow-[3px_3px_0px_#002d5f] leading-none">
              Sonic
              <span className="block text-xl text-blue-200 tracking-[0.2em] mt-1">
                Social
              </span>
            </h1>
          </div>
          <div className="flex flex-col items-center gap-5 relative z-10 pb-2">
            <button onClick={handlePressStart} className={magentaBtnClass}>
              {isSignedIn ? "ENTER ZONE" : "PRESS START"}
            </button>
            <p className="text-blue-100 font-bold uppercase tracking-[0.3em] text-[9px] animate-pulse">
              © SEGA 1991-2026
            </p>
          </div>
        </div>
      </main>

      {/* CHARACTER: SONIC - Fast 1.2s Bounce at Bottom */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 pointer-events-none">
        <div className="animate-[bounce_1.2s_infinite_ease-in-out]">
          <Image
            src="/sonic.png"
            alt="Sonic"
            width={150}
            height={150}
            className="object-contain drop-shadow-[0_20px_20px_rgba(0,0,0,0.6)]"
            priority
          />
        </div>
      </div>

      {/* FLOOR DECORATION BARS */}
      <div className="fixed bottom-0 left-0 w-full h-3 bg-yellow-400 border-t-2 border-black z-40"></div>
      <div className="fixed bottom-3 left-0 w-full h-3 bg-red-600 border-t-2 border-black z-40"></div>
    </div>
  );
}
