"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { saveProfile } from "../app/actions";

const fieldTitleClass =
  "text-[10px] font-black text-black/40 italic uppercase tracking-widest mb-1 block ml-1";

export default function ProfileForm({ initialData }) {
  const router = useRouter();

  // Initialize state - because we use a 'key' on the parent,
  // this component re-mounts and re-initializes whenever data changes.
  const [username, setUsername] = useState(initialData?.username || "");
  const [bio, setBio] = useState(initialData?.bio || "");

  async function handleAction(formData) {
    // 1. Send to Server
    await saveProfile(formData);

    // 2. Clear local state immediately for instant feedback
    if (!formData.get("username")) setUsername("");
    if (!formData.get("bio")) setBio("");

    // 3. Clear the actual HTML elements
    document.getElementById("profile-form")?.reset();

    // 4. Tell Next.js to fetch fresh data.
    // This will trigger the 'profileResetKey' change in page.js,
    // which unmounts and remounts this form with fresh props.
    router.refresh();
  }

  return (
    <form
      action={handleAction}
      id="profile-form"
      className="space-y-1"
      autoComplete="off"
    >
      <div>
        <label className={fieldTitleClass}>Display Name</label>
        <input
          name="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          autoComplete="off"
          className="w-full p-1 px-2 border-2 border-black/10 rounded bg-[#9bbc0f] text-lg focus:outline-none text-[#0f380f]"
        />
      </div>
      <div>
        <label className={fieldTitleClass}>Bio</label>
        <textarea
          name="bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          autoComplete="off"
          className="w-full p-1 px-2 border-2 border-black/10 rounded h-14 bg-[#9bbc0f] text-lg focus:outline-none text-[#0f380f] resize-none"
        />
      </div>
    </form>
  );
}
