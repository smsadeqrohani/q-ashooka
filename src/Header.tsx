"use client";
import { Link } from "react-router-dom";
import { Authenticated, Unauthenticated } from "convex/react";
import { useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export function Header() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const cartCount = useQuery(api.cart.getCartCount);

  return (
    <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-2xl font-bold text-gray-900 hover:text-indigo-600 transition-colors">
            Ashooka
          </Link>
          <nav className="flex items-center space-x-4">
            <Authenticated>
              <Link
                to="/profile"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Profile
              </Link>
              <Link
                to="/cart"
                className="relative px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors flex items-center gap-2"
              >
                <span>🛒</span>
                {cartCount !== undefined && cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
                Cart
              </Link>
              <span className="text-gray-700">
                Welcome, {loggedInUser?.email ?? "User"}!
              </span>
              {loggedInUser?.isAdmin && (
                <Link
                  to="/dashboard"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Dashboard
                </Link>
              )}
              <Link
                to="/signout"
                className="px-4 py-2 text-gray-700 hover:text-gray-900 transition-colors"
              >
                Sign Out
              </Link>
            </Authenticated>
            <Unauthenticated>
              <Link
                to="/signin"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            </Unauthenticated>
          </nav>
        </div>
      </div>
    </header>
  );
}

