"use client";
import { useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { Link } from "react-router-dom";

export function AdminSetup() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const setUserAsAdmin = useMutation(api.users.setUserAsAdmin);
  const [loading, setLoading] = useState(false);

  const handleSetAdmin = async () => {
    if (!loggedInUser?._id) return;

    setLoading(true);
    try {
      await setUserAsAdmin({
        userId: loggedInUser._id,
        isAdmin: true,
      });
      alert("You are now an admin! Go back to the home page and check the dashboard button.");
    } catch (error) {
      console.error("Failed to set admin:", error);
      alert("Failed to set admin status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
              Ashooka
            </Link>
            <Link
              to="/"
              className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-8">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Admin Setup</h1>
          <p className="text-gray-600 mb-6">
            This is a temporary page to set yourself as an admin for testing purposes.
          </p>

          {loggedInUser ? (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-600">Current user:</p>
                <p className="font-medium">{loggedInUser.email}</p>
                <p className="text-sm text-gray-600">
                  Admin status: {loggedInUser.isAdmin ? "Yes" : "No"}
                </p>
              </div>

              {!loggedInUser.isAdmin && (
                <button
                  onClick={handleSetAdmin}
                  disabled={loading}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? "Setting admin..." : "Make me an admin"}
                </button>
              )}

              {loggedInUser.isAdmin && (
                <Link
                  to="/dashboard"
                  className="block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-center transition-colors"
                >
                  Go to Dashboard
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center">
              <Link
                to="/signin"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In First
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
