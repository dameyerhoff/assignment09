"use client";

export default function RingCounter({ ringCount }) {
  const handleRingClick = () => {
    alert(
      "RING LOGISTICS:\n\n" +
        "• Earn 1 ring for each post you add.\n" +
        "• Earn 1 ring each time a user likes your post.",
    );
  };

  return (
    <button
      onClick={handleRingClick}
      className="flex items-center gap-3 bg-black/40 pl-2 pr-5 py-1 rounded-full border-2 border-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.3)] hover:scale-105 transition-transform active:scale-95 cursor-help"
    >
      <img
        src="/sonic-ring.gif"
        alt="Ring"
        className="w-9 h-9 aspect-square object-contain"
        style={{ imageRendering: "pixelated" }}
      />
      <div className="flex items-baseline gap-1.5">
        <span className="text-yellow-400 font-black italic text-base tracking-tighter drop-shadow-[0_2px_0_rgba(0,0,0,1)]">
          RINGS
        </span>
        <span className="text-white font-black text-2xl min-w-[1.5ch] leading-none drop-shadow-[0_2px_0_rgba(0,0,0,1)]">
          {ringCount}
        </span>
      </div>
    </button>
  );
}
