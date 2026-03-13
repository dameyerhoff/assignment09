"use client";

import { useSyncExternalStore } from "react";

// Empty subscribe function for the hydration check
function subscribe() {
  return () => {};
}

export default function DeleteButton({
  onDelete,
  onTriggerShake,
  className,
  children,
}) {
  // Hydration check: Ensures the component knows it's on the client before using browser APIs like window.confirm or Audio
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  // Orchestrates the "Damage" sequence: confirmation, shake, sound, and finally the actual deletion
  const handleDeleteClick = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to lose your rings?",
    );

    if (confirmed) {
      // 1. Trigger the visual shake in the parent (e.g., shaking the post container)
      if (onTriggerShake) onTriggerShake();

      // 2. Play the "Loss" sound effect
      const audio = new Audio("/loss.mp3");
      audio.volume = 1.0;

      try {
        await audio.play();
        console.log("Sonic Social: Loss sound playing...");
      } catch (err) {
        console.warn("Audio failed, but proceeding with delete.");
      }

      // 3. Delay the actual database removal so the user sees/hears the effect
      setTimeout(() => {
        if (onDelete) onDelete();
      }, 600); // Slightly longer delay for maximum impact
    }
  };

  // Render a standard button during SSR to prevent hydration mismatch
  if (!isClient)
    return (
      <button type="button" className={className}>
        {children}
      </button>
    );

  return (
    <button type="button" onClick={handleDeleteClick} className={className}>
      {children}
    </button>
  );
}
