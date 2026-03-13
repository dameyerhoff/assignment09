// This component automatically renders when a user visits a URL that doesn't exist
export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
      {/* Visual error code for the missing page */}
      <h2 className="text-5xl font-bold text-gray-800">404</h2>

      {/* User-friendly message for a missing route */}
      <p className="text-xl text-gray-600 mt-4">
        Oops! This nut is nowhere to be found. 🐿️
      </p>

      {/* Direct link to return the user to a valid part of the application */}
      <a
        href="/profile"
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
      >
        Back to Profile
      </a>
    </div>
  );
}
