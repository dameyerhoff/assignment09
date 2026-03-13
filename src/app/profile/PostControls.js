"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { deletePost, updatePost, addLike } from "../actions";

export default function PostControls({ post }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post?.content || "");
  const [isDeleting, setIsDeleting] = useState(false);
  const ringAudioRef = useRef(null);

  const handleLike = async (postId) => {
    // Play sound immediately for feedback
    if (!ringAudioRef.current) {
      ringAudioRef.current = new Audio("/ring.mp3");
    }
    ringAudioRef.current.currentTime = 0;
    ringAudioRef.current
      .play()
      .catch((err) => console.log("Audio failed:", err));

    // Call the server action (which handles the 1-like-per-user check)
    await addLike(postId);
  };

  const handleUpdate = async (formData) => {
    await updatePost(formData);
    setIsEditing(false);
  };

  const handleDelete = async (postId) => {
    const confirmed = window.confirm(
      "ARE YOU SURE YOU WANT TO DELETE THIS UPDATE?",
    );
    if (!confirmed) return;

    const audio = new Audio("/loss.mp3");
    audio.play().catch((err) => console.log("Audio playback failed:", err));

    setIsDeleting(true);

    setTimeout(async () => {
      await deletePost(postId);
    }, 150);
  };

  return (
    <div
      className={`transition-all duration-300 ${isDeleting ? "animate-shake opacity-50" : ""}`}
    >
      <div className="bg-[#8bac0f] rounded-xl border-4 border-black/20 p-5 flex gap-4 shadow-[4px_4px_0_rgba(0,0,0,0.2)]">
        <div className="relative w-14 h-14 rounded-lg border-2 border-black/20 overflow-hidden bg-[#9bbc0f] shrink-0">
          <Image
            src={post.avatar_url || "/sonic-icon.png"}
            alt="User"
            fill
            className="object-cover"
          />
        </div>

        <div className="grow">
          <div className="flex justify-between items-start mb-1">
            <span className="font-['VT323'] text-xl text-[#0f380f] uppercase leading-none tracking-tight">
              {post.username || "Unknown Hero"}
            </span>
            <div className="flex flex-col items-end gap-1">
              <span className="text-[10px] font-black text-[#0f380f]/40 italic uppercase">
                {new Date(post.created_at).toLocaleDateString()}
              </span>
              <button
                onClick={() => handleLike(post.id)}
                className="flex items-center gap-1.5 bg-[#9bbc0f] hover:bg-[#a7c90f] px-2 py-0.5 rounded border border-black/30 transition-transform active:scale-95 shadow-[1px_1px_0_rgba(0,0,0,0.1)]"
              >
                <img
                  src="/sonic-ring.gif"
                  className="w-4 h-4 object-contain"
                  alt="Ring"
                />
                <span className="font-['VT323'] text-[#0f380f] text-sm leading-none uppercase font-bold">
                  LIKE
                </span>
                <span className="font-['VT323'] text-[#0f380f] text-lg leading-none">
                  {post.likes || 0}
                </span>
              </button>
            </div>
          </div>

          {isEditing ? (
            <form action={handleUpdate} className="flex flex-col gap-2">
              <input type="hidden" name="postId" value={post.id} />
              <textarea
                name="content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full p-2 border-2 border-black/10 rounded bg-[#9bbc0f] font-['VT323'] text-lg text-[#0f380f] focus:outline-none resize-none"
                rows="2"
              />
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-[#0054B4] text-white px-3 py-1 rounded-full text-[10px] font-black italic uppercase shadow-[2px_2px_0_#000] active:translate-y-px"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="bg-[#6B6D74] text-white px-3 py-1 rounded-full text-[10px] font-black italic uppercase shadow-[2px_2px_0_#000] active:translate-y-px"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <p className="font-['VT323'] text-2xl text-[#0f380f] leading-tight wrap-break-word">
              {post.content}
            </p>
          )}

          <div className="flex gap-4 mt-3">
            <button
              onClick={() => setIsEditing(true)}
              className="text-[10px] font-black text-[#0f380f]/60 uppercase italic hover:text-[#0f380f] transition-colors"
            >
              [ Edit ]
            </button>
            <button
              onClick={() => handleDelete(post.id)}
              className="text-[10px] font-black text-red-800/60 uppercase italic hover:text-red-600 transition-colors"
            >
              [ Delete ]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
