"use client";

import { useState, useEffect } from "react";
import { saveProfile } from "../app/actions";
import StartButton from "./StartButton";

const fieldTitleClass =
  "text-[10px] font-black text-black/40 italic uppercase tracking-widest mb-1 block ml-1";

const magentaBtnClass =
  "relative bg-[#A82B61] text-white rounded-full font-black uppercase italic tracking-tighter border-2 border-[#5e133a] shadow-[0_6px_0_#222] active:translate-y-[4px] active:shadow-[0_2px_0_#000] transition-all disabled:opacity-50 disabled:grayscale mt-4 mb-2";

export default function ProfileForm({ initialData }) {
  const [username, setUsername] = useState(initialData?.username || "");
  const [bio, setBio] = useState(initialData?.bio || "");
  const [isPending, setIsPending] = useState(false);

  // Sync state if initialData changes from the server
  useEffect(() => {
    setUsername(initialData?.username || "");
    setBio(initialData?.bio || "");
  }, [initialData]);

  async function handleAction(formData) {
    if (isPending) return;
    setIsPending(true);

    try {
      // Calls the server action from actions.js
      await saveProfile(formData);
    } catch (error) {
      console.error("Failed to save profile:", error);
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form
      id="profile-form"
      action={handleAction}
      className={`space-y-1 transition-all duration-300 h-full flex flex-col ${
        isPending ? "opacity-40 grayscale pointer-events-none" : ""
      }`}
      autoComplete="off"
    >
      <div className="relative">
        <label className={fieldTitleClass}>Display Name</label>
        <input
          name="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="ENTER NAME..."
          className="w-full p-1 px-2 border-2 border-black/10 rounded bg-[#9bbc0f] text-lg focus:outline-none text-[#0f380f] placeholder:text-[#0f380f]/30"
        />
      </div>

      <div className="relative grow">
        <label className={fieldTitleClass}>Bio</label>
        <textarea
          name="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="ENTER BIO..."
          className="w-full p-1 px-2 border-2 border-black/10 rounded h-14 bg-[#9bbc0f] text-lg focus:outline-none text-[#0f380f] resize-none placeholder:text-[#0f380f]/30"
        />
      </div>

      <StartButton
        type="submit"
        className={`${magentaBtnClass} w-full py-2 uppercase text-[10px]`}
      >
        {isPending ? "SYNCING..." : "SAVE CHANGES"}
      </StartButton>

      {/* ZONE TRANSITION OVERLAY */}
      {isPending && (
        <div className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-black/80 text-[#8bac0f] font-['VT323'] text-xl px-4 py-1 border-2 border-[#8bac0f] animate-pulse">
            SAVING ZONE DATA...
          </div>
        </div>
      )}
    </form>
  );
}
