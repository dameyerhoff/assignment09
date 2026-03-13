"use client";

// Next.js Error Boundary component that catches runtime errors in its segment
export default function Error({ error, reset }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-4">
      {/* Visual feedback for the error state */}
      <h2 className="text-3xl font-bold text-red-600">Something went wrong!</h2>

      {/* Displays the specific error message provided by the boundary */}
      <p className="text-gray-600 mt-2">{error.message}</p>

      {/* Reset function attempts to re-render the segment to recover from the error */}
      <button
        onClick={() => reset()}
        className="mt-6 px-4 py-2 bg-black text-white rounded-md"
      >
        Try Again
      </button>
    </div>
  );
}
