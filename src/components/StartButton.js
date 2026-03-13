"use client";

import { useSyncExternalStore } from "react";

// Minimal subscribe function to satisfy the useSyncExternalStore API
function subscribe() {
  return () => {};
}

// A reusable button that plays a "Ring" sound and can trigger forms remotely
export default function StartButton({
  className,
  children,
  type = "submit",
  form,
  ...props
}) {
  // Hydration check: ensures browser-only APIs (like Audio) don't run during Server Side Rendering
  const isClient = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );

  // Plays the iconic Sonic ring sound effect upon clicking
  const playRing = () => {
    const audio = new Audio("/ring.mp3");
    audio.play().catch((err) => console.log("Audio play error:", err));
  };

  // SSR Fallback: Renders a standard button without event listeners to prevent hydration mismatches
  if (!isClient) {
    return (
      <button type={type} form={form} className={className} {...props}>
        {children}
      </button>
    );
  }

  return (
    <button
      type={type}
      form={form} // Links this button to a specific <form id="..."> elsewhere in the DOM
      className={className}
      onClick={playRing}
      {...props}
    >
      {children}
    </button>
  );
}
