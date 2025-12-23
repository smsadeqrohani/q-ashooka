"use client";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Authenticated, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";
import { useEffect, useState } from "react";
import { UserManagement } from "./UserManagement";
import { ProductManagement } from "./ProductManagement";
import { CategoryManagement } from "./CategoryManagement";
import { TagManagement } from "./TagManagement";
import { HomePageManagement } from "./HomePageManagement";

export function Dashboard() {
  const loggedInUser = useQuery(api.auth.loggedInUser);
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState<"overview" | "products" | "categories" | "tags" | "users" | "homepage">("overview");

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (loggedInUser !== undefined) {
      if (!loggedInUser || !loggedInUser.isAdmin) {
        navigate("/");
      }
    }
  }, [loggedInUser, navigate]);

  // Sync active tab with URL
  useEffect(() => {
    const parts = location.pathname.split("/");
    const section = parts[2] as typeof activeTab | undefined;
    if (section === "products" || section === "categories" || section === "tags" || section === "users" || section === "homepage") {
      setActiveTab(section);
    } else {
      setActiveTab("overview");
    }
  }, [location.pathname]);

  if (!loggedInUser || !loggedInUser.isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Link to="/" className="text-xl font-bold text-gray-900 hover:text-gray-700 transition-colors">
                ShopHub
              </Link>
              <span className="text-gray-500">|</span>
              <span className="text-gray-700 font-medium">Admin Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                Welcome, {loggedInUser.email ?? "Admin"}!
              </span>
              <Link
                to="/"
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Back to Store
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your e-commerce store from here.
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
            <button
              onClick={() => {
                navigate("/dashboard");
                setActiveTab("overview");
              }}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "overview"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => {
                navigate("/dashboard/products");
                setActiveTab("products");
              }}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "products"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Products
            </button>
            <button
              onClick={() => {
                navigate("/dashboard/categories");
                setActiveTab("categories");
              }}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "categories"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => {
                navigate("/dashboard/tags");
                setActiveTab("tags");
              }}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "tags"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Tags
            </button>
            <button
              onClick={() => {
                navigate("/dashboard/users");
                setActiveTab("users");
              }}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "users"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              User Management
            </button>
            <button
              onClick={() => {
                navigate("/dashboard/homepage");
                setActiveTab("homepage");
              }}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === "homepage"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Home Page
            </button>
          </nav>
        </div>

        {activeTab === "overview" ? (
          <>
            {/* Dashboard Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-2xl">📦</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Orders</h3>
                <p className="text-2xl font-bold text-blue-600">1,234</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-2xl">💰</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Revenue</h3>
                <p className="text-2xl font-bold text-green-600">$45,678</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-2xl">👥</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Customers</h3>
                <p className="text-2xl font-bold text-purple-600">892</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-2xl">📊</span>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">Products</h3>
                <p className="text-2xl font-bold text-yellow-600">156</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors text-left">
              <div className="flex items-center">
                <span className="text-2xl mr-3">➕</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Add Product</h3>
                  <p className="text-sm text-gray-600">Create a new product listing</p>
                </div>
              </div>
            </button>

            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-400 hover:bg-green-50 transition-colors text-left">
              <div className="flex items-center">
                <span className="text-2xl mr-3">📋</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Manage Orders</h3>
                  <p className="text-sm text-gray-600">View and process orders</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => setActiveTab("users")}
              className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-400 hover:bg-purple-50 transition-colors text-left cursor-pointer"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">👥</span>
                <div>
                  <h3 className="font-semibold text-gray-900">User Management</h3>
                  <p className="text-sm text-gray-600">Manage user accounts</p>
                </div>
              </div>
            </button>

            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors text-left">
              <div className="flex items-center">
                <span className="text-2xl mr-3">📊</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Analytics</h3>
                  <p className="text-sm text-gray-600">View store analytics</p>
                </div>
              </div>
            </button>

            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-red-400 hover:bg-red-50 transition-colors text-left">
              <div className="flex items-center">
                <span className="text-2xl mr-3">⚙️</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Settings</h3>
                  <p className="text-sm text-gray-600">Configure store settings</p>
                </div>
              </div>
            </button>

            <button className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-indigo-400 hover:bg-indigo-50 transition-colors text-left">
              <div className="flex items-center">
                <span className="text-2xl mr-3">📧</span>
                <div>
                  <h3 className="font-semibold text-gray-900">Marketing</h3>
                  <p className="text-sm text-gray-600">Manage marketing campaigns</p>
                </div>
              </div>
            </button>
          </div>
            </div>
          </>
        ) : null}

        {activeTab === "products" && <ProductManagement />}
        {activeTab === "categories" && <CategoryManagement />}
        {activeTab === "tags" && <TagManagement />}
        {activeTab === "users" && <UserManagement />}
        {activeTab === "homepage" && <HomePageManagement />}
      </main>
    </div>
  );
}
