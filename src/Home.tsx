"use client";
import { Link } from "react-router-dom";
import { Authenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { ProductsGrid } from "./ProductsGrid";

export function Home() {
  const loggedInUser = useQuery(api.auth.loggedInUser);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-white/90 backdrop-blur-sm shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-2xl font-bold text-gray-900">ShopHub</h1>
            <nav className="flex items-center space-x-4">
              <Authenticated>
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
              <Link
                to="/signin"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Sign In
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h2 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Discover Amazing Products
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Shop the latest trends and find everything you need in one place.
              Quality products, great prices, and exceptional service.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg">
                Shop Now
              </button>
              <Link
                to="/signin"
                className="px-8 py-4 bg-white text-indigo-600 text-lg font-semibold rounded-lg border-2 border-indigo-600 hover:bg-indigo-50 transition-colors shadow-lg"
              >
                Sign In / Sign Up
              </Link>
            </div>
          </div>

          {/* Products Section */}
          <div className="mt-20">
            <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Our Products
            </h3>
            <ProductsGrid />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h5 className="text-lg font-semibold mb-4">ShopHub</h5>
              <p className="text-gray-400">
                Your one-stop destination for quality products and exceptional shopping experience.
              </p>
            </div>
            <div>
              <h6 className="text-sm font-semibold mb-4 uppercase tracking-wide">
                Customer Service
              </h6>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Returns</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Shipping Info</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              </ul>
            </div>
            <div>
              <h6 className="text-sm font-semibold mb-4 uppercase tracking-wide">
                Company
              </h6>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Press</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            <div>
              <h6 className="text-sm font-semibold mb-4 uppercase tracking-wide">
                Connect
              </h6>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Facebook</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Instagram</a></li>
                <li><a href="#" className="hover:text-white transition-colors">LinkedIn</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ShopHub. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
